import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Presentation, FileText, Download } from "lucide-react";
import { tr } from "../lib/i18n";
import Header from "../components/Header";

const PresentationsPage = ({ lang, setLang, user, setUser, ...accessProps }) => {
  const [form, setForm] = useState({
    topic: "",
    slides: 5,
    style: "modern",
    details: ""
  });

  const [generatedDeck, setGeneratedDeck] = useState(null);

  const handleGenerate = async () => {
    setGeneratedDeck(generateSampleDeck(form.topic, form.slides, form.style, form.details));
  };

  const generateSampleDeck = (topic, slides, style, details) => {
    const deck = [];
    for (let i = 1; i <= slides; i++) {
      deck.push({
        id: i,
        title: i === 1 ? topic : `${topic}: ${lang === 'EN' ? 'Key idea' : lang === 'KZ' ? 'Негізгі ой' : 'ключевая идея'} ${i}`,
        bullets: [
          lang === 'EN' ? "Clear slide headline" : lang === 'KZ' ? "Түсінікті слайд тақырыбы" : "Чёткий заголовок слайда",
          lang === 'EN' ? "Visual block like Gamma" : lang === 'KZ' ? "Gamma стиліндегі визуалды блок" : "Визуальный блок как в Gamma",
          details || (lang === 'EN' ? "Speaker notes and structure" : lang === 'KZ' ? "Спикерге арналған заметка" : "Заметки для выступления"),
        ],
      });
    }
    return { topic, style, slides: deck };
  };

  const downloadPresentation = () => {
    if (!generatedDeck) return;
    
    const pptxContent = [
      "Teach and Study PPTX deck",
      `Topic: ${generatedDeck.topic}`,
      `Style: ${generatedDeck.style}`,
      "",
      ...generatedDeck.slides.flatMap((slide) => [
        `Slide ${slide.id}: ${slide.title}`,
        ...slide.bullets.map((bullet) => `- ${bullet}`),
        "",
      ]),
    ].join("\n");
    const blob = new Blob([pptxContent], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.topic.replace(/\s+/g, '_')}_presentation.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">

      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-6xl mx-auto px-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-orange-600 text-white rounded-2xl">
            <Presentation size={32} />
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">
            {lang === 'EN' ? 'Presentations' : lang === 'KZ' ? 'Презентациялар' : 'Презентации'}
          </h1>
        </div>
        <p className="text-xl text-slate-500 font-bold mb-16 max-w-2xl ml-20">
          {lang === 'EN' ? 'Create lesson presentations in PPTX format.' :
           lang === 'KZ' ? 'Сабаққа арналған PPTX презентациялар жасаңыз.' :
           'Создавайте презентации для уроков в формате PPTX.'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Presentation Generator */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000]">
            <h3 className="text-2xl font-black uppercase mb-6">
              {lang === 'EN' ? 'Presentation Generator' : lang === 'KZ' ? 'Презентация Генераторы' : 'Генератор Презентаций'}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest">
                  {lang === 'EN' ? 'Topic' : lang === 'KZ' ? 'Тақырып' : 'Тема'}
                </label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={e => setForm({...form, topic: e.target.value})}
                  className="w-full p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent"
                  placeholder={lang === 'EN' ? 'Enter presentation topic' : lang === 'KZ' ? 'Презентация тақырыбын енгізіңіз' : 'Введите тему презентации'}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest">
                  {lang === 'EN' ? 'Number of Slides' : lang === 'KZ' ? 'Слайдтар саны' : 'Количество слайдов'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={form.slides}
                  onChange={e => setForm({...form, slides: parseInt(e.target.value)})}
                  className="w-full p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest">
                  {lang === 'EN' ? 'Style' : lang === 'KZ' ? 'Стиль' : 'Стиль'}
                </label>
                <select
                  value={form.style}
                  onChange={e => setForm({...form, style: e.target.value})}
                  className="w-full p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent"
                >
                  <option value="modern">{lang === 'EN' ? 'Modern' : lang === 'KZ' ? 'Заманауи' : 'Современный'}</option>
                  <option value="classic">{lang === 'EN' ? 'Classic' : lang === 'KZ' ? 'Классикалық' : 'Классический'}</option>
                  <option value="creative">{lang === 'EN' ? 'Creative' : lang === 'KZ' ? 'Шығармашыл' : 'Креативный'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-widest">
                  {lang === 'EN' ? 'Additional Details' : lang === 'KZ' ? 'Қосымша мәліметтер' : 'Дополнительные детали'}
                </label>
                <textarea
                  value={form.details}
                  onChange={e => setForm({...form, details: e.target.value})}
                  className="w-full p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent h-24 resize-none"
                  placeholder={lang === 'EN' ? 'Any specific requirements...' : lang === 'KZ' ? 'Кез келген арнайы талаптар...' : 'Любые специфические требования...'}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!form.topic.trim()}
                className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {lang === 'EN' ? 'Generate Presentation' : lang === 'KZ' ? 'Презентацияны Жасау' : 'Создать Презентацию'}
              </button>
            </div>
          </div>

          {/* Preview/Download */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000]">
            <h3 className="text-2xl font-black uppercase mb-6">
              {lang === 'EN' ? 'Outline & PPTX Download' : lang === 'KZ' ? 'Құрылым және PPTX жүктеу' : 'Структура и скачивание PPTX'}
            </h3>

            {generatedDeck ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={downloadPresentation}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    {lang === 'EN' ? 'Download PPTX' : lang === 'KZ' ? 'PPTX жүктеу' : 'Скачать PPTX'}
                  </button>
                </div>
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                  {generatedDeck.slides.map((slide) => (
                    <article key={slide.id} className="bg-slate-100 dark:bg-zinc-800 p-5 rounded-2xl border-2 border-black/10">
                      <div className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-2">Slide {slide.id}</div>
                      <h4 className="text-xl font-black uppercase mb-3">{slide.title}</h4>
                      <ul className="space-y-2 text-slate-500 dark:text-slate-300 font-bold">
                        {slide.bullets.map((bullet) => <li key={bullet}>• {bullet}</li>)}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  {lang === 'EN' ? 'Generate a presentation to see preview' : 
                   lang === 'KZ' ? 'Алдын ала қарауды көру үшін презентация жасаңыз' : 
                   'Создайте презентацию для просмотра превью'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PresentationsPage;
