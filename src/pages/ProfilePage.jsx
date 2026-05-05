import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Trophy, Award, Coins, User, Lock, Mail, Edit3, X, Phone } from "lucide-react";
import { I18N as t } from "../lib/i18n";
import { invalidate } from "../apiCache";
import AchievementToast from "../components/AchievementToast";
import Footer from "../components/Footer";
import Header from "../components/Header"; // Импортируем Header

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ACHIEVEMENT_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3';
const DEMO_USER_KEY = 'teach_and_study_demo_user';

function getNameParts(user) {
  if (user?.first_name && !(user.first_name === "Teach" && user.last_name === "Study")) {
    return { firstName: user.first_name, lastName: user.last_name || "" };
  }

  const local = String(user?.email || "guest").split("@")[0];
  const parts = local.replace(/[._-]+/g, " ").split(" ").filter(Boolean);
  const format = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

  return {
    firstName: format(parts[0]) || "Guest",
    lastName: format(parts.slice(1).join(" ")) || "",
  };
}

export default function ProfilePage({ lang, setLang, user, setUser }) {
  // Переводы
  const cur = t[lang]?.prof || t.RU.prof;

  // Данные профиля (локальный стейт для редактирования)
  const initialName = getNameParts(user);
  const [profileData, setProfileData] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    username: user?.email || "@guest",
    phone: user?.phone || "",
    subjects: user?.subjects || "",
    individualPrice: user?.individualPrice || "",
    groupPrice: user?.groupPrice || "",
    groupSize: user?.groupSize || "",
    availableTime: user?.availableTime || "",
    streamName: user?.streamName || "",
    groupStart: user?.groupStart || "",
    avatar: "https://moyashkola.gosuslugi.ru/netcat_files/9/67/avatar_0.png",
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempData, setTempData] = useState(profileData);
  const [coins, setCoins] = useState(user?.coins || 0);
  const [toast, setToast] = useState({ show: false, reward: 0 });

  // Рефы
  const audioRef = useRef(new Audio(ACHIEVEMENT_SOUND));
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const name = getNameParts(user);
    setProfileData((prev) => ({
      ...prev,
      firstName: name.firstName,
      lastName: name.lastName,
      username: user.email || prev.username,
      phone: user.phone || prev.phone || "",
      subjects: user.subjects || prev.subjects || "",
      individualPrice: user.individualPrice || prev.individualPrice || "",
      groupPrice: user.groupPrice || prev.groupPrice || "",
      groupSize: user.groupSize || prev.groupSize || "",
      availableTime: user.availableTime || prev.availableTime || "",
      streamName: user.streamName || prev.streamName || "",
      groupStart: user.groupStart || prev.groupStart || "",
    }));
    setTempData((prev) => ({
      ...prev,
      firstName: name.firstName,
      lastName: name.lastName,
      username: user.email || prev.username,
      phone: user.phone || prev.phone || "",
      subjects: user.subjects || prev.subjects || "",
      individualPrice: user.individualPrice || prev.individualPrice || "",
      groupPrice: user.groupPrice || prev.groupPrice || "",
      groupSize: user.groupSize || prev.groupSize || "",
      availableTime: user.availableTime || prev.availableTime || "",
      streamName: user.streamName || prev.streamName || "",
      groupStart: user.groupStart || prev.groupStart || "",
    }));
  }, [user]);

  // Логика горизонтального скролла
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
        const { current } = scrollContainerRef;
        const scrollAmount = 300;
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

  // Проверка ачивки при входе
  useEffect(() => {
    if (!user) return;
    audioRef.current.preload = 'auto';
    audioRef.current.volume = 0.5;

    const checkAchievement = async () => {
      try {
        const response = await fetch(`${API_URL}/api/achievements/grant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ key: 'visit_profile' })
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          if (data.new) {
            audioRef.current.play().catch(() => {});
            setToast({ show: true, reward: data.reward });
            if (data.coins !== undefined) {
               setCoins(data.coins);
               invalidate("me");
            }
          }
        }
      } catch (e) {
        console.error("Err:", e);
      }
    };
    checkAchievement();
  }, [user]);

  // Сохранение профиля (пока локально + мок)
  const handleSave = () => {
    setProfileData(tempData);
    setUser?.((prev) => {
      const next = {
        ...prev,
        first_name: tempData.firstName.trim(),
        last_name: tempData.lastName.trim(),
        email: tempData.username.trim(),
        phone: tempData.phone.trim(),
        subjects: tempData.subjects.trim(),
        individualPrice: tempData.individualPrice.trim(),
        groupPrice: tempData.groupPrice.trim(),
        groupSize: tempData.groupSize.trim(),
        availableTime: tempData.availableTime.trim(),
        streamName: tempData.streamName.trim(),
        groupStart: tempData.groupStart,
      };
      if (next?.is_demo) {
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(next));
      }
      return next;
    });
    setIsEditOpen(false);
    // Тут можно добавить api.updateUser(tempData)...
  };

  // Список ачивок
  const achievements = [
    { id: 1, title: "Первый шаг", desc: "Регистрация", icon: <User size={20} />, unlocked: true, color: "bg-blue-500" },
    { id: 2, title: "Богач", desc: "500 монет", icon: <Coins size={20} />, unlocked: coins >= 500, color: "bg-yellow-500" },
    { id: 3, title: "В профиле", desc: "Посетить профиль", icon: <Award size={20} />, unlocked: true, color: "bg-purple-500" },
    { id: 4, title: "Мастер", desc: "Сделать 5 тестов", icon: <Trophy size={20} />, unlocked: false, color: "bg-red-500" },
    { id: 5, title: "Спидран", desc: "Тест < 1 мин", icon: <User size={20} />, unlocked: false, color: "bg-orange-500" },
    { id: 6, title: "Эрудит", desc: "100% результат", icon: <Award size={20} />, unlocked: false, color: "bg-green-500" },
    { id: 7, title: "Легенда", desc: "Топ-1 рейтинг", icon: <Award size={20} />, unlocked: false, color: "bg-pink-500" },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">
      
      {/* ХЕДЕР (showProfile={false}, чтобы не было кнопки профиля внутри профиля) */}
      <Header 
        lang={lang} 
        setLang={setLang} 
        user={user} 
        setUser={setUser} 
        showProfile={false} 
      />

      {/* CSS для скрытия скроллбара */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Тост ачивки */}
      <AchievementToast 
        show={toast.show} 
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
        title="Ачивка разблокирована!"
        reward={toast.reward}
        description="Первое посещение профиля."
      />

      <main className="max-w-[1300px] mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* === ЛЕВАЯ КОЛОНКА (Инфо + Монеты) === */}
            <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
              
              {/* Карточка юзера */}
              <div>
                <div className="w-full aspect-square bg-slate-200 dark:bg-zinc-800 border-[4px] border-black dark:border-white rounded-xl overflow-hidden mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <img src={profileData.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 mb-6">
                    <h1 className="text-3xl font-black tracking-tighter leading-tight break-words">
                    {profileData.firstName} {profileData.lastName}
                    </h1>
                    <p className="text-sm opacity-50 font-bold tracking-tight flex items-center gap-2">
                        <Mail size={14} /> {profileData.username}
                    </p>
                    {profileData.phone && (
                      <p className="text-sm opacity-50 font-bold tracking-tight flex items-center gap-2">
                          <Phone size={14} /> {profileData.phone}
                      </p>
                    )}
                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-black mt-2
                        ${user.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {user.role === 'teacher' ? 'Учитель' : 'Ученик'}
                    </div>
                </div>

                {user.role === 'teacher' && (
                  <div className="mb-6 p-4 bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-3">Параметры преподавателя</div>
                    <div className="space-y-2 text-sm font-bold">
                      <div><span className="opacity-50">Предметы:</span> {profileData.subjects || "Не указано"}</div>
                      <div><span className="opacity-50">Индивидуально:</span> {profileData.individualPrice ? `${profileData.individualPrice} тг` : "Не указано"}</div>
                      <div><span className="opacity-50">Группа:</span> {profileData.groupPrice ? `${profileData.groupPrice} тг` : "Не указано"}</div>
                      <div><span className="opacity-50">Людей в группе:</span> {profileData.groupSize || "Не указано"}</div>
                      <div><span className="opacity-50">Время:</span> {profileData.availableTime || "Не указано"}</div>
                      <div><span className="opacity-50">Поток:</span> {profileData.streamName || "Не указано"}</div>
                      <div><span className="opacity-50">Старт группы:</span> {profileData.groupStart || "Не указано"}</div>
                    </div>
                  </div>
                )}

                <button
                    onClick={() => {
                      setTempData(profileData);
                      setIsEditOpen(true);
                    }}
                    className="w-full py-3 bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                >
                    <Edit3 size={14} /> {cur.edit || "РЕДАКТИРОВАТЬ"}
                </button>
              </div>

              {user.role === 'student' && (
                <div className="bg-yellow-400 text-black p-6 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Твой баланс</span>
                   <div className="text-5xl font-black flex items-center gap-2 mt-1">
                      <Coins size={32} fill="white" className="text-black" />
                      {coins}
                   </div>
                </div>
              )}
            </div>

            {/* === ПРАВАЯ КОЛОНКА (Слайдер Ачивок) === */}
            {user.role === 'student' && (
            <div className="flex-1 w-full bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] p-8 overflow-hidden flex flex-col min-h-[400px]">
              
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100 dark:border-zinc-800">
                 <div className="flex items-center gap-3">
                    <Trophy size={32} className="text-blue-600" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Достижения</h2>
                 </div>
                 
                 {/* Кнопки навигации */}
                 <div className="flex gap-2">
                    <button onClick={() => scroll('left')} className="p-2 border-2 border-black dark:border-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scroll('right')} className="p-2 border-2 border-black dark:border-white rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95">
                        <ChevronRight size={20} />
                    </button>
                 </div>
              </div>

              {/* КОНТЕЙНЕР ГОРИЗОНТАЛЬНОГО СКРОЛЛА */}
              <div 
                 ref={scrollContainerRef}
                 className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth items-stretch h-full"
              >
                 {achievements.map((ach) => (
                     <div 
                        key={ach.id}
                        className={`min-w-[220px] max-w-[220px] snap-start relative p-5 rounded-xl border-[3px] transition-all flex flex-col items-center text-center gap-4 group shrink-0
                        ${ach.unlocked 
                            ? 'bg-slate-50 dark:bg-zinc-800 border-black dark:border-zinc-500' 
                            : 'bg-transparent border-slate-200 dark:border-zinc-800 opacity-60 grayscale'
                        }`}
                     >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white border-2 border-black/10 shadow-sm ${ach.unlocked ? ach.color : 'bg-slate-300'}`}>
                            {React.cloneElement(ach.icon, { size: 28 })}
                        </div>
                        
                        <div>
                            <div className="font-black uppercase text-xs mb-1">{ach.title}</div>
                            <div className="text-[10px] font-bold text-slate-400 leading-tight">{ach.desc}</div>
                        </div>

                        {ach.unlocked ? (
                            <div className="mt-auto pt-2 text-green-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                 <Award size={12} /> Открыто
                            </div>
                        ) : (
                            <div className="mt-auto pt-2 text-slate-300 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                 <Lock size={12} /> Закрыто
                            </div>
                        )}
                     </div>
                 ))}
              </div>
              
            </div>
            )}

            {user.role === 'teacher' && (
              <div className="flex-1 w-full bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] p-8 min-h-[400px]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <User size={32} className="text-blue-600" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic">Параметры преподавателя</h2>
                  </div>
                  <button
                    onClick={() => {
                      setTempData(profileData);
                      setIsEditOpen(true);
                    }}
                    className="px-5 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest"
                  >
                    Изменить
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-black/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Предметы</div>
                    <div className="text-2xl font-black">{profileData.subjects || "Не указано"}</div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-black/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Индивидуальный урок</div>
                    <div className="text-2xl font-black">{profileData.individualPrice ? `${profileData.individualPrice} тг` : "Не указано"}</div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-black/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Групповое занятие</div>
                    <div className="text-2xl font-black">{profileData.groupPrice ? `${profileData.groupPrice} тг` : "Не указано"}</div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-black/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Людей в группе</div>
                    <div className="text-2xl font-black">{profileData.groupSize || "Не указано"}</div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-black/10 md:col-span-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Доступное время</div>
                    <div className="text-2xl font-black">{profileData.availableTime || "Не указано"}</div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-black/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Поток</div>
                    <div className="text-2xl font-black">{profileData.streamName || "Не указано"}</div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-zinc-800 rounded-2xl border-2 border-black/10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Старт группы</div>
                    <div className="text-2xl font-black">{profileData.groupStart || "Не указано"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
      </main>

      {/* === МОДАЛКА РЕДАКТИРОВАНИЯ === */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white p-8 rounded-2xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
            <button 
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition"
            >
                <X size={20} />
            </button>

            <h2 className="text-2xl font-black uppercase mb-8 tracking-tighter">Редактировать</h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Имя</label>
                <input
                    value={tempData.firstName}
                    onChange={(e) => setTempData({ ...tempData, firstName: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Фамилия</label>
                 <input
                    value={tempData.lastName}
                    onChange={(e) => setTempData({ ...tempData, lastName: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Почта</label>
                 <input
                    type="email"
                    value={tempData.username}
                    onChange={(e) => setTempData({ ...tempData, username: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Номер телефона</label>
                 <input
                    type="tel"
                    value={tempData.phone}
                    onChange={(e) => setTempData({ ...tempData, phone: e.target.value })}
                    placeholder="+7 777 000 00 00"
                    className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                 />
              </div>

              {user.role === 'teacher' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Предметы</label>
                    <input
                      value={tempData.subjects}
                      onChange={(e) => setTempData({ ...tempData, subjects: e.target.value })}
                      placeholder="Математика, Английский, Физика"
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Цена индивидуально</label>
                      <input
                        type="number"
                        value={tempData.individualPrice}
                        onChange={(e) => setTempData({ ...tempData, individualPrice: e.target.value })}
                        placeholder="5000"
                        className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Цена группа</label>
                      <input
                        type="number"
                        value={tempData.groupPrice}
                        onChange={(e) => setTempData({ ...tempData, groupPrice: e.target.value })}
                        placeholder="3000"
                        className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Кол-во людей в группе</label>
                    <input
                      type="number"
                      min="1"
                      value={tempData.groupSize}
                      onChange={(e) => setTempData({ ...tempData, groupSize: e.target.value })}
                      placeholder="6"
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Доступное время</label>
                    <input
                      value={tempData.availableTime}
                      onChange={(e) => setTempData({ ...tempData, availableTime: e.target.value })}
                      placeholder="Пн/Ср 18:00-20:00, Сб 12:00"
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Название потока</label>
                    <input
                      value={tempData.streamName}
                      onChange={(e) => setTempData({ ...tempData, streamName: e.target.value })}
                      placeholder="ЕНТ математика / Май"
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest ml-1 mb-1 block opacity-50">Старт группы</label>
                    <input
                      type="date"
                      value={tempData.groupStart}
                      onChange={(e) => setTempData({ ...tempData, groupStart: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-950 border-2 border-black rounded-xl font-bold outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-4 pt-4">
                <button onClick={() => setIsEditOpen(false)} className="flex-1 py-4 border-2 border-black rounded-xl font-black uppercase text-xs">
                  {cur.cancel || "Отмена"}
                </button>
                <button onClick={handleSave} className="flex-1 py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl font-black uppercase text-xs">
                  {cur.save || "Сохранить"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {user.role === 'student' && (
        <div className="mt-12 bg-white dark:bg-zinc-900 p-8 rounded-[40px] border-[4px] border-black dark:border-white shadow-[8px_8px_0_0_#000]">
          <h2 className="text-2xl font-black uppercase mb-6">Мой прогресс</h2>

          <div className="space-y-4">
            {(() => {
              const progress = JSON.parse(localStorage.getItem('student_progress') || '[]');
              if (progress.length === 0) {
                return <p className="text-slate-500">Пока нет пройденных тестов.</p>;
              }

              return progress.reverse().map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{item.quizTitle}</h3>
                    <span className="text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-green-600">
                      {item.score}/{item.total} ({Math.round((item.score / item.total) * 100)}%)
                    </div>
                    <div className="flex-1 bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(item.score / item.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
