import React, { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, FileText, FolderPlus, Gift, Inbox, MessageCircle, Send, Star, UsersRound } from "lucide-react";
import Header from "../components/Header";

const copy = {
  RU: {
    title: "Кабинет учителя",
    subtitle: "Ученики, заявки, материалы и сообщения в одном месте.",
    students: "Мои ученики",
    requests: "Заявки",
    materials: "Мои материалы",
    message: "Сообщение ученикам",
    send: "Отправить",
    chooseStudents: "Выбрать учеников",
    chooseGroup: "Выбрать группу",
    allStudents: "Все ученики",
    publish: "Опубликовать материал",
    materialPlaceholder: "Название материала или ссылка",
    accept: "Принять",
    decline: "Отклонить",
    groups: "Группы",
    groupName: "Название группы",
    createGroup: "Создать группу",
    studentsCount: "учеников",
    requestsCount: "заявок",
    groupsCount: "групп",
    homework: "ДЗ и звёзды",
    markDone: "ДЗ выполнено",
    bonusLesson: "доп. урок",
    calendar: "Календарь",
    lessonTopic: "Тема занятия",
    lessonDate: "Дата",
    lessonTime: "Время",
    addLesson: "Добавить занятие",
  },
  KZ: {
    title: "Мұғалім кабинеті",
    subtitle: "Оқушылар, өтінімдер, материалдар және хабарламалар бір жерде.",
    students: "Менің оқушыларым",
    requests: "Өтінімдер",
    materials: "Менің материалдарым",
    message: "Оқушыларға хабарлама",
    send: "Жіберу",
    chooseStudents: "Оқушыларды таңдау",
    chooseGroup: "Топ таңдау",
    allStudents: "Барлық оқушылар",
    publish: "Материал жариялау",
    materialPlaceholder: "Материал атауы немесе сілтеме",
    accept: "Қабылдау",
    decline: "Бас тарту",
    groups: "Топтар",
    groupName: "Топ атауы",
    createGroup: "Топ құру",
    studentsCount: "оқушы",
    requestsCount: "өтінім",
    groupsCount: "топ",
    homework: "Үй жұмысы және жұлдыздар",
    markDone: "Үй жұмысы орындалды",
    bonusLesson: "қосымша сабақ",
    calendar: "Күнтізбе",
    lessonTopic: "Сабақ тақырыбы",
    lessonDate: "Күн",
    lessonTime: "Уақыт",
    addLesson: "Сабақ қосу",
  },
  EN: {
    title: "Teacher Workspace",
    subtitle: "Students, requests, materials, and messages in one place.",
    students: "My Students",
    requests: "Requests",
    materials: "My Materials",
    message: "Message students",
    send: "Send",
    chooseStudents: "Choose students",
    chooseGroup: "Choose group",
    allStudents: "All students",
    publish: "Publish material",
    materialPlaceholder: "Material title or link",
    accept: "Accept",
    decline: "Decline",
    groups: "Groups",
    groupName: "Group name",
    createGroup: "Create group",
    studentsCount: "students",
    requestsCount: "requests",
    groupsCount: "groups",
    homework: "Homework & Stars",
    markDone: "Homework done",
    bonusLesson: "bonus lesson",
    calendar: "Calendar",
    lessonTopic: "Lesson topic",
    lessonDate: "Date",
    lessonTime: "Time",
    addLesson: "Add lesson",
  },
};

const STUDENTS_KEY = "teach_and_study_teacher_students";
const REQUESTS_KEY = "teach_and_study_teacher_requests";
const MATERIALS_KEY = "teach_and_study_teacher_materials";
const GROUPS_KEY = "teach_and_study_teacher_groups";
const LESSONS_KEY = "teach_and_study_teacher_lessons";
const CLASSROOM_KEY = "teach_and_study_classroom";

const initialStudents = [
  { id: 1, name: "Дарина Зарипхан", subject: "Математика", progress: 82, stars: 8, bonusLessons: 1 },
  { id: 2, name: "Алишер Нурлан", subject: "Английский", progress: 68, stars: 4, bonusLessons: 0 },
  { id: 3, name: "Амина Сейт", subject: "Физика", progress: 74, stars: 6, bonusLessons: 0 },
];

const initialRequests = [
  { id: 1, name: "Сабина Ермек", subject: "ЕНТ математика", time: "Сегодня" },
  { id: 2, name: "Ильяс Ким", subject: "IELTS Speaking", time: "Вчера" },
];

const initialMaterials = [
  { id: 1, title: "Функции: конспект и задачи", type: "PDF", date: "Сегодня" },
  { id: 2, title: "IELTS speaking warm-up", type: "Видео", date: "Вчера" },
];

const initialLessons = [
  { id: 1, title: "ЕНТ математика: функции", date: "2026-05-06", time: "16:00", group: "Индивидуально" },
  { id: 2, title: "IELTS speaking practice", date: "2026-05-07", time: "18:30", group: "Группа IELTS" },
];

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function TeacherWorkspacePage({ lang, setLang, user, setUser, ...accessProps }) {
  const t = copy[lang] || copy.RU;
  const [students, setStudents] = useState(() => readStored(STUDENTS_KEY, initialStudents));
  const [requests, setRequests] = useState(() => readStored(REQUESTS_KEY, initialRequests));
  const [materials, setMaterials] = useState(() => readStored(MATERIALS_KEY, initialMaterials));
  const [groups, setGroups] = useState(() => readStored(GROUPS_KEY, []));
  const [lessons, setLessons] = useState(() => readStored(LESSONS_KEY, initialLessons));
  const [message, setMessage] = useState("");
  const [messageStudentIds, setMessageStudentIds] = useState([]);
  const [messageGroupId, setMessageGroupId] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [lessonDraft, setLessonDraft] = useState({ title: "", date: "", time: "" });

  useEffect(() => {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  }, [lessons]);

  const acceptRequest = (request) => {
    setStudents((prev) => [
      { id: Date.now(), name: request.studentName || request.name, subject: request.subject, progress: 0, stars: 0, bonusLessons: 0 },
      ...prev,
    ]);
    setRequests((prev) => prev.filter((item) => item.id !== request.id));
  };

  const markHomeworkDone = (studentId) => {
    setStudents((prev) => prev.map((student) => {
      if (student.id !== studentId) return student;
      const nextStars = (student.stars || 0) + 1;
      const earnedBonus = nextStars > 0 && nextStars % 5 === 0 ? 1 : 0;
      return {
        ...student,
        stars: nextStars,
        bonusLessons: (student.bonusLessons || 0) + earnedBonus,
      };
    }));
  };

  const addLesson = (event) => {
    event.preventDefault();
    if (!lessonDraft.title.trim() || !lessonDraft.date || !lessonDraft.time) return;
    setLessons((prev) => [
      {
        id: Date.now(),
        title: lessonDraft.title.trim(),
        date: lessonDraft.date,
        time: lessonDraft.time,
        group: groups[0]?.name || "Индивидуально",
      },
      ...prev,
    ]);
    setLessonDraft({ title: "", date: "", time: "" });
  };

  const toggleStudent = (id) => {
    setSelectedStudentIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const createGroup = (event) => {
    event.preventDefault();
    if (!groupName.trim() || selectedStudentIds.length === 0) return;

    const members = students.filter((student) => selectedStudentIds.includes(student.id));
    setGroups((prev) => [
      {
        id: Date.now(),
        name: groupName.trim(),
        members,
        createdAt: new Date().toLocaleDateString(),
      },
      ...prev,
    ]);
    setGroupName("");
    setSelectedStudentIds([]);
  };

  const toggleMessageStudent = (id) => {
    setMessageStudentIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const sendClassMessage = () => {
    if (!message.trim()) return;
    const fallback = { materials: [], messages: [] };
    const classroom = readStored(CLASSROOM_KEY, fallback);
    const nextMessage = {
      id: Date.now(),
      author: "Учитель",
      text: message.trim(),
      studentIds: messageStudentIds,
      groupId: messageGroupId,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    localStorage.setItem(CLASSROOM_KEY, JSON.stringify({
      ...classroom,
      messages: [...(classroom.messages || []), nextMessage],
    }));
    setMessage("");
    setMessageStudentIds([]);
    setMessageGroupId("");
  };

  const publishMaterial = (event) => {
    event.preventDefault();
    if (!materialTitle.trim()) return;
    setMaterials((prev) => [
      { id: Date.now(), title: materialTitle.trim(), type: "Материал", date: "Сейчас" },
      ...prev,
    ]);
    setMaterialTitle("");
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

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-[28px] p-6 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]">
            <div className="text-4xl font-black text-blue-600">{students.length}</div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t.studentsCount}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-[28px] p-6 shadow-[6px_6px_0px_0px_#10b981]">
            <div className="text-4xl font-black text-green-600">{requests.length}</div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t.requestsCount}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border-[3px] border-black dark:border-white rounded-[28px] p-6 shadow-[6px_6px_0px_0px_#f59e0b]">
            <div className="text-4xl font-black text-yellow-600">{groups.length}</div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t.groupsCount}</div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
          <section className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <UsersRound className="text-blue-600" /> {t.students}
            </h2>
            <div className="space-y-4">
              {students.map((student) => (
                <article key={student.id} className="p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-black text-lg uppercase">{student.name}</h3>
                      <p className="text-sm font-bold text-slate-500">{student.subject}</p>
                    </div>
                    <div className="text-2xl font-black text-blue-600">{student.progress}%</div>
                  </div>
                  <div className="h-3 bg-white dark:bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${student.progress}%` }} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-full text-xs font-black uppercase">
                      <Star size={14} fill="currentColor" /> {student.stars || 0}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase">
                      <Gift size={14} /> {student.bonusLessons || 0} {t.bonusLesson}
                    </span>
                    <button onClick={() => markHomeworkDone(student.id)} className="ml-auto px-4 py-2 bg-yellow-500 text-black rounded-xl font-black uppercase text-xs">
                      {t.markDone}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_#ef4444]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <CalendarDays className="text-red-600" /> {t.calendar}
            </h2>
            <form onSubmit={addLesson} className="grid grid-cols-1 md:grid-cols-[1fr_150px_120px] gap-3 mb-6">
              <input
                value={lessonDraft.title}
                onChange={(event) => setLessonDraft({ ...lessonDraft, title: event.target.value })}
                placeholder={t.lessonTopic}
                className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
              />
              <input
                type="date"
                value={lessonDraft.date}
                onChange={(event) => setLessonDraft({ ...lessonDraft, date: event.target.value })}
                className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
              />
              <input
                type="time"
                value={lessonDraft.time}
                onChange={(event) => setLessonDraft({ ...lessonDraft, time: event.target.value })}
                className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
              />
              <button className="md:col-span-3 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest">
                {t.addLesson}
              </button>
            </form>
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <article key={lesson.id} className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black uppercase">{lesson.title}</h3>
                    <p className="text-xs font-bold text-slate-500">{lesson.date} / {lesson.time} / {lesson.group}</p>
                  </div>
                  <CalendarDays className="text-red-600 shrink-0" />
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_#10b981]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <Inbox className="text-green-600" /> {t.requests}
            </h2>
            <div className="space-y-4">
              {requests.map((request) => (
                <article key={request.id} className="p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
                  <h3 className="font-black text-lg uppercase">{request.name}</h3>
                  <p className="text-sm font-bold text-slate-500 mb-4">{request.subject} / {request.time}</p>
                  <div className="flex gap-3">
                    <button onClick={() => acceptRequest(request)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black uppercase text-xs">
                      {t.accept}
                    </button>
                    <button onClick={() => setRequests((prev) => prev.filter((item) => item.id !== request.id))} className="flex-1 py-3 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl font-black uppercase text-xs">
                      {t.decline}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_#a855f7]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <FolderPlus className="text-purple-600" /> {t.groups}
            </h2>
            <form onSubmit={createGroup} className="space-y-4 mb-6">
              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder={t.groupName}
                className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-zinc-800 rounded-2xl font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                    />
                    <span>{student.name}</span>
                  </label>
                ))}
              </div>
              <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest">
                {t.createGroup}
              </button>
            </form>
            <div className="space-y-3">
              {groups.map((group) => (
                <article key={group.id} className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl">
                  <h3 className="font-black uppercase">{group.name}</h3>
                  <p className="text-sm font-bold text-slate-500">{group.members.length} {t.studentsCount} / {group.createdAt}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_#f59e0b]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <FileText className="text-yellow-600" /> {t.materials}
            </h2>
            <form onSubmit={publishMaterial} className="flex gap-3 mb-6">
              <input
                value={materialTitle}
                onChange={(event) => setMaterialTitle(event.target.value)}
                placeholder={t.materialPlaceholder}
                className="flex-1 p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold"
              />
              <button className="px-5 bg-yellow-500 text-black rounded-2xl font-black uppercase">
                {t.publish}
              </button>
            </form>
            <div className="space-y-3">
              {materials.map((material) => (
                <article key={material.id} className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black uppercase">{material.title}</h3>
                    <p className="text-xs font-bold text-slate-500">{material.type} / {material.date}</p>
                  </div>
                  <CheckCircle2 className="text-green-600 shrink-0" />
                </article>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-900 border-[4px] border-black dark:border-white rounded-[32px] p-7 shadow-[8px_8px_0px_0px_#000]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <MessageCircle className="text-blue-600" /> {t.message}
            </h2>
            <select
              value={messageGroupId}
              onChange={(event) => setMessageGroupId(event.target.value)}
              className="w-full p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-black mb-4"
            >
              <option value="">{t.chooseGroup}</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
            <div className="p-4 bg-slate-100 dark:bg-zinc-800 rounded-2xl mb-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">{t.chooseStudents}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-3 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={messageStudentIds.includes(student.id)}
                      onChange={() => toggleMessageStudent(student.id)}
                    />
                    <span>{student.name}</span>
                  </label>
                ))}
              </div>
              {messageStudentIds.length === 0 && !messageGroupId && (
                <div className="mt-3 text-xs font-black uppercase tracking-widest text-slate-400">{t.allStudents}</div>
              )}
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={t.message}
              className="w-full min-h-[160px] p-5 bg-slate-100 dark:bg-zinc-800 rounded-2xl outline-none font-bold resize-none mb-4"
            />
            <button onClick={sendClassMessage} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
              <Send size={20} /> {t.send}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
