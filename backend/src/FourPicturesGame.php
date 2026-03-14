<?php
declare(strict_types=1);

namespace App;

final class FourPicturesGame
{
    private const MAX_TOTAL_SECONDS = 20.0;

    public static function handle(array $config, array $body): void
    {
        @set_time_limit(60);

        $startedAt = microtime(true);

        $topic = trim((string)($body['topic'] ?? ''));
        $subject = trim((string)($body['subject'] ?? ''));
        $grade = trim((string)($body['grade'] ?? ''));
        $lang = strtoupper(trim((string)($body['lang'] ?? 'RU')));

        if ($topic === '') {
            self::error('Topic is required', 400);
        }

        $attempts = 2;

        for ($i = 1; $i <= $attempts; $i++) {
            if (self::isOutOfTime($startedAt)) {
                break;
            }

            $gemini = self::generateGameData($config, $topic, $subject, $grade, $lang, $i, $startedAt);

            if (
                empty($gemini['answer']) ||
                empty($gemini['imageQueriesEn']) ||
                !is_array($gemini['imageQueriesEn'])
            ) {
                continue;
            }

            $queries = array_values(array_filter(array_map('trim', $gemini['imageQueriesEn'])));
            $searchLabel = trim((string)($gemini['searchLabelEn'] ?? ''));
            $avoidTerms = (array)($gemini['avoidTerms'] ?? []);

            $images = self::collectImages($queries, $searchLabel, $avoidTerms, $startedAt);

            if (count($images) >= 4) {
                self::ok([
                    'topic' => $topic,
                    'subject' => $subject,
                    'grade' => $grade,
                    'answer' => trim((string)$gemini['answer']),
                    'acceptedAnswers' => array_values(array_unique(array_filter(array_map('trim', (array)($gemini['acceptedAnswers'] ?? []))))),
                    'clue' => trim((string)($gemini['clue'] ?? $topic)),
                    'images' => array_slice($images, 0, 4),
                ]);
            }
        }

        self::error('Could not generate 4 matching pictures in time. Try another topic.', 502);
    }

    private static function generateGameData(
        array $config,
        string $topic,
        string $subject,
        string $grade,
        string $lang,
        int $attempt,
        float $startedAt
    ): array {
        if (self::isOutOfTime($startedAt)) {
            return [];
        }

        $apiKey = trim((string)($config['gemini']['api_key'] ?? ''));
        $model  = trim((string)($config['gemini']['model'] ?? 'gemini-2.5-flash'));

        if ($apiKey === '') {
            self::error('Gemini API key is empty', 500);
        }

        if ($model === '' || str_contains($model, '/')) {
            $model = 'gemini-2.5-flash';
        }

        $extraInstruction = $attempt > 1
            ? 'Previous attempt was not visual enough. Choose an even more everyday, photo-friendly noun.'
            : '';

        $prompt = <<<PROMPT
Return JSON only.
Create one classroom round for a "4 pictures 1 word" game.

User context:
- Topic: {$topic}
- Subject: {$subject}
- Grade: {$grade}
- Interface language: {$lang}

STRICT RULES:
- Choose ONE simple, concrete, everyday, highly visual noun related to the topic.
- It must be easy to find in many real internet photos.
- Do NOT choose abstract scientific terms, element names, formulas, processes, or microscopic objects.
- Prefer animals, foods, plants, body parts, objects, places, weather, transport, clothing, furniture, or natural things.
- The answer should be one word in the interface language.
- Accepted answers: 1 to 3 max.
- Provide exactly 4 short English image queries for real photos of the SAME thing in different scenes.
- Avoid brands, logos, icons, cartoons, drawings, diagrams, symbols, fictional characters.

{$extraInstruction}

JSON schema:
{
  "answer": "...",
  "acceptedAnswers": ["..."],
  "clue": "...",
  "searchLabelEn": "...",
  "imageQueriesEn": ["...", "...", "...", "..."],
  "avoidTerms": ["logo", "icon", "cartoon", "illustration", "drawing", "diagram", "symbol"]
}
PROMPT;

        $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent';
        $payload = [
            'contents' => [[
                'role' => 'user',
                'parts' => [['text' => $prompt]],
            ]],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'temperature' => 0.8,
            ],
        ];

        $res = self::curlJson(
            $url,
            [
                'Content-Type: application/json',
                'x-goog-api-key: ' . $apiKey,
            ],
            json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '{}',
            $config,
            10,
            5
        );

        if ($res['status'] >= 400) {
            $msg = 'Gemini HTTP ' . $res['status'];
            if (is_array($res['json']) && !empty($res['json']['error']['message'])) {
                $msg .= ': ' . $res['json']['error']['message'];
            }
            self::error($msg, 502);
        }

        $text = self::extractGeminiText((array)$res['json']);
        if ($text === '') {
            return [];
        }

        $json = json_decode($text, true);
        if (!is_array($json)) {
            return [];
        }

        return $json;
    }

    private static function collectImages(array $queries, string $searchLabelEn, array $avoidTerms, float $startedAt): array
    {
        $images = [];
        $usedUrls = [];

        $avoid = array_map(
            static fn($v) => mb_strtolower((string)$v),
            array_merge($avoidTerms, ['logo', 'icon', 'cartoon', 'illustration', 'drawing', 'diagram', 'symbol', 'svg'])
        );

        $fallbackQueries = array_values(array_filter([
            $searchLabelEn,
            $searchLabelEn . ' photo',
        ]));

        $allQueries = array_slice(
            array_values(array_unique(array_filter(array_merge($queries, $fallbackQueries)))),
            0,
            6
        );

        foreach ($allQueries as $query) {
            if (self::isOutOfTime($startedAt)) {
                break;
            }

            $results = self::searchCommonsImages((string)$query, $startedAt);

            foreach ($results as $image) {
                $url = trim((string)($image['url'] ?? ''));
                $title = trim((string)($image['title'] ?? ''));
                $description = trim((string)($image['description'] ?? ''));
                $check = mb_strtolower($title . ' ' . $description);

                if ($url === '' || isset($usedUrls[$url])) {
                    continue;
                }

                if (!preg_match('~\.(jpe?g|png|webp)(\?|$)~i', $url)) {
                    continue;
                }

                $blocked = false;
                foreach ($avoid as $term) {
                    if ($term !== '' && mb_strpos($check, $term) !== false) {
                        $blocked = true;
                        break;
                    }
                }

                if ($blocked) {
                    continue;
                }

                $usedUrls[$url] = true;
                $images[] = $image;

                if (count($images) >= 4) {
                    return $images;
                }
            }
        }

        return $images;
    }

    private static function searchCommonsImages(string $query, float $startedAt): array
    {
        $query = trim($query);
        if ($query === '' || self::isOutOfTime($startedAt)) {
            return [];
        }

        $variants = array_values(array_unique(array_filter([
            $query,
            '"' . $query . '"',
        ])));

        $all = [];
        $seen = [];

        foreach ($variants as $variant) {
            if (self::isOutOfTime($startedAt)) {
                break;
            }

            $params = http_build_query([
                'action' => 'query',
                'format' => 'json',
                'generator' => 'search',
                'gsrsearch' => $variant,
                'gsrnamespace' => 6,
                'gsrlimit' => 8,
                'prop' => 'imageinfo|info',
                'iiprop' => 'url|mime',
                'iiurlwidth' => 900,
                'inprop' => 'url',
                'origin' => '*',
            ]);

            $url = 'https://commons.wikimedia.org/w/api.php?' . $params;
            $res = self::curlJson($url, ['Accept: application/json'], null, [], 6, 3);

            if ($res['status'] >= 400 || !is_array($res['json'])) {
                continue;
            }

            $pages = $res['json']['query']['pages'] ?? [];
            if (!is_array($pages)) {
                continue;
            }

            foreach ($pages as $page) {
                if (!is_array($page)) {
                    continue;
                }

                $ii = $page['imageinfo'][0] ?? null;
                if (!is_array($ii)) {
                    continue;
                }

                $mime = (string)($ii['mime'] ?? '');
                if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
                    continue;
                }

                $imgUrl = (string)($ii['thumburl'] ?? $ii['url'] ?? '');
                if ($imgUrl === '' || isset($seen[$imgUrl])) {
                    continue;
                }

                $seen[$imgUrl] = true;

                $all[] = [
                    'title' => (string)($page['title'] ?? ''),
                    'url' => $imgUrl,
                    'sourcePage' => (string)($page['fullurl'] ?? ''),
                    'description' => (string)($page['title'] ?? ''),
                ];

                if (count($all) >= 12) {
                    return $all;
                }
            }
        }

        return $all;
    }

    private static function extractGeminiText(array $obj): string
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

    private static function curlJson(
        string $url,
        array $headers,
        ?string $postBody,
        array $config,
        int $timeout = 8,
        int $connectTimeout = 4
    ): array {
        $cafile = (string)($config['ssl']['cafile'] ?? '');
        $ch = curl_init($url);

        $opts = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_CONNECTTIMEOUT => $connectTimeout,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_USERAGENT => 'LessonLab/1.0',
        ];

        if ($postBody !== null) {
            $opts[CURLOPT_POST] = true;
            $opts[CURLOPT_POSTFIELDS] = $postBody;
        }

        if ($cafile !== '' && is_file($cafile)) {
            $opts[CURLOPT_CAINFO] = $cafile;
            @putenv('SSL_CERT_FILE=' . $cafile);
        } else {
            $opts[CURLOPT_SSL_VERIFYPEER] = false;
            $opts[CURLOPT_SSL_VERIFYHOST] = 0;
        }

        curl_setopt_array($ch, $opts);
        $raw = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $err = curl_error($ch);
        curl_close($ch);

        if ($raw === false) {
            return [
                'status' => $status > 0 ? $status : 599,
                'raw' => '',
                'json' => null,
                'error' => $err !== '' ? $err : 'HTTP request failed',
            ];
        }

        $json = json_decode((string)$raw, true);

        return [
            'status' => $status,
            'raw' => (string)$raw,
            'json' => is_array($json) ? $json : null,
            'error' => null,
        ];
    }

    private static function isOutOfTime(float $startedAt): bool
    {
        return (microtime(true) - $startedAt) >= self::MAX_TOTAL_SECONDS;
    }

    private static function ok(array $data): void
    {
        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => true] + $data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    private static function error(string $message, int $status = 400): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok' => false,
            'error' => $message,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}