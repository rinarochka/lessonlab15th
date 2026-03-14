import React, { useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Images, RefreshCw, Search, Eye, CheckCircle2, XCircle } from 'lucide-react';
import Header from '../components/Header';
import api from '../api';

function normalizeAnswer(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:()"'`’”“]/g, '');
}

export default function FourPicturesGame({ lang, setLang, user, setUser }) {
  const location = useLocation();
  const routeState = location.state || {};

  const [topic, setTopic] = useState(routeState.topic || '');
  const [subject, setSubject] = useState(routeState.subject || '');
  const [grade, setGrade] = useState(routeState.grade || '');

  const [round, setRound] = useState(null);
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revealed, setRevealed] = useState(false);

  const t = useMemo(() => ({
    title: lang === 'EN' ? '4 Pictures 1 Word' : lang === 'KZ' ? '4 Сурет 1 Сөз' : '4 Картинки 1 Слово',
    subtitle: lang === 'EN'
      ? 'Choose a topic, generate 4 images from the internet, and guess the word.'
      : lang === 'KZ'
        ? 'Тақырыпты таңдаңыз, интернеттен 4 сурет алыңыз да, сөзді табыңыз.'
        : 'Выберите тему, получите 4 картинки из интернета и угадайте слово.',
    topic: lang === 'EN' ? 'Topic' : lang === 'KZ' ? 'Тақырып' : 'Тема',
    subject: lang === 'EN' ? 'Subject' : lang === 'KZ' ? 'Пән' : 'Предмет',
    grade: lang === 'EN' ? 'Grade / Class' : lang === 'KZ' ? 'Сынып' : 'Класс',
    start: lang === 'EN' ? 'Generate Round' : lang === 'KZ' ? 'Раунд жасау' : 'Сгенерировать раунд',
    generating: lang === 'EN' ? 'Generating...' : lang === 'KZ' ? 'Жасалуда...' : 'Генерация...',
    answer: lang === 'EN' ? 'Your answer' : lang === 'KZ' ? 'Жауабыңыз' : 'Ваш ответ',
    check: lang === 'EN' ? 'Check' : lang === 'KZ' ? 'Тексеру' : 'Проверить',
    reveal: lang === 'EN' ? 'Reveal word' : lang === 'KZ' ? 'Сөзді ашу' : 'Показать слово',
    next: lang === 'EN' ? 'New round' : lang === 'KZ' ? 'Жаңа раунд' : 'Новый раунд',
    back: lang === 'EN' ? 'Back to games' : lang === 'KZ' ? 'Ойындарға оралу' : 'Назад к играм',
    clue: lang === 'EN' ? 'Hint' : lang === 'KZ' ? 'Көмек' : 'Подсказка',
    answerWord: lang === 'EN' ? 'Word' : lang === 'KZ' ? 'Сөз' : 'Слово',
    answerLength: lang === 'EN' ? 'Letters' : lang === 'KZ' ? 'Әріптер' : 'Буквы',
    correct: lang === 'EN' ? 'Correct!' : lang === 'KZ' ? 'Дұрыс!' : 'Верно!',
    wrong: lang === 'EN' ? 'Not quite. Try again.' : lang === 'KZ' ? 'Сәл қате. Қайта көріңіз.' : 'Не совсем. Попробуй ещё.',
    fillTopic: lang === 'EN' ? 'Please enter at least a topic.' : lang === 'KZ' ? 'Кемінде тақырыпты енгізіңіз.' : 'Введите хотя бы тему.',
    openImage: lang === 'EN' ? 'Open source image' : lang === 'KZ' ? 'Сурет көзін ашу' : 'Открыть источник картинки',
  }), [lang]);

  async function generateRound() {
    if (!topic.trim()) {
      alert(t.fillTopic);
      return;
    }

    setLoading(true);
    setError('');
    setStatus(null);
    setRevealed(false);
    setGuess('');

    try {
      const data = await api.generateFourPicturesRound({ topic, subject, grade, lang });
      setRound(data?.data || data);
    } catch (err) {
      setError(err?.message || 'Failed to generate round');
      setRound(null);
    } finally {
      setLoading(false);
    }
  }

  function checkAnswer() {
    if (!round?.answer) return;
    const accepted = [round.answer, ...(round.acceptedAnswers || [])]
      .map(normalizeAnswer)
      .filter(Boolean);

    const isCorrect = accepted.includes(normalizeAnswer(guess));
    setStatus(isCorrect ? 'correct' : 'wrong');
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} />

      <main className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-yellow-500 text-white rounded-2xl border-4 border-black">
                <Images size={28} />
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">{t.title}</h1>
            </div>
            <p className="text-slate-500 font-bold text-lg max-w-3xl">{t.subtitle}</p>
          </div>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black uppercase tracking-widest"
          >
            <ArrowLeft size={18} />
            {t.back}
          </Link>
        </div>

        <section className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[32px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t.topic}
              className="p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent font-bold"
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t.subject}
              className="p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent font-bold"
            />
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder={t.grade}
              className="p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent font-bold"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={generateRound}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-yellow-500 text-white font-black uppercase tracking-widest disabled:opacity-60"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
              {loading ? t.generating : t.start}
            </button>

            {round && (
              <button
                onClick={generateRound}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-slate-200 dark:bg-zinc-800 font-black uppercase tracking-widest disabled:opacity-60"
              >
                <RefreshCw size={18} />
                {t.next}
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold">
              {error}
            </div>
          )}
        </section>

        {round && (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {round.images?.map((image, index) => (
                <article
                  key={`${image.url}-${index}`}
                  className="overflow-hidden bg-white dark:bg-zinc-900 rounded-[28px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000]"
                >
                  <img
                    src={image.url}
                    alt={image.title || `${round.answer} ${index + 1}`}
                    className="w-full h-[240px] md:h-[280px] object-cover bg-slate-100"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-4 flex items-center justify-between gap-3">
                    <span className="font-black uppercase tracking-widest text-sm text-slate-500">#{index + 1}</span>
                    {image.sourcePage && (
                      <a
                        href={image.sourcePage}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold underline"
                      >
                        {t.openImage}
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </section>

            <section className="bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[32px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000]">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
                <div>
                  <div className="flex flex-wrap gap-3 mb-5">
                    <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 font-black text-sm uppercase tracking-widest">
                      {t.clue}: {round.clue}
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 font-black text-sm uppercase tracking-widest">
                      {t.answerLength}: {round.answer?.length || 0}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') checkAnswer();
                      }}
                      placeholder={t.answer}
                      className="flex-1 p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent font-bold text-lg"
                    />
                    <button
                      onClick={checkAnswer}
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-green-600 text-white font-black uppercase tracking-widest"
                    >
                      <CheckCircle2 size={18} />
                      {t.check}
                    </button>
                    <button
                      onClick={() => setRevealed((v) => !v)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-slate-200 dark:bg-zinc-800 font-black uppercase tracking-widest"
                    >
                      <Eye size={18} />
                      {t.reveal}
                    </button>
                  </div>

                  {status === 'correct' && (
                    <div className="mt-4 p-4 rounded-2xl border-2 border-green-600 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 font-bold flex items-center gap-2">
                      <CheckCircle2 size={18} /> {t.correct}
                    </div>
                  )}

                  {status === 'wrong' && (
                    <div className="mt-4 p-4 rounded-2xl border-2 border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                      <XCircle size={18} /> {t.wrong}
                    </div>
                  )}
                </div>

                <div className="min-w-[240px] p-5 rounded-[28px] border-2 border-dashed border-black dark:border-white bg-slate-50 dark:bg-zinc-950">
                  <div className="text-sm uppercase tracking-widest font-black text-slate-500 mb-2">{t.topic}</div>
                  <div className="text-2xl font-black mb-4">{round.topic || topic}</div>
                  <div className="text-sm uppercase tracking-widest font-black text-slate-500 mb-2">{t.answerWord}</div>
                  <div className="text-2xl font-black break-words">
                    {revealed ? round.answer : '• '.repeat(Math.max(round.answer?.length || 0, 1)).trim()}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
