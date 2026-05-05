import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Gamepad2, LayoutGrid, MessageCircle, Search, Target, UsersRound } from "lucide-react";
import { I18N as t } from "../lib/i18n";
import Footer from "../components/Footer";
import Header from "../components/Header";

const cardText = {
  RU: {
    teacherTitle: "Кабинет учителя",
    teacherDesc: "Мои ученики, заявки, материалы и сообщения.",
    toolsTitle: "AI-инструменты",
    toolsDesc: "Планы уроков, тесты, презентации и учебные материалы.",
    classTitle: "Чат и материалы",
    classDesc: "Публикация материалов и общение со студентами.",
    studentTitle: "Обучение",
    studentDesc: "Тесты, практика, игры и прогресс.",
    teachersTitle: "Выбрать преподавателя",
    teachersDesc: "Список преподавателей по предмету, уровню, цене и рейтингу.",
    go: "Открыть",
    join: "Присоединиться к тесту",
  },
  KZ: {
    teacherTitle: "Мұғалім кабинеті",
    teacherDesc: "Менің оқушыларым, өтінімдер, материалдар және хабарламалар.",
    toolsTitle: "AI құралдар",
    toolsDesc: "Сабақ жоспарлары, тесттер, презентациялар және оқу материалдары.",
    classTitle: "Чат және материалдар",
    classDesc: "Материал жариялау және оқушылармен байланыс.",
    studentTitle: "Оқу",
    studentDesc: "Тесттер, практика, ойындар және прогресс.",
    teachersTitle: "Оқытушы таңдау",
    teachersDesc: "Пән, деңгей, баға және рейтинг бойынша оқытушылар тізімі.",
    go: "Ашу",
    join: "Тестке қосылу",
  },
  EN: {
    teacherTitle: "Teacher Workspace",
    teacherDesc: "My students, requests, materials, and messages.",
    toolsTitle: "AI Tools",
    toolsDesc: "Lesson plans, quizzes, presentations, and learning materials.",
    classTitle: "Chat & Materials",
    classDesc: "Publish materials and communicate with students.",
    studentTitle: "Learning",
    studentDesc: "Quizzes, practice, games, and progress.",
    teachersTitle: "Choose Teacher",
    teachersDesc: "Teacher list by subject, level, price, and rating.",
    go: "Open",
    join: "Join quiz",
  },
};

function HubCard({ to, label, title, desc, go, icon: Icon, accent = "blue", dark = false }) {
  const color = {
    blue: "text-blue-600 shadow-[10px_10px_0px_0px_rgba(37,99,235,1)]",
    green: "text-green-600 shadow-[10px_10px_0px_0px_#10b981]",
    yellow: "text-yellow-600 shadow-[10px_10px_0px_0px_#f59e0b]",
    black: "text-black dark:text-white shadow-[10px_10px_0px_0px_#000]",
  }[accent];

  return (
    <Link
      to={to}
      className={`group relative p-10 rounded-[40px] border-[4px] border-black dark:border-white hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex flex-col justify-between text-left min-h-[420px] ${color} ${
        dark ? "bg-slate-100 dark:bg-zinc-950" : "bg-white dark:bg-zinc-900"
      }`}
    >
      <div>
        <div className="absolute -top-6 left-10 px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-black text-xs rounded-full border-2 border-black uppercase tracking-widest">
          {label}
        </div>
        <div className={`flex justify-between items-start mb-10 ${color.split(" ")[0]}`}>
          <Icon size={64} strokeWidth={2.5} />
          <div className="bg-white/70 dark:bg-zinc-800 p-4 rounded-3xl">
            <ChevronRight size={32} />
          </div>
        </div>
        <h2 className="text-4xl font-black uppercase mb-4 tracking-tight">{title}</h2>
        <p className="text-slate-500 font-bold leading-relaxed max-w-[280px]">{desc}</p>
      </div>
      <div className="flex items-center gap-2 font-black text-sm uppercase tracking-[0.2em] group-hover:gap-4 transition-all italic mt-8">
        <span>{go}</span> <ChevronRight size={20} strokeWidth={3} />
      </div>
    </Link>
  );
}

export default function HubPage({ lang, setLang, user, setUser, ...accessProps }) {
  const cur = t[lang]?.hub || t.RU.hub;
  const text = cardText[lang] || cardText.RU;
  const isTeacher = user?.role === "teacher";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px]">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-7xl mx-auto px-10 py-20 text-center">
        <h1 className="text-7xl font-black uppercase mb-24 tracking-tighter italic">{cur.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {isTeacher ? (
            <>
              <HubCard to="/teacher-workspace" label={text.teacherTitle} title={text.teacherTitle} desc={text.teacherDesc} go={text.go} icon={UsersRound} accent="green" />
              <HubCard to="/tools" label={text.toolsTitle} title={text.toolsTitle} desc={text.toolsDesc} go={text.go} icon={LayoutGrid} accent="blue" />
              <HubCard to="/classroom" label={text.classTitle} title={text.classTitle} desc={text.classDesc} go={text.go} icon={MessageCircle} accent="yellow" />
            </>
          ) : (
            <>
              <HubCard to="/teachers" label={text.teachersTitle} title={text.teachersTitle} desc={text.teachersDesc} go={text.go} icon={Search} accent="green" />
              <HubCard to="/games" label={text.studentTitle} title={text.studentTitle} desc={text.studentDesc} go={text.go} icon={Gamepad2} accent="black" dark />
              <HubCard to="/classroom" label={text.classTitle} title={text.classTitle} desc={text.classDesc} go={text.go} icon={FileText} accent="yellow" />
            </>
          )}
        </div>

        {!isTeacher && (
          <div className="text-center mb-16">
            <Link to="/join-test" className="inline-flex items-center gap-4 px-8 py-6 bg-green-600 text-white rounded-2xl font-black uppercase shadow-[6px_6px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition">
              <Target size={32} />
              {text.join}
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
