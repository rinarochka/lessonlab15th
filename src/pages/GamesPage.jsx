import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Lock, Gamepad2, Search } from 'lucide-react';
import { tr } from "../lib/i18n";
import Header from "../components/Header";
import api from '../api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const GamesPage = ({ lang, setLang, user, setUser }) => {
  const [gameTopic, setGameTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [sessionGenId, setSessionGenId] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const generateSessionCode = async () => {
    if (!gameTopic.trim() || !subject.trim() || !grade.trim()) {
      alert(lang === 'EN' ? 'Please fill in topic, subject and grade.' : lang === 'KZ' ? 'Тақырыпты, пәнді және сыныпты толтырыңыз.' : 'Пожалуйста, заполните тему, предмет и класс.');
      return;
    }

    // Always generate a local session so the feature works without auth
    const code = () => Math.floor(1000 + Math.random() * 9000).toString();
    let newCode = code();
    let key = `lessonlab_game_session_${newCode}`;
    while (localStorage.getItem(key)) {
      newCode = code();
      key = `lessonlab_game_session_${newCode}`;
    }

    const session = {
      code: newCode,
      topic: gameTopic.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      createdAt: Date.now(),
      game: 'connections',
    };
    localStorage.setItem(key, JSON.stringify(session));

    setSessionCode(newCode);
    setShowSessionModal(true);

    // If user is logged in, also create persistent server session (optional)
    if (user) {
      try {
        const gen = await api.generations.create({
          type: 'game',
          subject: session.subject,
          topic: session.topic,
          grade: session.grade,
          lang,
          prompt: '',
          status: 'done',
          result_md: '',
        });

        const res = await fetch(`${API_URL}/api/quiz/start`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: gen.id }),
        });
        const data = await res.json();
        if (res.ok) {
          const serverCode = data.data?.code || data.code;
          setSessionCode(serverCode);
          setSessionGenId(gen.id);
          // Also keep local copy so join works
          localStorage.setItem(
            `lessonlab_game_session_${serverCode}`,
            JSON.stringify({ ...session, code: serverCode, serverGenId: gen.id })
          );
        }
      } catch (e) {
        console.warn('Could not create server session (auth required):', e);
      }
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(sessionCode).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">
      
      {/* ХЕДЕР */}
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} />

      <main className="max-w-6xl mx-auto px-10">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl">
                <Gamepad2 size={32} />
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter italic">
              {tr(lang, "hub.games").replace(" (Скоро)", "").replace(" (Soon)", "").replace(" (Жақында)", "")}
            </h1>
        </div>
        <p className="text-xl text-slate-500 font-bold mb-16 max-w-2xl ml-20">
           {lang === 'EN' ? "Your zone. Take quizzes and level up." : 
            lang === 'KZ' ? "Сіздің аймағыңыз. Тест тапсырып, деңгейіңізді көтеріңіз." : 
            "Твоя зона. Проходи тесты и поднимай уровень."}
        </p>

        {/* Форма для ввода темы */}
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] mb-12 max-w-2xl mx-auto">
          <h3 className="text-2xl font-black uppercase mb-6 text-center">
            {lang === 'EN' ? "Set Game Topic" : lang === 'KZ' ? "Ойын Тақырыбын Орнату" : "Установить Тему Игры"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={gameTopic}
              onChange={(e) => setGameTopic(e.target.value)}
              placeholder={lang === 'EN' ? "Topic" : lang === 'KZ' ? "Тақырып" : "Тема"}
              className="p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent font-bold"
            />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={lang === 'EN' ? "Subject" : lang === 'KZ' ? "Пән" : "Предмет"}
              className="p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent font-bold"
            />
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder={lang === 'EN' ? "Grade / Class" : lang === 'KZ' ? "Сынып" : "Класс"}
              className="p-4 border-2 border-black dark:border-white rounded-2xl bg-transparent font-bold"
            />
          </div>
          <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
            <button
              onClick={generateSessionCode}
              className="w-full md:w-auto bg-black text-white dark:bg-white dark:text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 justify-center"
            >
              <Search size={20} />
              {lang === 'EN' ? "Generate Code" : lang === 'KZ' ? "Код жасау" : "Сгенерировать код"}
            </button>
            {sessionCode && (
              <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest">
                <span>{lang === 'EN' ? 'Code:' : lang === 'KZ' ? 'Код:' : 'Код:'}</span>
                <span className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-2xl text-lg font-black">{sessionCode}</span>
                <button
                  onClick={copyCodeToClipboard}
                  className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition"
                >
                  {lang === 'EN' ? 'Copy' : lang === 'KZ' ? 'Көшіру' : 'Копировать'}
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-4 text-center">
            {lang === 'EN' ? "Games will be generated based on this topic, subject and grade." : 
             lang === 'KZ' ? "Ойындар осы тақырып, пән және сынып негізінде жасалады." : 
             "Игры будут генерироваться на основе этой темы, предмета и класса."}
          </p>
        </div>

        {showSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-2xl border-[4px] border-black dark:border-white">
              <h2 className="text-3xl font-black mb-4 text-center">{lang === 'EN' ? 'Share this code with your students' : lang === 'KZ' ? 'Оқушылармен осы кодты бөлісіңіз' : 'Поделитесь этим кодом с учениками'}</h2>
              <p className="text-slate-500 dark:text-slate-300 text-center mb-6">
                {lang === 'EN' ? 'Students can join the game using this code.' : lang === 'KZ' ? 'Оқушылар ойынға осы код арқылы қосыла алады.' : 'Ученики могут присоединиться к игре по этому коду.'}
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="px-6 py-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-black text-3xl tracking-widest">{sessionCode}</div>
                <button onClick={copyCodeToClipboard} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition">{lang === 'EN' ? 'Copy' : lang === 'KZ' ? 'Көшіру' : 'Копировать'}</button>
              </div>
              <button onClick={() => setShowSessionModal(false)} className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition">{lang === 'EN' ? 'Close' : lang === 'KZ' ? 'Жабу' : 'Закрыть'}</button>
            </div>
          </div>
        )}

        {/* ГРИД СЕТКА */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* 1. ВОЙТИ В ТЕСТ */}
          <Link 
            to="/join-test" 
            className="group bg-white dark:bg-zinc-900 p-10 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <Play size={40} fill="currentColor" />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Join Quiz" : lang === 'KZ' ? "Тестке кіру" : "Войти в Тест"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Enter teacher's code to start." : 
                 lang === 'KZ' ? "Бастау үшін мұғалімнің кодын енгізіңіз." : 
                 "Введи код учителя, чтобы начать соревнование."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-black text-white px-6 py-3 rounded-full">GO!</span>
            </div>
          </Link>

          {/* 2. Connections Game */}
          <Link 
            to="/games/connections" 
            state={{ topic: gameTopic, subject, grade, sessionCode, sessionGenId }}
            className="group bg-white dark:bg-zinc-900 p-10 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-green-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Connections" : lang === 'KZ' ? "Байланыстар" : "Connections"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Find connections between words." : 
                 lang === 'KZ' ? "Сөздер арасындағы байланыстарды табыңыз." : 
                 "Найди связи между словами."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-green-600 text-white px-6 py-3 rounded-full">PLAY</span>
            </div>
          </Link>

          {/* 3. Codenames Game */}
          <Link 
            to="/games/codenames" 
            state={{ topic: gameTopic, subject, grade, sessionCode, sessionGenId }}
            className="group bg-white dark:bg-zinc-900 p-10 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-red-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Codenames" : lang === 'KZ' ? "Кодтық Аттар" : "Codenames"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Give clues to guess words." : 
                 lang === 'KZ' ? "Сөздерді болжау үшін ишарат беріңіз." : 
                 "Давай подсказки, чтобы угадать слова."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-red-600 text-white px-6 py-3 rounded-full">PLAY</span>
            </div>
          </Link>

          {/* 4. 4 Pictures 1 Word */}
          <Link 
            to="/games/four-pictures" 
            className="group bg-white dark:bg-zinc-900 p-10 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-yellow-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "4 Pictures 1 Word" : lang === 'KZ' ? "4 Сурет 1 Сөз" : "4 Картинки 1 Слово"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Guess the word from pictures." : 
                 lang === 'KZ' ? "Суреттерден сөзді болжаныз." : 
                 "Угадай слово по картинкам."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-yellow-600 text-white px-6 py-3 rounded-full">PLAY</span>
            </div>
          </Link>

          {/* 5. Odd One Out */}
          <Link 
            to="/games/odd-one-out" 
            className="group bg-white dark:bg-zinc-900 p-10 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-purple-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  <circle cx="9" cy="9" r="2"/>
                  <circle cx="15" cy="15" r="2"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Odd One Out" : lang === 'KZ' ? "Бөлек Бір" : "Лишний"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Find the item that doesn't belong." : 
                 lang === 'KZ' ? "Жататын элементті табыңыз." : 
                 "Найди элемент, который не подходит."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-purple-600 text-white px-6 py-3 rounded-full">PLAY</span>
            </div>
          </Link>

          {/* 6. Crosswords */}
          <Link 
            to="/games/crosswords" 
            className="group bg-white dark:bg-zinc-900 p-10 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0px_0px_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col justify-between h-[360px]"
          >
            <div>
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-8 border-4 border-black dark:border-white/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM11 7h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                </svg>
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4">
                {lang === 'EN' ? "Crosswords" : lang === 'KZ' ? "Кроссвордтар" : "Кроссворды"}
              </h3>
              <p className="text-slate-500 font-bold text-lg leading-tight">
                {lang === 'EN' ? "Solve word puzzles." : 
                 lang === 'KZ' ? "Сөз жұмбақтарын шешіңіз." : 
                 "Реши словесные головоломки."}
              </p>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="font-black uppercase text-sm tracking-widest bg-indigo-600 text-white px-6 py-3 rounded-full">PLAY</span>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
};

export default GamesPage;