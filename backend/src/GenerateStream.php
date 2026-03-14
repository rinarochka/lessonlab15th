<?php
declare(strict_types=1);

namespace App;

final class GenerateStream
{
    public static function handle(array $config, ?array $body = null): void
    {
        $apiKey = trim((string)($config['gemini']['api_key'] ?? ''));
        $model  = trim((string)($config['gemini']['model'] ?? 'gemini-2.5-flash'));

        $data = is_array($body) ? $body : [];
        if (!$data) {
            $raw = file_get_contents('php://input') ?: '';
            $tmp = json_decode($raw, true);
            $data = is_array($tmp) ? $tmp : [];
        }

        $prompt = trim((string)($data['prompt'] ?? ''));
        if ($prompt === '') {
            http_response_code(400);
            header('Content-Type: text/plain; charset=utf-8');
            echo "No prompt";
            return;
        }

        self::sseHeaders();
        header('X-Accel-Buffering: no');

        if ($apiKey === '') {
            self::sendEvent(['type' => 'error', 'message' => 'Gemini API key is empty']);
            self::sendEvent(['type' => 'done']);
            self::flushNow();
            return;
        }

        if ($model === '' || str_contains($model, '/')) {
            $model = 'gemini-2.5-flash';
        }

        // ВАЖНО: используем обычный generateContent, НЕ streamGenerateContent
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/'
            . rawurlencode($model)
            . ':generateContent';

        $payloadArr = [
            'contents' => [
                [
                    'role'  => 'user',
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'temperature' => 0.7,
            ],
        ];

        $payload = json_encode($payloadArr, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($payload === false) {
            self::sendEvent(['type' => 'error', 'message' => 'Failed to encode Gemini payload']);
            self::sendEvent(['type' => 'done']);
            self::flushNow();
            return;
        }

        $cafile = (string)($config['ssl']['cafile'] ?? '');

        $ch = curl_init($url);

        $opts = [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-goog-api-key: ' . $apiKey,
            ],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 120,
            CURLOPT_CONNECTTIMEOUT => 30,
        ];

        if ($cafile !== '' && is_file($cafile)) {
            $opts[CURLOPT_CAINFO] = $cafile;
            @putenv('SSL_CERT_FILE=' . $cafile);
        }

        curl_setopt_array($ch, $opts);

        $response = curl_exec($ch);

        if ($response === false) {
            $err = curl_error($ch);
            @curl_close($ch);

            self::sendEvent([
                'type' => 'error',
                'message' => $err !== '' ? $err : 'curl_exec failed',
            ]);
            self::sendEvent(['type' => 'done']);
            self::flushNow();
            return;
        }

        $httpCode = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        @curl_close($ch);

        if ($httpCode >= 400) {
            $decodedError = json_decode($response, true);
            $msg = "Gemini HTTP {$httpCode}";
            if (!empty($decodedError['error']['message'])) {
                $msg .= ': ' . $decodedError['error']['message'];
            }

            self::sendEvent(['type' => 'error', 'message' => $msg]);
            self::sendEvent(['type' => 'done']);
            self::flushNow();
            return;
        }

        $obj = json_decode($response, true);
        if (!is_array($obj)) {
            self::sendEvent([
                'type' => 'error',
                'message' => 'Invalid JSON from Gemini: ' . mb_substr($response, 0, 500),
            ]);
            self::sendEvent(['type' => 'done']);
            self::flushNow();
            return;
        }

        $text = self::extractText($obj);

        if ($text === '') {
            $debug = json_encode($obj, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            self::sendEvent([
                'type' => 'error',
                'message' => 'Gemini returned no text. Raw: ' . mb_substr((string)$debug, 0, 1000),
            ]);
            self::sendEvent(['type' => 'done']);
            self::flushNow();
            return;
        }

        self::sendEvent(['type' => 'delta', 'text' => $text]);
        self::sendEvent(['type' => 'done']);
        self::flushNow();
    }

    private static function extractText(array $obj): string
    {
        $parts = $obj['candidates'][0]['content']['parts'] ?? null;
        if (!is_array($parts)) {
            return '';
        }

        $out = '';
        foreach ($parts as $part) {
            if (is_array($part) && isset($part['text']) && is_string($part['text'])) {
                $out .= $part['text'];
            }
        }

        return trim($out);
    }

    private static function sseHeaders(): void
    {
        http_response_code(200);
        header('Content-Type: text/event-stream; charset=utf-8');
        header('Cache-Control: no-cache, no-transform');
        header('Connection: keep-alive');

        @ini_set('output_buffering', 'off');
        @ini_set('zlib.output_compression', '0');
        @ini_set('implicit_flush', '1');

        while (ob_get_level() > 0) {
            @ob_end_flush();
        }

        @ob_implicit_flush(true);
    }

    private static function sendEvent(array $data): void
    {
        echo 'data: ' . json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n\n";
    }

    private static function flushNow(): void
    {
        @ob_flush();
        @flush();
    }
}