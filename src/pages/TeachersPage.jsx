import React, { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Filter, GraduationCap, Search, Star, UserRound } from "lucide-react";
import Header from "../components/Header";

const teachers = [
  {
    id: 1,
    name: "Айдана Сейтахмет",
    subject: "Математика",
    level: "ЕНТ",
    price: 4500,
    rating: 4.9,
    format: "Онлайн",
    experience: "7 лет",
    tags: ["Алгебра", "Геометрия", "ЕНТ"],
  },
  {
    id: 2,
    name: "Данияр Мухамед",
    subject: "Английский",
    level: "IELTS",
    price: 6000,
    rating: 4.8,
    format: "Онлайн",
    experience: "9 лет",
    tags: ["Speaking", "IELTS", "Grammar"],
  },
  {
    id: 3,
    name: "Мария Ким",
    subject: "Физика",
    level: "Школа",
    price: 5000,
    rating: 4.7,
    format: "Оффлайн",
    experience: "6 лет",
    tags: ["7-11 класс", "Лабораторные", "Экзамены"],
  },
  {
    id: 4,
    name: "Ержан Алиев",
    subject: "История",
    level: "ЕНТ",
    price: 4000,
    rating: 4.9,
    format: "Онлайн",
    experience: "10 лет",
    tags: ["Казахстан", "Всемирная история", "ЕНТ"],
  },
];

const text = {
  RU: {
    title: "Выбор преподавателя",
    subtitle: "Подберите наставника по предмету, уровню, цене и рейтингу.",
    search: "Поиск по имени или предмету",
    subject: "Предмет",
    level: "Уровень",
    all: "Все",
    select: "Отправить заявку",
    selected: "Заявка отправлена",
    perLesson: "тг / урок",
    found: "Найдено",
  },
  KZ: {
    title: "Оқытушы таңдау",
    subtitle: "Пән, деңгей, баға және рейтинг бойынша тәлімгер таңдаңыз.",
    search: "Аты немесе пән бойынша іздеу",
    subject: "Пән",
    level: "Деңгей",
    all: "Барлығы",
    select: "Өтінім жіберу",
    selected: "Өтінім жіберілді",
    perLesson: "тг / сабақ",
    found: "Табылды",
  },
  EN: {
    title: "Choose a Teacher",
    subtitle: "Match with a tutor by subject, level, price, and rating.",
    search: "Search by name or subject",
    subject: "Subject",
    level: "Level",
    all: "All",
    select: "Send Request",
    selected: "Request Sent",
    perLesson: "KZT / lesson",
    found: "Found",
  },
};

const REQUESTS_KEY = "teach_and_study_teacher_requests";

function readRequests() {
  try {
    return JSON.parse(localStorage.getItem(REQUESTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function TeachersPage({ lang, setLang, user, setUser, ...accessProps }) {
  const copy = text[lang] || text.RU;
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [level, setLevel] = useState("all");
  const [requestedIds, setRequestedIds] = useState(() => new Set(readRequests().map((request) => request.teacherId)));

  const subjects = ["all", ...new Set(teachers.map((teacher) => teacher.subject))];
  const levels = ["all", ...new Set(teachers.map((teacher) => teacher.level))];

  const filteredTeachers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teachers.filter((teacher) => {
      const matchesQuery = !q || `${teacher.name} ${teacher.subject} ${teacher.tags.join(" ")}`.toLowerCase().includes(q);
      const matchesSubject = subject === "all" || teacher.subject === subject;
      const matchesLevel = level === "all" || teacher.level === level;
      return matchesQuery && matchesSubject && matchesLevel;
    });
  }, [query, subject, level]);

  const sendRequest = (teacher) => {
    const existing = readRequests();
    if (existing.some((request) => request.teacherId === teacher.id && request.studentEmail === user?.email)) {
      setRequestedIds(new Set(existing.map((request) => request.teacherId)));
      return;
    }

    const request = {
      id: Date.now(),
      teacherId: teacher.id,
      teacherName: teacher.name,
      studentName: `${user?.first_name || "Ученик"} ${user?.last_name || ""}`.trim(),
      studentEmail: user?.email || "student@example.com",
      subject: `${teacher.subject} / ${teacher.level}`,
      time: new Date().toLocaleDateString(),
      status: "pending",
    };

    const next = [request, ...existing];
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(next));
    setRequestedIds(new Set(next.map((item) => item.teacherId)));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>
            <div className="inline-flex items-center gap-3 px-4 py-2 mb-5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[11px] font-black uppercase tracking-[0.18em] border border-blue-100 dark:border-blue-800">
              <UserRound size={16} /> Teach and Study
            </div>
            <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter italic mb-4">
              {copy.title}
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-300 font-bold max-w-2xl">
              {copy.subtitle}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-[28px] px-6 py-5 shadow-[6px_6px_0px_0px_#000]">
            <div className="text-3xl font-black text-blue-600">{filteredTeachers.length}</div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">{copy.found}</div>
          </div>
        </div>

        <section className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-6 mb-10 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-4">
            <label className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.search}
                className="w-full pl-14 pr-5 py-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
              />
            </label>

            <label className="relative">
              <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full pl-12 pr-5 py-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-black"
              >
                {subjects.map((item) => (
                  <option key={item} value={item}>{item === "all" ? copy.subject + ": " + copy.all : item}</option>
                ))}
              </select>
            </label>

            <label className="relative">
              <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="w-full pl-12 pr-5 py-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-black"
              >
                {levels.map((item) => (
                  <option key={item} value={item}>{item === "all" ? copy.level + ": " + copy.all : item}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredTeachers.map((teacher) => {
            const selected = requestedIds.has(teacher.id);
            return (
              <article
                key={teacher.id}
                className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[7px_7px_0px_0px_#000] flex flex-col min-h-[390px]"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center border-[3px] border-black">
                    <BookOpen size={30} />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-yellow-100 text-yellow-700 font-black">
                    <Star size={16} fill="currentColor" />
                    {teacher.rating}
                  </div>
                </div>

                <h2 className="text-2xl font-black uppercase tracking-tight mb-2">{teacher.name}</h2>
                <p className="text-blue-600 font-black uppercase tracking-widest text-xs mb-5">
                  {teacher.subject} / {teacher.level}
                </p>

                <div className="space-y-3 text-sm font-bold text-slate-500 dark:text-slate-300 mb-6">
                  <div>{teacher.experience} / {teacher.format}</div>
                  <div className="text-2xl text-slate-900 dark:text-white font-black">
                    {teacher.price.toLocaleString("ru-RU")} {copy.perLesson}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-7">
                  {teacher.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-full text-[11px] font-black uppercase text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => sendRequest(teacher)}
                  className={`mt-auto w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition ${
                    selected
                      ? "bg-green-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {selected ? <CheckCircle2 size={20} /> : <UserRound size={20} />}
                  {selected ? copy.selected : copy.select}
                </button>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
