import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";
import { tr } from "../lib/i18n";
import Header from "../components/Header";

const UniversityPage = ({ lang, setLang, user, setUser, ...accessProps }) => {
  const [form, setForm] = useState({
    subject: "",
    level: "undergraduate",
    year: 1,
    details: ""
  });

  const handleGenerate = () => {
    // TODO: Implement generation logic
    console.log("Generate university course:", form);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">

      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-6xl mx-auto px-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            {lang === 'EN' ? 'University Courses' : lang === 'KZ' ? 'Университеттік Курстар' : 'Университетские Курсы'}
          </h1>
        </div>
        <p className="text-xl text-slate-500 font-bold mb-16 max-w-2xl ml-20">
          {lang === 'EN' ? 'Create comprehensive university course materials and syllabi.' :
           lang === 'KZ' ? 'Толық университеттік курс материалдарын және силлабустарды құрыңыз.' :
           'Создавайте комплексные материалы университетских курсов и силлабусы.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Generator */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000]">
            <h3 className="text-2xl font-black uppercase mb-6">
              {lang === 'EN' ? 'Course Generator' : lang === 'KZ' ? 'Курс Генераторы' : 'Генератор Курса'}
            </h3>

            <div className="space-y-6">
              <input
                value={form.subject}
                onChange={e => setForm({...form, subject: e.target.value})}
                placeholder={lang === 'EN' ? 'Course Subject' : lang === 'KZ' ? 'Курс Тақырыбы' : 'Предмет Курса'}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
              />

              <select
                value={form.level}
                onChange={e => setForm({...form, level: e.target.value})}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
              >
                <option value="undergraduate">
                  {lang === 'EN' ? 'Undergraduate' : lang === 'KZ' ? 'Бакалавриат' : 'Бакалавриат'}
                </option>
                <option value="graduate">
                  {lang === 'EN' ? 'Graduate' : lang === 'KZ' ? 'Магистратура' : 'Магистратура'}
                </option>
              </select>

              <select
                value={form.year}
                onChange={e => setForm({...form, year: parseInt(e.target.value)})}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
              >
                {[1,2,3,4].map(y => (
                  <option key={y} value={y}>
                    {lang === 'EN' ? `Year ${y}` : lang === 'KZ' ? `${y} Курс` : `${y} Курс`}
                  </option>
                ))}
              </select>

              <textarea
                value={form.details}
                onChange={e => setForm({...form, details: e.target.value})}
                placeholder={lang === 'EN' ? 'Additional details...' : lang === 'KZ' ? 'Қосымша мәліметтер...' : 'Дополнительные детали...'}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none h-32 resize-none"
              />

              <button
                onClick={handleGenerate}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase"
              >
                {lang === 'EN' ? 'Generate Course' : lang === 'KZ' ? 'Курс Құру' : 'Создать Курс'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Link
              to="/syllabus-generator"
              className="block bg-white dark:bg-zinc-900 p-6 rounded-[30px] border-[4px] border-black dark:border-white shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <div className="flex items-center gap-4">
                <BookOpen size={48} className="text-blue-600" />
                <div>
                  <h4 className="text-xl font-black uppercase">
                    {lang === 'EN' ? 'Syllabus Generator' : lang === 'KZ' ? 'Силлабус Генераторы' : 'Генератор Силлабуса'}
                  </h4>
                  <p className="text-slate-500">
                    {lang === 'EN' ? 'Create detailed course syllabi' : lang === 'KZ' ? 'Толық курс силлабустарын құру' : 'Создавайте подробные силлабусы курсов'}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/lecture-planner"
              className="block bg-white dark:bg-zinc-900 p-6 rounded-[30px] border-[4px] border-black dark:border-white shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <div className="flex items-center gap-4">
                <Users size={48} className="text-green-600" />
                <div>
                  <h4 className="text-xl font-black uppercase">
                    {lang === 'EN' ? 'Lecture Planner' : lang === 'KZ' ? 'Дәріс Жоспарлаушы' : 'Планировщик Лекций'}
                  </h4>
                  <p className="text-slate-500">
                    {lang === 'EN' ? 'Plan lecture topics and content' : lang === 'KZ' ? 'Дәріс тақырыптарын және мазмұнын жоспарлау' : 'Планируйте темы и содержание лекций'}
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/assessment-builder"
              className="block bg-white dark:bg-zinc-900 p-6 rounded-[30px] border-[4px] border-black dark:border-white shadow-[6px_6px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <div className="flex items-center gap-4">
                <Award size={48} className="text-purple-600" />
                <div>
                  <h4 className="text-xl font-black uppercase">
                    {lang === 'EN' ? 'Assessment Builder' : lang === 'KZ' ? 'Бағалау Құрастырушы' : 'Конструктор Оценок'}
                  </h4>
                  <p className="text-slate-500">
                    {lang === 'EN' ? 'Create assignments and assessments' : lang === 'KZ' ? 'Тапсырмалар мен бағалау құру' : 'Создавайте задания и оценки'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UniversityPage;