import React from "react";
import { useNavigate } from "react-router-dom";
import { Bot, ChevronRight, Clock3, Search, ShieldCheck, Users } from "lucide-react";
import Footer from "../components/Footer";
import Header from "../components/Header"; // Новый импорт
import { I18N as t } from "../lib/i18n";

export default function LandingPage({ lang, setLang, setIsAuthOpen, setAuthMode, resetAuthFields, user, setUser }) {
  const cur = t[lang]?.lt || t.RU.lt;
  const navigate = useNavigate();
  const content = {
    RU: {
      badge: "AI-платформа для образования",
      teacherTitle: "Для учителей",
      teacherText: "Генерация планов, материалов, тестов и презентаций. Меньше рутины, больше времени на преподавание.",
      studentTitle: "Для учеников",
      studentText: "Умный подбор преподавателей по предмету, уровню, цене и рейтингу без хаоса в чатах.",
      stats: [
        ["10 ч", "экономии в неделю на планах"],
        ["5M", "тенге уже вложено в запуск"],
        ["10M", "тенге инвестиционный запрос"],
      ],
      values: [
        ["AI для учителя", "Специализированные инструменты под образовательные задачи."],
        ["Каталог преподавателей", "Понятный поиск проверенных специалистов для учеников и родителей."],
        ["Локализация", "Фокус на Казахстан с возможностью выхода на международный рынок."],
      ],
    },
    KZ: {
      badge: "Білімге арналған AI платформа",
      teacherTitle: "Мұғалімдерге",
      teacherText: "Жоспарлар, материалдар, тесттер және презентациялар жасау. Күнделікті жұмысты азайтып, сабаққа уақыт бөледі.",
      studentTitle: "Оқушыларға",
      studentText: "Пән, деңгей, баға және рейтинг бойынша оқытушыны ыңғайлы таңдау.",
      stats: [
        ["10 сағ", "аптасына жоспардан үнемдеу"],
        ["5M", "теңге іске қосуға салынды"],
        ["10M", "теңге инвестиция сұранысы"],
      ],
      values: [
        ["Мұғалімге AI", "Білім беру міндеттеріне арналған арнайы құралдар."],
        ["Оқытушылар каталогы", "Оқушы мен ата-анаға тексерілген маманды тез табу."],
        ["Локализация", "Қазақстан нарығына фокус және халықаралық өсу мүмкіндігі."],
      ],
    },
    EN: {
      badge: "AI platform for education",
      teacherTitle: "For teachers",
      teacherText: "Generate plans, materials, quizzes, and presentations. Less routine, more teaching time.",
      studentTitle: "For students",
      studentText: "Smart tutor matching by subject, level, price, and rating without messy chat searches.",
      stats: [
        ["10h", "saved weekly on planning"],
        ["5M", "KZT already invested"],
        ["10M", "KZT investment ask"],
      ],
      values: [
        ["Teacher AI", "Specialized tools for real education workflows."],
        ["Tutor catalog", "Clear discovery of trusted specialists for students and parents."],
        ["Localization", "Focused on Kazakhstan with room for international expansion."],
      ],
    },
  }[lang] || {};

  const icons = [Bot, Search, ShieldCheck];

  const handleJoinClick = () => {
    if (user) {
      navigate("/hub");
    } else {
      resetAuthFields?.();
      setAuthMode?.("signup");
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans overflow-x-hidden pt-[100px]">
      
      {/* ИСПОЛЬЗУЕМ УНИВЕРСАЛЬНЫЙ ХЕДЕР */}
      <Header 
        lang={lang} 
        setLang={setLang} 
        user={user} 
        setUser={setUser} 
        isLanding={true} // Активируем кнопки Войти/Регистрация
        setIsAuthOpen={setIsAuthOpen}
        setAuthMode={setAuthMode}
        resetAuthFields={resetAuthFields}
      />

      <header className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-3 px-5 py-2 mb-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[11px] font-black tracking-[0.18em] uppercase border border-blue-100 dark:border-blue-800">
              <Bot size={16} /> {content.badge}
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase mb-8 leading-[0.95]">
              {cur.hero}
            </h1>

            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mb-10 font-semibold leading-relaxed">
              {cur.sub}
            </p>

            <button
              onClick={handleJoinClick}
              className="group inline-flex items-center gap-4 px-8 sm:px-10 py-5 bg-blue-600 text-white text-sm sm:text-base font-black uppercase tracking-widest rounded-2xl border-[3px] border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95"
            >
              {cur.join} <ChevronRight size={24} strokeWidth={3} />
            </button>
          </div>

          <div className="grid gap-5">
            <div className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[28px] p-8 shadow-[10px_10px_0px_0px_rgba(37,99,235,1)]">
              <div className="flex items-center gap-4 text-blue-600 mb-5">
                <Clock3 size={34} />
                <h2 className="text-2xl font-black uppercase">{content.teacherTitle}</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-300 font-bold leading-relaxed">{content.teacherText}</p>
            </div>

            <div className="bg-slate-100 dark:bg-zinc-950 border-[4px] border-black dark:border-zinc-700 rounded-[28px] p-8 shadow-[10px_10px_0px_0px_#000]">
              <div className="flex items-center gap-4 text-slate-900 dark:text-white mb-5">
                <Users size={34} />
                <h2 className="text-2xl font-black uppercase">{content.studentTitle}</h2>
              </div>
              <p className="text-slate-500 dark:text-slate-300 font-bold leading-relaxed">{content.studentText}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.values.map(([title, text], index) => {
          const Icon = icons[index];
          return (
            <article key={title} className="bg-white dark:bg-zinc-900 border-2 border-black/10 dark:border-white/10 rounded-2xl p-7">
              <Icon size={30} className="text-blue-600 mb-5" />
              <h3 className="text-xl font-black uppercase mb-3">{title}</h3>
              <p className="text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">{text}</p>
            </article>
          );
        })}
      </section>

      <Footer />
    </div>
  );
}
