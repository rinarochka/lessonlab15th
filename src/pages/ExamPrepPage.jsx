import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Target, BookOpen, Brain, Award } from "lucide-react";
import { tr } from "../lib/i18n";
import Header from "../components/Header";
import ENTPracticeGenerator from "../components/ENTPracticeGenerator";
import { generateAIPrompt } from "../services/aiService";
import { generateIELTS, generateSAT, generateENT, buildENTPrompt } from "../lib/prompt/examPrompts";

const ExamPrepPage = ({ lang, setLang, user, setUser, ...accessProps }) => {
  const [form, setForm] = useState({
    examType: "UNT",
    subject: "Математическая грамотность",
    difficulty: "medium",
    totalQuestions: 20
  });

  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGenerated(null);

    try {
      const prompt =
        form.examType === "IELTS"
          ? generateIELTS(form.subject, form.difficulty, form.totalQuestions, lang)
          : form.examType === "SAT"
          ? generateSAT(form.subject, form.difficulty, form.totalQuestions, lang)
          : buildENTPrompt(form.subject, form.difficulty, form.totalQuestions, lang);

      const { raw, json } = await generateAIPrompt(prompt);
      const answers = Array.isArray(json.questions)
        ? json.questions.map(q => (typeof q.answer === 'string' ? q.answer.trim().toUpperCase() : ''))
        : [];

      setGenerated({ raw, json, examType: form.examType, section: form.subject, answers });
    } catch (e) {
      console.error(e);
      setError(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset subject when exam type changes
    if (form.examType === "IELTS") setForm((f) => ({ ...f, subject: "Reading" }));
    if (form.examType === "SAT") setForm((f) => ({ ...f, subject: "Math" }));
    if (form.examType === "UNT") setForm((f) => ({ ...f, subject: "Математическая грамотность" }));
  }, [form.examType]);

  const renderGenerated = () => {
    if (!generated) return null;
    const json = generated.json;
    if (!json) {
      return <pre className="whitespace-pre-wrap text-xs">{generated.raw}</pre>;
    }

    // IELTS / SAT reading-style
    if (json.passage && Array.isArray(json.questions)) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="font-black mb-2">Passage</h3>
            <p className="whitespace-pre-wrap text-sm">{json.passage}</p>
          </div>
          <div>
            <h3 className="font-black mb-2">Questions</h3>
            <ol className="list-decimal list-inside space-y-4">
              {json.questions.map((q, idx) => (
                <li key={idx} className="space-y-2">
                  <div className="font-bold">{q.question}</div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {Array.isArray(q.options)
                      ? q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`px-3 py-2 rounded-lg border ${
                              q.answer === String.fromCharCode(65 + oi)
                                ? "bg-green-200 border-green-400"
                                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                            }`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </div>
                        ))
                      : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      );
    }

    // IELTS Writing
    if (json.task) {
      return (
        <div className="space-y-4">
          <div className="font-black">Task</div>
          <div className="whitespace-pre-wrap">{json.task}</div>
          {json.instructions ? (
            <>
              <div className="font-black">Instructions</div>
              <div className="whitespace-pre-wrap">{json.instructions}</div>
            </>
          ) : null}
        </div>
      );
    }

    // IELTS Listening
    if (json.dialog && Array.isArray(json.questions)) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="font-black mb-2">Dialog</h3>
            <p className="whitespace-pre-wrap text-sm">{json.dialog}</p>
          </div>
          <div>
            <h3 className="font-black mb-2">Questions</h3>
            <ol className="list-decimal list-inside space-y-4">
              {json.questions.map((q, idx) => (
                <li key={idx} className="space-y-2">
                  <div className="font-bold">{q.question}</div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {Array.isArray(q.options)
                      ? q.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className={`px-3 py-2 rounded-lg border ${
                              q.answer === String.fromCharCode(65 + oi)
                                ? "bg-green-200 border-green-400"
                                : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                            }`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </div>
                        ))
                      : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      );
    }

    // IELTS Speaking
    if (Array.isArray(json.questions) && json.questions.every(q => typeof q === 'string')) {
      return (
        <div className="space-y-4">
          <h3 className="font-black">Speaking Questions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            {json.questions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ol>
        </div>
      );
    }

    // ENT answer key support
    if (generated.examType === 'UNT' && Array.isArray(generated.answers)) {
      return (
        <div className="mt-6 p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
          <h3 className="font-black mb-2">Ответы</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {generated.answers.map((a, idx) => (
              <div key={idx} className="p-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-700">
                <span className="font-bold mr-2">{idx + 1}.</span>
                {a || "-"}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Generic fallback
    return <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(json, null, 2)}</pre>;
  };


  const exams = [
    { id: "UNT", name: { EN: "UNT (ЕНТ)", KZ: "ҰБТ (ЕНТ)", RU: "ЕНТ (ЕНТ)" }, icon: Target },
    { id: "IELTS", name: { EN: "IELTS", KZ: "IELTS", RU: "IELTS" }, icon: BookOpen },
    { id: "SAT", name: { EN: "SAT", KZ: "SAT", RU: "SAT" }, icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">

      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-6xl mx-auto px-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-600 text-white rounded-2xl">
            <Award size={32} />
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            {lang === 'EN' ? 'Exam Preparation' : lang === 'KZ' ? 'Емтиханға Дайындық' : 'Подготовка к Экзаменам'}
          </h1>
        </div>
        <p className="text-xl text-slate-500 font-bold mb-16 max-w-2xl ml-20">
          {lang === 'EN' ? 'Generate practice questions and tests for major exams.' :
           lang === 'KZ' ? 'Негізгі емтихандарға арналған жаттығу сұрақтары мен тесттерді құрыңыз.' :
           'Генерируйте тренировочные вопросы и тесты для основных экзаменов.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000]">
            <ENTPracticeGenerator />
          </div>

          {/* Exam Cards */}
          <div className="space-y-6">
            {exams.map(exam => {
              const Icon = exam.icon;
              return (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-[30px] border-[4px] border-black dark:border-white shadow-[6px_6px_0px_0px_#000]"
                >
                  <div className="flex items-center gap-4">
                    <Icon size={48} className="text-green-600" />
                    <div>
                      <h4 className="text-xl font-black uppercase">
                        {exam.name[lang] || exam.name.EN}
                      </h4>
                      <p className="text-slate-500">
                        {lang === 'EN' ? `Practice materials for ${exam.name.EN}` :
                         lang === 'KZ' ? `${exam.name.KZ} үшін жаттығу материалдары` :
                         `Практические материалы для ${exam.name.RU}`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamPrepPage;