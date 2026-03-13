import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useAI } from "../hooks/useAI";

const DEFAULT_WORDS = [
  "Apple", "Orange", "Banana", "Grape", "Lemon", "Cherry", "Peach", "Pear", "Mango", "Kiwi",
  "Car", "Train", "Plane", "Boat", "Bicycle", "Bus", "Rocket", "Helicopter", "Submarine", "Tram",
  "Dog", "Cat", "Bird", "Fish", "Horse", "Cow", "Sheep", "Lion", "Tiger", "Bear",
  "Moon", "Sun", "Star", "Planet", "Comet", "Galaxy", "Asteroid", "Rocket", "Satellite", "Meteor",
  "Book", "Pencil", "Paper", "Desk", "Chair", "School", "Teacher", "Student", "Lesson", "Quiz",
];

const TEAM_COLORS = {
  red: "bg-red-500/20 border-red-500",
  blue: "bg-blue-500/20 border-blue-500",
  neutral: "bg-slate-200 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700",
  assassin: "bg-black/10 border-black",
};

const labelForTeam = (team, lang) => {
  if (team === "red") return lang === "EN" ? "Red" : lang === "KZ" ? "Қызыл" : "Красная";
  if (team === "blue") return lang === "EN" ? "Blue" : lang === "KZ" ? "Көк" : "Синяя";
  if (team === "neutral") return lang === "EN" ? "Neutral" : lang === "KZ" ? "Бейтарап" : "Нейтральная";
  if (team === "assassin") return lang === "EN" ? "Assassin" : lang === "KZ" ? "Ассасин" : "Ассассин";
  return team;
};

const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildFallbackBoard = (topic, subject) => {
  const base = shuffleArray(DEFAULT_WORDS).slice(0, 25);
  const teams = [
    ...Array(8).fill("red"),
    ...Array(8).fill("blue"),
    ...Array(7).fill("neutral"),
    "assassin",
  ];
  const shuffledTeams = shuffleArray(teams);

  return base.map((word, idx) => ({
    word,
    team: shuffledTeams[idx],
    revealed: false,
  }));
};

const CodenamesGame = ({ lang, setLang, user, setUser, ...accessProps }) => {
  const location = useLocation();
  const quiz = location.state?.quiz;
  const topic = quiz?.topic || location.state?.topic || "General Knowledge";
  const subject = quiz?.subject || location.state?.subject || "";
  const grade = quiz?.grade || location.state?.grade || "";
  const sessionCode = quiz?.access_code || location.state?.sessionCode || "";
  const studentName = location.state?.studentName || "";
  const isStudent = Boolean(location.state?.isStudent);

  const { loading: aiLoading, error: aiError, result: aiResult, run: runAI } = useAI();
  const [board, setBoard] = useState(() => buildFallbackBoard(topic, subject));
  const [startingTeam, setStartingTeam] = useState("red");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  const redRemaining = useMemo(() => board.filter((c) => c.team === "red" && !c.revealed).length, [board]);
  const blueRemaining = useMemo(() => board.filter((c) => c.team === "blue" && !c.revealed).length, [board]);

  useEffect(() => {
    // Trigger AI generation when topic/subject/grade changes
    if (!topic) return;
    runAI("game_codenames", { topic, subject, grade, lang });
  }, [topic, subject, grade, lang, runAI]);

  useEffect(() => {
    if (aiResult?.board && Array.isArray(aiResult.board) && aiResult.board.length >= 25) {
      const normalized = aiResult.board.slice(0, 25).map((cell) => ({
        word: cell.word || "",
        team: cell.team || "neutral",
        revealed: false,
      }));

      setBoard(normalized);
      setStartingTeam(aiResult.startingTeam || "red");
      setGameOver(false);
      setMessage("");
    }
  }, [aiResult]);

  const revealCard = (idx) => {
    if (gameOver) return;

    setBoard((prev) => {
      const next = [...prev];
      if (next[idx].revealed) return next;
      next[idx] = { ...next[idx], revealed: true };

      const remainingRed = next.filter((c) => c.team === "red" && !c.revealed).length;
      const remainingBlue = next.filter((c) => c.team === "blue" && !c.revealed).length;

      if (next[idx].team === "assassin") {
        setGameOver(true);
        setMessage(
          lang === "EN"
            ? "Oh no! Assassin found. Game over."
            : lang === "KZ"
            ? "Ой, ассассин табылды. Ойын аяқталды."
            : "О нет! Найден ассассин. Игра окончена."
        );
      } else if (remainingRed === 0 && next[idx].team === "red") {
        setGameOver(true);
        setMessage(
          lang === "EN"
            ? "Red team won!"
            : lang === "KZ"
            ? "Қызыл команда жеңді!"
            : "Победа красной команды!"
        );
      } else if (remainingBlue === 0 && next[idx].team === "blue") {
        setGameOver(true);
        setMessage(
          lang === "EN"
            ? "Blue team won!"
            : lang === "KZ"
            ? "Көк команда жеңді!"
            : "Победа синей команды!"
        );
      }

      return next;
    });
  };

  const resetBoard = () => {
    setBoard(buildFallbackBoard(topic, subject));
    setGameOver(false);
    setMessage("");
    runAI("game_codenames", { topic, subject, grade, lang });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-6xl mx-auto px-10">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/games"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">
              {lang === "EN" ? "Back to Games" : lang === "KZ" ? "Ойындарға қайту" : "Назад к играм"}
            </span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black uppercase tracking-tight">
              {lang === "EN" ? "Codenames" : lang === "KZ" ? "Кодтық Аттар" : "Codenames"}
            </h1>
            <p className="text-slate-500 mt-2">
              {lang === "EN"
                ? `Topic: ${topic}`
                : lang === "KZ"
                ? `Тақырып: ${topic}`
                : `Тема: ${topic}`}
            </p>
          </div>

          <button
            onClick={resetBoard}
            className="px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-500 transition"
          >
            <RefreshCcw size={18} className="inline-block mr-2" />
            {lang === "EN" ? "New Board" : lang === "KZ" ? "Жаңа тақта" : "Новая доска"}
          </button>
        </div>

        {aiLoading && (
          <div className="mb-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-800 dark:text-blue-200">
            {lang === "EN" ? "Generating Codenames board based on your topic…" : lang === "KZ" ? "Тақырыпқа сәйкес Codenames тақтасы жасалуда…" : "Генерация доски Codenames на основе темы…"}
          </div>
        )}

        {aiError && (
          <div className="mb-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-200">
            {lang === "EN"
              ? `AI generation failed: ${aiError}`
              : lang === "KZ"
              ? `AI генерациясы сәтсіз аяқталды: ${aiError}`
              : `Генерация ИИ не удалась: ${aiError}`}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-4 text-sm text-emerald-800 dark:text-emerald-200">
            {message}
          </div>
        )}

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
            <div className="text-sm font-bold mb-2">
              {lang === "EN" ? "Remaining" : lang === "KZ" ? "Қалған" : "Осталось"}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                {lang === "EN" ? "Red" : lang === "KZ" ? "Қызыл" : "Красная"}: {redRemaining}
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                {lang === "EN" ? "Blue" : lang === "KZ" ? "Көк" : "Синяя"}: {blueRemaining}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4">
            <div className="text-sm font-bold mb-2">
              {lang === "EN" ? "Starting Team" : lang === "KZ" ? "Бастапқы команда" : "Начальная команда"}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${startingTeam === "red" ? "bg-red-500" : "bg-blue-500"}`}
              />
              {labelForTeam(startingTeam, lang)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {board.map((cell, idx) => {
            const isRevealed = cell.revealed;
            const colorClass = isRevealed ? TEAM_COLORS[cell.team] : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700";

            return (
              <button
                key={`${cell.word}-${idx}`}
                type="button"
                onClick={() => revealCard(idx)}
                disabled={gameOver || isRevealed}
                className={`h-24 rounded-2xl border-2 p-2 text-left font-bold text-sm shadow-sm transition ${colorClass} ${isRevealed ? "cursor-default" : "hover:shadow-lg"}`}
              >
                <div className="line-clamp-2">{cell.word}</div>
                {isRevealed && (
                  <div className="mt-2 text-xs opacity-80">
                    {labelForTeam(cell.team, lang)}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {sessionCode && (
          <div className="mt-8 text-center">
            <div className="text-sm text-slate-500">
              {lang === "EN" ? "Session code" : lang === "KZ" ? "Сессия коды" : "Код сессии"}
            </div>
            <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-zinc-800 px-6 py-3 rounded-2xl font-black text-3xl tracking-widest">
              {sessionCode}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CodenamesGame;
