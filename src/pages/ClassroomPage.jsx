import React, { useEffect, useState } from "react";
import { FolderPlus, Megaphone, MessageCircle, Paperclip, Send, UploadCloud, UserCheck, UsersRound } from "lucide-react";
import Header from "../components/Header";

const STORAGE_KEY = "teach_and_study_classroom";
const STUDENTS_KEY = "teach_and_study_teacher_students";
const GROUPS_KEY = "teach_and_study_teacher_groups";

const copy = {
  RU: {
    title: "Класс",
    subtitle: "Учителя публикуют материалы и общаются со студентами в одном пространстве.",
    materialTitle: "Опубликовать материал",
    materialName: "Название материала",
    materialType: "Тип материала",
    materialText: "Описание или ссылка",
    attachFile: "Прикрепить файл",
    recipients: "Выбрать студентов",
    allStudents: "Все студенты",
    groups: "Группы",
    groupName: "Название группы",
    createGroup: "Создать группу",
    chooseGroup: "Выбрать группу",
    publish: "Опубликовать",
    feed: "Материалы",
    chat: "Чат со студентами",
    message: "Написать сообщение",
    send: "Отправить",
    emptyMaterials: "Пока нет опубликованных материалов",
    emptyChat: "Пока нет сообщений",
  },
  KZ: {
    title: "Сынып",
    subtitle: "Мұғалімдер материал жариялап, оқушылармен бір жерде байланыса алады.",
    materialTitle: "Материал жариялау",
    materialName: "Материал атауы",
    materialType: "Материал түрі",
    materialText: "Сипаттама немесе сілтеме",
    attachFile: "Файл тіркеу",
    recipients: "Оқушыларды таңдау",
    allStudents: "Барлық оқушылар",
    groups: "Топтар",
    groupName: "Топ атауы",
    createGroup: "Топ құру",
    chooseGroup: "Топ таңдау",
    publish: "Жариялау",
    feed: "Материалдар",
    chat: "Оқушылармен чат",
    message: "Хабарлама жазу",
    send: "Жіберу",
    emptyMaterials: "Әзірге материал жоқ",
    emptyChat: "Әзірге хабарлама жоқ",
  },
  EN: {
    title: "Classroom",
    subtitle: "Teachers publish materials and talk to students in one shared space.",
    materialTitle: "Publish material",
    materialName: "Material title",
    materialType: "Material type",
    materialText: "Description or link",
    attachFile: "Attach file",
    recipients: "Choose students",
    allStudents: "All students",
    groups: "Groups",
    groupName: "Group name",
    createGroup: "Create group",
    chooseGroup: "Choose group",
    publish: "Publish",
    feed: "Materials",
    chat: "Student chat",
    message: "Write a message",
    send: "Send",
    emptyMaterials: "No materials yet",
    emptyChat: "No messages yet",
  },
};

const defaultStudents = [
  { id: 1, name: "Дарина Зарипхан", subject: "Математика", progress: 82 },
  { id: 2, name: "Алишер Нурлан", subject: "Английский", progress: 68 },
  { id: 3, name: "Амина Сейт", subject: "Физика", progress: 74 },
];

const defaultState = {
  materials: [
    {
      id: 1,
      title: "ЕНТ математика: функции",
      type: "PDF",
      text: "Конспект и 12 задач для самостоятельной практики.",
      author: "Teach and Study",
      createdAt: "Сегодня",
    },
  ],
  messages: [
    {
      id: 1,
      author: "Учитель",
      text: "Материал по функциям уже опубликован. Посмотрите задания до занятия.",
      createdAt: "09:30",
    },
    {
      id: 2,
      author: "Студент",
      text: "Спасибо, я открыл материал.",
      createdAt: "09:34",
    },
  ],
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
}

function loadStudents() {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    return raw ? JSON.parse(raw) : defaultStudents;
  } catch {
    return defaultStudents;
  }
}

function loadGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function ClassroomPage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = copy[lang] || copy.RU;
  const [state, setState] = useState(loadState);
  const [students, setStudents] = useState(loadStudents);
  const [groups, setGroups] = useState(loadGroups);
  const [material, setMaterial] = useState({ title: "", type: "PDF", text: "", fileName: "", studentIds: [], groupId: "" });
  const [message, setMessage] = useState("");
  const [messageStudentIds, setMessageStudentIds] = useState([]);
  const [messageGroupId, setMessageGroupId] = useState("");
  const [groupDraft, setGroupDraft] = useState({ name: "", studentIds: [] });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const syncStudents = () => setStudents(loadStudents());
    const syncGroups = () => setGroups(loadGroups());
    window.addEventListener("storage", syncStudents);
    window.addEventListener("storage", syncGroups);
    return () => {
      window.removeEventListener("storage", syncStudents);
      window.removeEventListener("storage", syncGroups);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }, [groups]);

  const toggleRecipient = (id, target, setter) => {
    setter((prev) => ({
      ...prev,
      [target]: prev[target].includes(id)
        ? prev[target].filter((item) => item !== id)
        : [...prev[target], id],
    }));
  };

  const toggleMessageRecipient = (id) => {
    setMessageStudentIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const toggleGroupStudent = (id) => {
    setGroupDraft((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter((item) => item !== id)
        : [...prev.studentIds, id],
    }));
  };

  const createGroup = (event) => {
    event.preventDefault();
    if (!groupDraft.name.trim() || groupDraft.studentIds.length === 0) return;
    const members = students.filter((student) => groupDraft.studentIds.includes(student.id));
    setGroups((prev) => [
      {
        id: Date.now(),
        name: groupDraft.name.trim(),
        members,
        createdAt: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);
    setGroupDraft({ name: "", studentIds: [] });
  };

  const recipientNames = (ids) => {
    if (!ids?.length) return t.allStudents;
    return students
      .filter((student) => ids.includes(student.id))
      .map((student) => student.name)
      .join(", ");
  };

  const groupName = (id) => groups.find((group) => String(group.id) === String(id))?.name || "";

  const publishMaterial = (event) => {
    event.preventDefault();
    if (!material.title.trim() || !material.text.trim()) return;

    const next = {
      id: Date.now(),
      title: material.title.trim(),
      type: material.type,
      text: material.text.trim(),
      fileName: material.fileName,
      studentIds: material.studentIds,
      groupId: material.groupId,
      author: user?.first_name || "Учитель",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setState((prev) => ({ ...prev, materials: [next, ...prev.materials] }));
    setMaterial({ title: "", type: "PDF", text: "", fileName: "", studentIds: [], groupId: "" });
  };

  const sendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    const next = {
      id: Date.now(),
      author: user?.role === "student" ? "Студент" : "Учитель",
      text: message.trim(),
      studentIds: messageStudentIds,
      groupId: messageGroupId,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setState((prev) => ({ ...prev, messages: [...prev.messages, next] }));
    setMessage("");
    setMessageStudentIds([]);
    setMessageGroupId("");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-white font-sans pt-[120px] pb-20">
      <Header lang={lang} setLang={setLang} user={user} setUser={setUser} {...accessProps} />

      <main className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="mb-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 mb-5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[11px] font-black uppercase tracking-[0.18em] border border-blue-100 dark:border-blue-800">
            <UsersRound size={16} /> Teach and Study
          </div>
          <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter italic mb-4">{t.title}</h1>
          <p className="text-xl text-slate-500 dark:text-slate-300 font-bold max-w-3xl">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8">
          <section className="space-y-8">
            <form onSubmit={createGroup} className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_#a855f7]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center border-[3px] border-black">
                  <FolderPlus size={28} />
                </div>
                <h2 className="text-2xl font-black uppercase">{t.createGroup}</h2>
              </div>
              <div className="space-y-4">
                <input
                  value={groupDraft.name}
                  onChange={(event) => setGroupDraft({ ...groupDraft, name: event.target.value })}
                  placeholder={t.groupName}
                  className="w-full p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
                />
                <div className="p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">{t.recipients}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center gap-3 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={groupDraft.studentIds.includes(student.id)}
                          onChange={() => toggleGroupStudent(student.id)}
                        />
                        <span>{student.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest">
                  {t.createGroup}
                </button>
                {groups.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group) => (
                      <span key={group.id} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-black uppercase">
                        {group.name} / {group.members?.length || 0}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <form onSubmit={publishMaterial} className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center border-[3px] border-black">
                  <UploadCloud size={28} />
                </div>
                <h2 className="text-2xl font-black uppercase">{t.materialTitle}</h2>
              </div>

              <div className="space-y-4">
                <input
                  value={material.title}
                  onChange={(event) => setMaterial({ ...material, title: event.target.value })}
                  placeholder={t.materialName}
                  className="w-full p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
                />
                <select
                  value={material.type}
                  onChange={(event) => setMaterial({ ...material, type: event.target.value })}
                  className="w-full p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-black"
                >
                  <option>PDF</option>
                  <option>Видео</option>
                  <option>Презентация</option>
                  <option>Ссылка</option>
                  <option>Домашнее задание</option>
                </select>
                <textarea
                  value={material.text}
                  onChange={(event) => setMaterial({ ...material, text: event.target.value })}
                  placeholder={t.materialText}
                  className="w-full min-h-[130px] p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold resize-none"
                />
                <label className="flex items-center gap-3 p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-black cursor-pointer">
                  <Paperclip size={20} className="text-blue-600" />
                  <span className="flex-1 truncate">{material.fileName || t.attachFile}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) => setMaterial({ ...material, fileName: event.target.files?.[0]?.name || "" })}
                  />
                </label>
                <div className="p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
                  <select
                    value={material.groupId}
                    onChange={(event) => setMaterial({ ...material, groupId: event.target.value })}
                    className="w-full p-4 mb-4 bg-white dark:bg-zinc-900 rounded-2xl outline-none font-black"
                  >
                    <option value="">{t.chooseGroup}</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <UserCheck size={16} /> {t.recipients}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center gap-3 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={material.studentIds.includes(student.id)}
                          onChange={() => toggleRecipient(student.id, "studentIds", setMaterial)}
                        />
                        <span>{student.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                  <Megaphone size={20} /> {t.publish}
                </button>
              </div>
            </form>

            <div className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_#000]">
              <h2 className="text-2xl font-black uppercase mb-6">{t.feed}</h2>
              <div className="space-y-4">
                {state.materials.length === 0 && <p className="text-slate-500 font-bold">{t.emptyMaterials}</p>}
                {state.materials.map((item) => (
                  <article key={item.id} className="p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <h3 className="font-black text-lg uppercase">{item.title}</h3>
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase">{item.type}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-300 font-semibold mb-4">{item.text}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      <span className="inline-flex items-center gap-2"><Paperclip size={14} /> {item.fileName || "без файла"}</span>
                      {item.groupId && <span className="inline-flex items-center gap-2"><UsersRound size={14} /> {groupName(item.groupId)}</span>}
                      <span className="inline-flex items-center gap-2"><UserCheck size={14} /> {recipientNames(item.studentIds)}</span>
                      <span>{item.author} / {item.createdAt}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_#10b981] flex flex-col min-h-[720px]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center border-[3px] border-black">
                <MessageCircle size={28} />
              </div>
              <h2 className="text-2xl font-black uppercase">{t.chat}</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 mb-6">
              {state.messages.length === 0 && <p className="text-slate-500 font-bold">{t.emptyChat}</p>}
              {state.messages.map((item) => {
                const own = item.author === "Учитель";
                return (
                  <div key={item.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[82%] rounded-[24px] p-5 ${own ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-zinc-800"}`}>
                      <div className={`text-[11px] font-black uppercase tracking-widest mb-2 ${own ? "text-blue-100" : "text-slate-400"}`}>
                        {item.author} / {item.createdAt}
                      </div>
                      <p className="font-bold leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={sendMessage} className="flex gap-3">
              <div className="flex-1 space-y-3">
                <div className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
                  <select
                    value={messageGroupId}
                    onChange={(event) => setMessageGroupId(event.target.value)}
                    className="w-full p-4 mb-3 bg-white dark:bg-zinc-900 rounded-2xl outline-none font-black"
                  >
                    <option value="">{t.chooseGroup}</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">{t.recipients}</div>
                  <div className="flex flex-wrap gap-3">
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center gap-2 font-bold text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={messageStudentIds.includes(student.id)}
                          onChange={() => toggleMessageRecipient(student.id)}
                        />
                        <span>{student.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={t.message}
                  className="w-full p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
                />
              </div>
              <button className="px-6 bg-green-600 text-white rounded-2xl font-black uppercase flex items-center gap-2 self-end h-[64px]">
                <Send size={20} /> <span className="hidden sm:inline">{t.send}</span>
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
