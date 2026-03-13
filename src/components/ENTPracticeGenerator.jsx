import React, { useState } from "react";
import { buildENTPrompt } from "../lib/prompt/examPrompts";
import { generateAIPrompt } from "../services/aiService";

const ENT_SUBJECTS = [
  // Обязательные
  "Математическая грамотность",
  "Грамотность чтения",
  "История Казахстана",
  // Профильные
  "Математика",
  "Физика",
  "Биология",
  "Химия",
  "География",
  "Всемирная история",
  "Английский язык",
  "Немецкий язык",
  "Французский язык",
  "Информатика",
  "Қазақ тілі",
  "Русский язык",
  "Литература",
  "Право",
  "Основы предпринимательства",
];

const DIFFICULTIES = [
  { value: "easy", label: "Лёгкий" },
  { value: "medium", label: "Средний" },
  { value: "hard", label: "Сложный" },
];

export default function ENTPracticeGenerator() {
  const [exam, setExam] = useState("ENT");
  const [subject, setSubject] = useState(ENT_SUBJECTS[0]);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [error, setError] = useState(null);

  const generateAI = async (prompt) => {
    const { raw, json } = await generateAIPrompt(prompt);
    return { raw, json };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGenerated(null);

    try {
      const prompt = buildENTPrompt(subject, difficulty, questionCount);
      const { raw, json } = await generateAI(prompt);

      if (!json || !Array.isArray(json.questions)) {
        throw new Error("AI returned invalid format. Expected {questions:[...]}.");
      }

      const normalized = json.questions.map((q, idx) => {
        const options = Array.isArray(q.options) ? q.options : [];
        const answer = typeof q.answer === "string" ? q.answer.trim().toUpperCase() : "";
        return {
          question: q.question || "",
          options: options.slice(0, 5),
          answer,
          index: idx,
        };
      });

      const answers = normalized.map((q) => q.answer);

      setGenerated({ raw, questions: normalized, answers });
    } catch (e) {
      console.error(e);
      setError(e.message || "Ошибка генерации");
    } finally {
      setLoading(false);
    }
  };

  const renderQuestions = () => {
    if (!generated) return null;
    if (!generated.questions?.length) {
      return <div className="text-sm text-red-500">Нет вопросов для отображения.</div>;
    }

    return (
      <div className="space-y-6">
        {generated.questions.map((q) => (
          <div key={q.index} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <div className="font-bold mb-2">{`${q.index + 1}. ${q.question}`}</div>
            <div className="grid grid-cols-1 gap-2">
              {q.options.map((opt, i) => {
                const letter = String.fromCharCode(65 + i);
                const isCorrect = showAnswers && letter === q.answer;
                return (
                  <div
                    key={letter}
                    className={`p-3 rounded-lg border ${
                      isCorrect
                        ? "bg-green-200 border-green-400"
                        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                    }`}
                  >
                    <span className="font-bold mr-2">{letter}.</span>
                    {opt}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {showAnswers && generated.answers?.length ? (
          <div className="mt-8 p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <h3 className="font-black mb-2">Ключ ответов</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {generated.answers.map((a, idx) => (
                <div key={idx} className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-700">
                  <span className="font-bold mr-2">{idx + 1}.</span>
                  {a || "-"}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0_0_#000] w-full">
      <h2 className="text-2xl font-black uppercase mb-6">Создать тренировочный тест (ЕНТ)</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-bold text-xs uppercase tracking-widest mb-2 block">Экзамен</label>
          <select
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
          >
            <option value="ENT">ЕНТ</option>
          </select>
        </div>

        <div>
          <label className="font-bold text-xs uppercase tracking-widest mb-2 block">Предмет</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
          >
            {ENT_SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-xs uppercase tracking-widest mb-2 block">Сложность</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-xs uppercase tracking-widest mb-2 block">Количество вопросов</label>
          <input
            type="number"
            min={5}
            max={50}
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full py-4 font-black uppercase rounded-2xl text-white ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-500"
        }`}
      >
        {loading ? "ГЕНЕРАЦИЯ..." : "Создать тренировочный тест"}
      </button>

      {error ? (
        <div className="mt-6 text-sm text-red-500">{error}</div>
      ) : null}

      {generated ? (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold">Вопросы с вариантами</div>
            <button
              onClick={() => setShowAnswers((prev) => !prev)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-500"
            >
              {showAnswers ? "Скрыть ответы" : "Показать ответы"}
            </button>
          </div>
          {renderQuestions()}
        </div>
      ) : null}
    </div>
  );
}
