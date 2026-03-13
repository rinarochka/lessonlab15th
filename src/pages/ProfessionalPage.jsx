import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Code, TrendingUp, Heart, Wrench } from "lucide-react";
import { tr } from "../lib/i18n";
import Header from "../components/Header";

const ProfessionalPage = ({ lang, setLang, user, setUser, ...accessProps }) => {
  const [form, setForm] = useState({
    field: "technology",
    level: "beginner",
    duration: "3 months",
    details: ""
  });

  const handleGenerate = () => {
    // TODO: Implement generation logic
    console.log("Generate professional course:", form);
  };

  const fields = [
    { id: "technology", name: { EN: "Technology", KZ: "Технология", RU: "Технологии" }, icon: Code },
    { id: "business", name: { EN: "Business", KZ: "Бизнес", RU: "Бизнес" }, icon: TrendingUp },
    { id: "healthcare", name: { EN: "Healthcare", KZ: "Денсаулық Сақтау", RU: "Здравоохранение" }, icon: Heart },
    { id: "engineering", name: { EN: "Engineering", KZ: "Инженерия", RU: "Инженерия" }, icon: Wrench }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">

      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-6xl mx-auto px-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-600 text-white rounded-2xl">
            <Briefcase size={32} />
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            {lang === 'EN' ? 'Professional Courses' : lang === 'KZ' ? 'Кәсіби Курстар' : 'Профессиональные Курсы'}
          </h1>
        </div>
        <p className="text-xl text-slate-500 font-bold mb-16 max-w-2xl ml-20">
          {lang === 'EN' ? 'Create specialized training programs and professional development courses.' :
           lang === 'KZ' ? 'Арнайы оқу бағдарламаларын және кәсіби даму курстарын құрыңыз.' :
           'Создавайте специализированные программы обучения и курсы профессионального развития.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Generator */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000]">
            <h3 className="text-2xl font-black uppercase mb-6">
              {lang === 'EN' ? 'Course Builder' : lang === 'KZ' ? 'Курс Құрастырушы' : 'Конструктор Курса'}
            </h3>

            <div className="space-y-6">
              <select
                value={form.field}
                onChange={e => setForm({...form, field: e.target.value})}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
              >
                {fields.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.name[lang] || field.name.EN}
                  </option>
                ))}
              </select>

              <select
                value={form.level}
                onChange={e => setForm({...form, level: e.target.value})}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
              >
                <option value="beginner">
                  {lang === 'EN' ? 'Beginner' : lang === 'KZ' ? 'Бастапқы' : 'Начинающий'}
                </option>
                <option value="intermediate">
                  {lang === 'EN' ? 'Intermediate' : lang === 'KZ' ? 'Орташа' : 'Средний'}
                </option>
                <option value="advanced">
                  {lang === 'EN' ? 'Advanced' : lang === 'KZ' ? 'Жоғары' : 'Продвинутый'}
                </option>
              </select>

              <select
                value={form.duration}
                onChange={e => setForm({...form, duration: e.target.value})}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none"
              >
                <option value="1 month">
                  {lang === 'EN' ? '1 Month' : lang === 'KZ' ? '1 Ай' : '1 Месяц'}
                </option>
                <option value="3 months">
                  {lang === 'EN' ? '3 Months' : lang === 'KZ' ? '3 Ай' : '3 Месяца'}
                </option>
                <option value="6 months">
                  {lang === 'EN' ? '6 Months' : lang === 'KZ' ? '6 Ай' : '6 Месяцев'}
                </option>
                <option value="1 year">
                  {lang === 'EN' ? '1 Year' : lang === 'KZ' ? '1 Жыл' : '1 Год'}
                </option>
              </select>

              <textarea
                value={form.details}
                onChange={e => setForm({...form, details: e.target.value})}
                placeholder={lang === 'EN' ? 'Specific skills or topics to cover...' : lang === 'KZ' ? 'Арнайы дағдылар немесе қамтуға арналған тақырыптар...' : 'Конкретные навыки или темы для изучения...'}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none h-32 resize-none"
              />

              <button
                onClick={handleGenerate}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase"
              >
                {lang === 'EN' ? 'Create Course' : lang === 'KZ' ? 'Курс Құру' : 'Создать Курс'}
              </button>
            </div>
          </div>

          {/* Field Cards */}
          <div className="space-y-6">
            {fields.map(field => {
              const Icon = field.icon;
              return (
                <div
                  key={field.id}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-[30px] border-[4px] border-black dark:border-white shadow-[6px_6px_0px_0px_#000]"
                >
                  <div className="flex items-center gap-4">
                    <Icon size={48} className="text-purple-600" />
                    <div>
                      <h4 className="text-xl font-black uppercase">
                        {field.name[lang] || field.name.EN}
                      </h4>
                      <p className="text-slate-500">
                        {lang === 'EN' ? `Professional training in ${field.name.EN.toLowerCase()}` :
                         lang === 'KZ' ? `${field.name.KZ.toLowerCase()} бойынша кәсіби оқыту` :
                         `Профессиональное обучение в области ${field.name.RU.toLowerCase()}`}
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

export default ProfessionalPage;