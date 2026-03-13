import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Clock, Trophy } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function StudentTestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quiz, studentName, sessionCode } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz?.time_limit || 0); // in seconds

  useEffect(() => {
    if (!quiz) {
      navigate('/student/join');
      return;
    }

    // Load questions from quiz data
    if (quiz.questions_json) {
      try {
        const parsed = JSON.parse(quiz.questions_json);
        setQuestions(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse questions:', e);
      }
    }

    // Start timer if time limit exists
    if (quiz.time_limit > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quiz, navigate]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setLoading(true);

    try {
      // Prepare answers array
      const answersArray = questions.map((_, idx) => answers[idx] || '');

      // Submit answers
      const res = await fetch(`${API_URL}/api/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: studentName,
          answers: answersArray,
          session_code: sessionCode
        }),
        credentials: 'include'
      });

      if (!res.ok) throw new Error('Submit failed');

      const data = await res.json();
      setResults(data.data || data);
      setSubmitted(true);

      // Save to local progress
      const progress = JSON.parse(localStorage.getItem('student_progress') || '[]');
      progress.push({
        quizId: quiz.id,
        quizTitle: quiz.title || 'Test',
        score: data.score || 0,
        total: questions.length,
        date: new Date().toISOString(),
        answers: answersArray
      });
      localStorage.setItem('student_progress', JSON.stringify(progress.slice(-10))); // Keep last 10

    } catch (e) {
      console.error(e);
      alert('Ошибка отправки ответов');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quiz) return <div>Загрузка...</div>;

  if (submitted && results) {
    const score = results.score || 0;
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-6 font-sans">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Trophy size={64} className="mx-auto text-yellow-500 mb-4" />
            <h1 className="text-4xl font-black uppercase">Результаты теста</h1>
            <p className="text-xl text-slate-500 mt-2">Ты молодец, {studentName}!</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0_0_#000] mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl font-black text-green-600">{score}/{total}</div>
              <div className="text-xl font-bold">{percentage}% правильных ответов</div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAnswer = answers[idx] || '';
                const correctAnswer = q.answer || '';
                const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();

                return (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                      <span className="font-bold">{idx + 1}. {q.question}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {q.options?.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const isUserChoice = letter === userAnswer;
                        const isCorrectChoice = letter === correctAnswer;

                        return (
                          <div
                            key={letter}
                            className={`p-2 rounded-lg border ${
                              isCorrectChoice
                                ? 'bg-green-200 border-green-400'
                                : isUserChoice && !isCorrect
                                ? 'bg-red-200 border-red-400'
                                : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                            }`}
                          >
                            <span className="font-bold mr-2">{letter}.</span>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase hover:bg-blue-500"
            >
              Вернуться в кабинет
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black uppercase">Тест: {quiz.title || 'Без названия'}</h1>
          {timeLeft > 0 && (
            <div className="flex items-center gap-2 text-xl font-bold">
              <Clock size={24} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-700">
              <div className="font-bold mb-4">{idx + 1}. {q.question}</div>
              <div className="grid grid-cols-1 gap-2">
                {q.options?.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = answers[idx] === letter;

                  return (
                    <label key={letter} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800">
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        value={letter}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(idx, letter)}
                        className="w-4 h-4"
                      />
                      <span className="font-bold">{letter}.</span>
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length < questions.length}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-white ${
              loading || Object.keys(answers).length < questions.length
                ? 'bg-gray-400'
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {loading ? 'Отправка...' : 'Завершить тест'}
          </button>
        </div>
      </div>
    </div>
  );
}
