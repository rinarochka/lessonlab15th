import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Presentation, FileText, Download, Eye } from "lucide-react";
import { tr } from "../lib/i18n";
import Header from "../components/Header";

const PresentationsPage = ({ lang, setLang, user, setUser, ...accessProps }) => {
  const [form, setForm] = useState({
    topic: "",
    slides: 5,
    style: "modern",
    details: ""
  });

  const [generatedPresentation, setGeneratedPresentation] = useState(null);

  const handleGenerate = async () => {
    // TODO: Implement AI generation logic
    // For now, create a sample HTML presentation
    const html = generateSamplePresentation(form.topic, form.slides, form.style);
    setGeneratedPresentation(html);
  };

  const generateSamplePresentation = (topic, slides, style) => {
    const styles = {
      modern: `
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
        .slide { display: none; position: relative; width: 100vw; height: 100vh; background: white; padding: 40px; box-sizing: border-box; }
        .slide.active { display: block; }
        .slide h1 { color: #1f2937; font-size: 48px; margin-bottom: 20px; }
        .slide h2 { color: #374151; font-size: 36px; margin-bottom: 20px; }
        .slide p { color: #6b7280; font-size: 24px; line-height: 1.6; }
        .slide ul { padding-left: 40px; }
        .slide li { color: #6b7280; font-size: 24px; margin-bottom: 10px; }
        .nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 1000; }
        .nav button { background: #3b82f6; color: white; border: none; padding: 10px 20px; margin: 0 5px; border-radius: 5px; cursor: pointer; }
      `,
      classic: `
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; background: #ffffff; }
        .slide { display: none; position: relative; width: 100vw; height: 100vh; background: white; padding: 60px; box-sizing: border-box; border: 2px solid #000; }
        .slide.active { display: block; }
        .slide h1 { color: #000; font-size: 44px; margin-bottom: 30px; text-align: center; }
        .slide h2 { color: #000; font-size: 32px; margin-bottom: 20px; }
        .slide p { color: #333; font-size: 22px; line-height: 1.8; }
        .slide ul { padding-left: 50px; }
        .slide li { color: #333; font-size: 22px; margin-bottom: 15px; }
        .nav { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; }
        .nav button { background: #000; color: white; border: 2px solid #000; padding: 12px 24px; margin: 0 10px; cursor: pointer; font-size: 16px; }
      `,
      creative: `
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .slide { display: none; position: relative; width: 100vw; height: 100vh; background: rgba(255,255,255,0.95); padding: 50px; box-sizing: border-box; border-radius: 20px; margin: 20px; backdrop-filter: blur(10px); }
        .slide.active { display: block; }
        .slide h1 { color: #4c51bf; font-size: 52px; margin-bottom: 25px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
        .slide h2 { color: #553c9a; font-size: 38px; margin-bottom: 25px; }
        .slide p { color: #2d3748; font-size: 26px; line-height: 1.7; }
        .slide ul { padding-left: 40px; }
        .slide li { color: #2d3748; font-size: 26px; margin-bottom: 12px; }
        .nav { position: fixed; bottom: 25px; left: 50%; transform: translateX(-50%); z-index: 1000; }
        .nav button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 30px; margin: 0 8px; border-radius: 25px; cursor: pointer; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
      `
    };

    let slidesHtml = '';
    for (let i = 1; i <= slides; i++) {
      slidesHtml += `
        <div class="slide ${i === 1 ? 'active' : ''}" id="slide-${i}">
          <h1>${topic}</h1>
          <h2>Slide ${i}</h2>
          <p>This is slide ${i} content for the topic "${topic}". Add your content here.</p>
          <ul>
            <li>Point 1</li>
            <li>Point 2</li>
            <li>Point 3</li>
          </ul>
        </div>
      `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic} - Presentation</title>
    <style>
${styles[style]}
    </style>
</head>
<body>
    ${slidesHtml}
    <div class="nav">
        <button onclick="prevSlide()">Previous</button>
        <button onclick="nextSlide()">Next</button>
    </div>

    <script>
        let currentSlide = 1;
        const totalSlides = ${slides};

        function showSlide(n) {
            const slides = document.querySelectorAll('.slide');
            slides.forEach(slide => slide.classList.remove('active'));
            document.getElementById('slide-' + n).classList.add('active');
            currentSlide = n;
        }

        function nextSlide() {
            if (currentSlide < totalSlides) {
                showSlide(currentSlide + 1);
            }
        }

        function prevSlide() {
            if (currentSlide > 1) {
                showSlide(currentSlide - 1);
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            }
        });
    </script>
</body>
</html>`;
  };

  const downloadPresentation = () => {
    if (!generatedPresentation) return;
    
    const blob = new Blob([generatedPresentation], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.topic.replace(/\s+/g, '_')}_presentation.html`;
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
          {lang === 'EN' ? 'Create beautiful HTML presentations for your lessons.' :
           lang === 'KZ' ? 'Сабақтарыңызға арналған әдемі HTML презентациялар жасаңыз.' :
           'Создавайте красивые HTML презентации для ваших уроков.'}
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
              {lang === 'EN' ? 'Preview & Download' : lang === 'KZ' ? 'Алдын ала қарау және жүктеу' : 'Предпросмотр и Скачивание'}
            </h3>

            {generatedPresentation ? (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => window.open('data:text/html;charset=utf-8,' + encodeURIComponent(generatedPresentation), '_blank')}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Eye size={20} />
                    {lang === 'EN' ? 'Preview' : lang === 'KZ' ? 'Алдын ала қарау' : 'Предпросмотр'}
                  </button>
                  <button
                    onClick={downloadPresentation}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    {lang === 'EN' ? 'Download' : lang === 'KZ' ? 'Жүктеу' : 'Скачать'}
                  </button>
                </div>
                <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-2xl max-h-64 overflow-y-auto">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {generatedPresentation.substring(0, 500)}...
                  </pre>
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