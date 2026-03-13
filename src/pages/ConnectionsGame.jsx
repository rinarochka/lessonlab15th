import React, { useState, useEffect } from "react";
import { ArrowLeft, Shuffle, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useAI } from "../hooks/useAI";

const ConnectionsGame = ({ lang, setLang, user, setUser, ...accessProps }) => {
  const location = useLocation();
  const quiz = location.state?.quiz;
  const topic = quiz?.topic || location.state?.topic || "General Knowledge";
  const subject = quiz?.subject || location.state?.subject || "";
  const grade = quiz?.grade || location.state?.grade || "";
  const sessionCode = quiz?.access_code || location.state?.sessionCode || "";
  const studentName = location.state?.studentName || "";
  const isStudent = Boolean(location.state?.isStudent);

  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [selectedWords, setSelectedWords] = useState([]);
  const [foundGroups, setFoundGroups] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Generate game data based on topic, subject, and grade
  const generateGameData = (topic, subject, grade) => {
    const topicLower = (subject || topic).toLowerCase();
    const gradeNum = parseInt(grade, 10);

    // Helper for selecting difficulty based on grade
    const pick = (easy, hard) => (gradeNum && gradeNum > 6 ? hard : easy);

    if (topicLower.includes('math') || topicLower.includes('математика')) {
      return {
        groups: [
          {
            name: { EN: "Geometry Shapes", KZ: "Геометриялық пішіндер", RU: "Геометрические фигуры" },
            words: pick(["Circle", "Square", "Triangle", "Rectangle"], ["Ellipse", "Rhombus", "Trapezoid", "Pentagon"]),
            color: "bg-blue-100 border-blue-300"
          },
          {
            name: { EN: "Numbers", KZ: "Сандар", RU: "Числа" },
            words: pick(["Even", "Odd", "Ten", "Zero"], ["Prime", "Integer", "Rational", "Irrational"]),
            color: "bg-green-100 border-green-300"
          },
          {
            name: { EN: "Operations", KZ: "Операциялар", RU: "Операции" },
            words: pick(["Add", "Subtract", "Multiply", "Divide"], ["Integrate", "Differentiate", "Factor", "Expand"]),
            color: "bg-yellow-100 border-yellow-300"
          },
          {
            name: { EN: "Math Terms", KZ: "Математикалық терминдер", RU: "Математические термины" },
            words: pick(["Shape", "Angle", "Line", "Point"], ["Algebra", "Calculus", "Geometry", "Statistics"]),
            color: "bg-purple-100 border-purple-300"
          }
        ]
      };
    } else if (
      topicLower.includes('biology') ||
      topicLower.includes('биология') ||
      subject.toLowerCase().includes('bio') ||
      topicLower.includes('cell') ||
      topicLower.includes('ядро') ||
      topicLower.includes('клетка')
    ) {
      return {
        groups: [
          {
            name: { EN: "Cell Structure", KZ: "Жасуша құрылымы", RU: "Строение клетки" },
            words: pick(["Nucleus", "Membrane", "Cytoplasm", "Mitochondria"], ["Ribosome", "Golgi", "Lysosome", "Vacuole"]),
            color: "bg-emerald-100 border-emerald-300"
          },
          {
            name: { EN: "Body Systems", KZ: "Дене жүйелері", RU: "Системы тела" },
            words: pick(["Digestive", "Respiratory", "Circulatory", "Nervous"], ["Endocrine", "Immune", "Skeletal", "Muscular"]),
            color: "bg-teal-100 border-teal-300"
          },
          {
            name: { EN: "Classification", KZ: "Сыныптау", RU: "Классификация" },
            words: pick(["Mammal", "Bird", "Reptile", "Fish"], ["Amphibian", "Arthropod", "Fungi", "Protist"]),
            color: "bg-lime-100 border-lime-300"
          },
          {
            name: { EN: "Ecosystems", KZ: "Экожүйелер", RU: "Экосистемы" },
            words: pick(["Forest", "Ocean", "Desert", "Wetland"], ["Tundra", "Grassland", "Coral", "Mangrove"]),
            color: "bg-cyan-100 border-cyan-300"
          }
        ]
      };
    } else if (topicLower.includes('history') || topicLower.includes('история')) {
      return {
        groups: [
          {
            name: { EN: "Ancient Civilizations", KZ: "Ежелгі өркениеттер", RU: "Древние цивилизации" },
            words: pick(["Egypt", "Rome", "Greece", "China"], ["Mesopotamia", "Maya", "Indus", "Persia"]),
            color: "bg-amber-100 border-amber-300"
          },
          {
            name: { EN: "Modern Eras", KZ: "Қазіргі дәуірлер", RU: "Современные эпохи" },
            words: pick(["Renaissance", "Industrial", "Digital", "Space"], ["Enlightenment", "Revolution", "Cold War", "Global" ]),
            color: "bg-cyan-100 border-cyan-300"
          },
          {
            name: { EN: "Famous Leaders", KZ: "Әйгілі көшбасшылар", RU: "Знаменитые лидеры" },
            words: pick(["Caesar", "Cleopatra", "Genghis", "Napoleon"], ["Alexander", "Churchill", "Mandela", "Lincoln"]),
            color: "bg-red-100 border-red-300"
          },
          {
            name: { EN: "Historical Events", KZ: "Тарихи оқиғалар", RU: "Исторические события" },
            words: pick(["War", "Discovery", "Independence", "Revolution"], ["Treaty", "Colony", "Constitution", "Migration"]),
            color: "bg-indigo-100 border-indigo-300"
          }
        ]
      };
    }

    // Default general knowledge
    return {
      groups: [
        {
          name: { EN: "Colors", KZ: "Түстер", RU: "Цвета" },
          words: pick(["Red", "Blue", "Green", "Yellow"], ["Magenta", "Cyan", "Turquoise", "Olive"]),
          color: "bg-red-100 border-red-300"
        },
        {
          name: { EN: "Animals", KZ: "Жануарлар", RU: "Животные" },
          words: pick(["Cat", "Dog", "Bird", "Fish"], ["Dolphin", "Panther", "Falcon", "Shark"]),
          color: "bg-blue-100 border-blue-300"
        },
        {
          name: { EN: "Fruits", KZ: "Жемістер", RU: "Фрукты" },
          words: pick(["Apple", "Banana", "Orange", "Grape"], ["Pomegranate", "Kiwi", "Mango", "Papaya"]),
          color: "bg-green-100 border-green-300"
        },
        {
          name: { EN: "Countries", KZ: "Елдер", RU: "Страны" },
          words: pick(["France", "Germany", "Italy", "Spain"], ["Portugal", "Sweden", "Norway", "Poland"]),
          color: "bg-yellow-100 border-yellow-300"
        }
      ]
    };
  };

  const { loading: aiLoading, error: aiError, result: aiResult, run: runAI } = useAI();
  const [gameData, setGameData] = useState(() => generateGameData(topic, subject, grade));

  useEffect(() => {
    // Always set fallback game data immediately (so UI is playable without AI)
    setGameData(generateGameData(topic, subject, grade));

    // Try to generate improved game data via AI based on the topic/subject/grade
    if (topic?.trim()) {
      runAI('game_connections', { topic, subject, grade, lang });
    }
  }, [topic, subject, grade, lang, runAI]);

  useEffect(() => {
    if (aiResult?.groups && Array.isArray(aiResult.groups) && aiResult.groups.length) {
      setGameData(aiResult);
    }
  }, [aiResult]);

  useEffect(() => {
    // Shuffle all words
    const allWords = gameData.groups.flatMap(group => group.words);
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [gameData]);

  const handleWordClick = (word) => {
    if (gameState !== 'playing') return;

    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 4) return;

    setAttempts(attempts + 1);

    // Check if selected words form a valid group
    const validGroup = gameData.groups.find(group =>
      selectedWords.every(word => group.words.includes(word)) &&
      selectedWords.length === group.words.length
    );

    if (validGroup) {
      const nextFound = [...foundGroups, { ...validGroup, words: selectedWords }];
      setFoundGroups(nextFound);
      setSelectedWords([]);

      // Remove found words from shuffled words
      setShuffledWords(shuffledWords.filter(word => !selectedWords.includes(word)));

      // Check win condition
      if (nextFound.length === gameData.groups.length) {
        setGameState('won');
        setShowSuccessModal(true);
      }
    } else {
      // Wrong guess - could add penalty logic here
      setSelectedWords([]);
    }
  };

  const handleShuffle = () => {
    const remainingWords = shuffledWords.filter(word =>
      !foundGroups.some(group => group.words.includes(word))
    );
    const shuffled = [...remainingWords].sort(() => Math.random() - 0.5);
    setShuffledWords([...foundGroups.flatMap(g => g.words), ...shuffled]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">

      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-4xl mx-auto px-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/games"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">
              {lang === 'EN' ? 'Back to Games' : lang === 'KZ' ? 'Ойындарға қайту' : 'Назад к играм'}
            </span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-black uppercase tracking-tight">
              {lang === 'EN' ? 'Connections' : lang === 'KZ' ? 'Байланыстар' : 'Connections'}
            </h1>
            <div className="space-y-2">
              <p className="text-slate-500 mt-2">
                {lang === 'EN' ? `Topic: ${topic}` : lang === 'KZ' ? `Тақырып: ${topic}` : `Тема: ${topic}`}
              </p>
              {(subject || grade) && (
                <p className="text-slate-500 text-sm">
                  {subject && (lang === 'EN' ? `Subject: ${subject}` : lang === 'KZ' ? `Пән: ${subject}` : `Предмет: ${subject}`)}
                  {subject && grade ? ' · ' : ''}
                  {grade && (lang === 'EN' ? `Grade: ${grade}` : lang === 'KZ' ? `Сынып: ${grade}` : `Класс: ${grade}`)}
                </p>
              )}
              <p className="text-slate-400 text-sm">
                {lang === 'EN' ? 'Find groups of four related words' : lang === 'KZ' ? 'Төрт байланысты сөздің топтарын табыңыз' : 'Найди группы из четырех связанных слов'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-slate-500">
              {lang === 'EN' ? 'Attempts' : lang === 'KZ' ? 'Әрекеттер' : 'Попытки'}: {attempts}
            </div>
            <div className="text-sm text-slate-500">
              {lang === 'EN' ? 'Groups found' : lang === 'KZ' ? 'Топтар табылды' : 'Групп найдено'}: {foundGroups.length}/4
            </div>
          </div>
        </div>

        {aiLoading && (
          <div className="mb-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-800 dark:text-blue-200">
            {lang === 'EN' ? 'Generating game groups based on your topic…' : lang === 'KZ' ? 'Ойын топтары тақырыпқа сәйкес жасалуда…' : 'Группы генерируются на основе темы…'}
          </div>
        )}

        {aiError && (
          <div className="mb-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 text-sm text-red-800 dark:text-red-200">
            {lang === 'EN'
              ? `AI generation failed: ${aiError}`
              : lang === 'KZ'
              ? `AI генерациясы сәтсіз аяқталды: ${aiError}`
              : `Генерация ИИ не удалась: ${aiError}`}
          </div>
        )}

        {/* Found Groups */}
        <div className="mb-8 space-y-3">
          {foundGroups.map((group, index) => (
            <div
              key={index}
              className={`p-4 rounded-2xl border-2 ${group.color} dark:bg-opacity-20`}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {group.words.map(word => (
                    <span
                      key={word}
                      className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-lg font-medium text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <span className="font-bold text-sm">
                  {group.name[lang] || group.name.EN}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Game Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-3">
            {shuffledWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word)}
                className={`p-4 rounded-2xl font-bold text-center transition-all border-2 ${
                  selectedWords.includes(word)
                    ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-105'
                    : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'
                }`}
                disabled={foundGroups.some(group => group.words.includes(word))}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleShuffle}
            className="px-6 py-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Shuffle size={20} />
            {lang === 'EN' ? 'Shuffle' : lang === 'KZ' ? 'Араластыру' : 'Перемешать'}
          </button>

          <button
            onClick={handleSubmit}
            disabled={selectedWords.length !== 4}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${
              selectedWords.length === 4
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                : 'bg-slate-200 dark:bg-zinc-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {lang === 'EN' ? 'Submit' : lang === 'KZ' ? 'Жіберу' : 'Отправить'}
          </button>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-900 p-10 rounded-[40px] shadow-2xl border-[4px] border-black dark:border-white">
              <div className="flex items-center justify-center gap-3 mb-6">
                <CheckCircle size={32} className="text-green-600" />
                <h2 className="text-3xl font-black uppercase">
                  {lang === 'EN' ? 'Success!' : lang === 'KZ' ? 'Жетістік!' : 'Успех!'}
                </h2>
              </div>
              <p className="text-center text-slate-500 dark:text-slate-300 mb-6">
                {lang === 'EN'
                  ? `You solved all groups. ${studentName ? `Good job, ${studentName}!` : ''}`
                  : lang === 'KZ'
                  ? `Барлық топтарды шештіңіз. ${studentName ? `${studentName}, жақсы жұмыс!` : ''}`
                  : `Вы решили все группы. ${studentName ? `Отлично, ${studentName}!` : ''}`}
              </p>

              {sessionCode && (
                <div className="mb-6 text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {lang === 'EN' ? 'Session code' : lang === 'KZ' ? 'Сессия коды' : 'Код сессии'}
                  </div>
                  <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-zinc-800 px-6 py-3 rounded-2xl font-black text-3xl tracking-widest">
                    {sessionCode}
                    <button onClick={() => navigator.clipboard.writeText(sessionCode)} className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition">
                      {lang === 'EN' ? 'Copy' : lang === 'KZ' ? 'Көшіру' : 'Копировать'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setGameState('playing');
                    setFoundGroups([]);
                    setSelectedWords([]);
                    setAttempts(0);
                    const allWords = gameData.groups.flatMap(group => group.words);
                    setShuffledWords([...allWords].sort(() => Math.random() - 0.5));
                  }}
                  className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-green-500 transition"
                >
                  {lang === 'EN' ? 'Play Again' : lang === 'KZ' ? 'Тағы ойнау' : 'Играть снова'}
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setGameState('playing');
                  }}
                  className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition"
                >
                  {lang === 'EN' ? 'Close' : lang === 'KZ' ? 'Жабу' : 'Закрыть'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConnectionsGame;