import { DEFAULT_PROMPT_CONFIG } from "./defaults";
import { I18N as t, langWord } from "../i18n";

function escapeJsonString(s) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");
}

export function buildPrompt(type, vars, cfg) {
  // 1. Lesson Plan Generation
  if (type === "lesson_plan") {
    const c = cfg?.lesson_plan || DEFAULT_PROMPT_CONFIG.lesson_plan;

    const gradeInt = Number.isFinite(Number(vars.grade)) ? Number(vars.grade) : 0;
    const durationInt = Number.isFinite(Number(vars.duration)) ? Number(vars.duration) : 0;

    return [
      `You are a professional lesson planner (methodologist).`,
      `Generate a lesson plan strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      ``,
      `INPUT (use these values exactly in meta):`,
      `- subject: ${vars.subject}`,
      `- topic: ${vars.topic}`,
      `- grade: ${gradeInt}`,
      `- duration: ${durationInt}`,
      vars.details ? `- details: ${vars.details}` : `- details:`,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON. No markdown, no code fences, no comments, no extra text.`,
      `2) JSON must start with "{" and end with "}".`,
      `3) meta.subject MUST equal the input subject.`,
      `4) meta.topic MUST equal the input topic.`,
      `5) meta.grade MUST equal the input grade (integer).`,
      `6) meta.duration MUST equal the input duration (integer).`,
      `7) timeline MUST contain 6-10 items.`,
      `8) Each timeline item MUST include: stage, minutes, teacher, student, assessment, resources.`,
      `9) teacher/student/assessment/resources MUST be arrays of strings (bullet points).`,
      `10) Do NOT use null. Use "" or [] instead.`,
      ``,
      `OUTPUT JSON SCHEMA (follow keys exactly):`,
      `{`,
      `  "schema": "lessonlab.kmj.v1",`,
      `  "lang": "${vars.lang}",`,
      `  "meta": {`,
      `    "subject": "${escapeJsonString(vars.subject)}",`,
      `    "topic": "${escapeJsonString(vars.topic)}",`,
      `    "grade": ${gradeInt},`,
      `    "duration": ${durationInt},`,
      `    "details": "${escapeJsonString(vars.details || "")}",`,
      `    "lesson_number": "",`,
      `    "unit": "",`,
      `    "date": "",`,
      `    "teacher_name": "",`,
      `    "present_count": "",`,
      `    "absent_count": ""`,
      `  },`,
      `  "sections": {`,
      `    "learning_objectives": [],`,
      `    "lesson_goal": [],`,
      `    "values": [],`,
      `    "goals": [],`,
      `    "equipment": [],`,
      `    "key_concepts": [],`,
      `    "tasks": [],`,
      `    "differentiation": [],`,
      `    "assessment": [],`,
      `    "homework": []`,
      `  },`,
      `  "timeline": [`,
      `    {`,
      `      "stage": "",`,
      `      "minutes": "0-0",`,
      `      "teacher": [],`,
      `      "student": [],`,
      `      "assessment": [],`,
      `      "resources": []`,
      `    }`,
      `  ]`,
      `}`,
      ``,
      `IMPORTANT: Replace all empty strings/arrays with real content. Keep the same structure.`,
    ].filter(Boolean).join("\n");
  }

  // 2. Quiz Generation (Strict Format & Unique Answers)
  if (type === "tests") {
    const c = cfg?.tests || DEFAULT_PROMPT_CONFIG.tests;
    const totalQ = c.total || 10;

    return [
      `Role: Professional Quiz Generator.`,
      `Task: Create a multiple-choice quiz strictly in language: ${langWord(vars.lang)}.`,
      ``,
      `Input Data:`,
      `- Subject: ${vars.subject}`,
      `- Topic: ${vars.topic}`,
      `- Grade: ${vars.grade}`,
      `- Question Count: ${totalQ}`,
      `- Difficulty: ${c.difficulty}`,
      vars.details ? `- Context: ${vars.details}` : null,
      ``,
      `CRITICAL OUTPUT RULES (STRICT MARKDOWN):`,
      `1. No introduction or conclusion. Start directly with questions.`,
      `2. Mark the correct answer IMMEDIATELY within the options using [x].`,
      `3. Use this EXACT format:`,
      ``,
      `## Question Text Here?`,
      `- [ ] Wrong Option`,
      `- [x] Correct Option`,
      `- [ ] Wrong Option`,
      ``,
      `4. Total questions must be exactly: ${totalQ}.`,
      `5. CRITICAL: All options within a single question must be UNIQUE. No duplicates allowed.`,
      `6. For math questions, ensure there is only one correct answer.`,
    ].filter(Boolean).join("\n");
  }

  // 3. University Course Generation
  if (type === "university_course") {
    const c = cfg?.university_course || DEFAULT_PROMPT_CONFIG.university_course;

    return [
      `You are a professional university course designer and academic planner.`,
      `Generate a complete university course structure strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      ``,
      `INPUT (use these values exactly in meta):`,
      `- subject: ${vars.subject}`,
      `- level: ${c.level}`,
      `- year: ${c.year}`,
      vars.details ? `- details: ${vars.details}` : `- details:`,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON. No markdown, no code fences, no comments, no extra text.`,
      `2) JSON must start with "{" and end with "}".`,
      `3) Include syllabus, lectures, assignments, and assessments based on config.`,
      `4) Do NOT use null. Use "" or [] instead.`,
      ``,
      `OUTPUT JSON SCHEMA:`,
      `{`,
      `  "schema": "lessonlab.university.v1",`,
      `  "lang": "${vars.lang}",`,
      `  "meta": {`,
      `    "subject": "${escapeJsonString(vars.subject)}",`,
      `    "level": "${c.level}",`,
      `    "year": ${c.year},`,
      `    "details": "${escapeJsonString(vars.details || "")}"`,
      `  },`,
      `  "syllabus": {`,
      `    "objectives": [],`,
      `    "topics": [],`,
      `    "schedule": [],`,
      `    "resources": [],`,
      `    "assessment": []`,
      `  },`,
      `  "lectures": [],`,
      `  "assignments": [],`,
      `  "assessments": []`,
      `}`,
    ].filter(Boolean).join("\n");
  }

  // 4. Syllabus Generation
  if (type === "syllabus") {
    const c = cfg?.syllabus || DEFAULT_PROMPT_CONFIG.syllabus;

    return [
      `You are a professional syllabus writer for educational institutions.`,
      `Generate a detailed course syllabus strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      ``,
      `INPUT:`,
      `- course: ${vars.subject}`,
      `- level: ${vars.level || "undergraduate"}`,
      vars.details ? `- details: ${vars.details}` : ``,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON.`,
      `2) Include all requested sections based on config.`,
      ``,
      `OUTPUT JSON SCHEMA:`,
      `{`,
      `  "schema": "lessonlab.syllabus.v1",`,
      `  "lang": "${vars.lang}",`,
      `  "course": "${escapeJsonString(vars.subject)}",`,
      `  "objectives": [],`,
      `  "topics": [],`,
      `  "schedule": [],`,
      `  "resources": [],`,
      `  "assessment": []`,
      `}`,
    ].filter(Boolean).join("\n");
  }

  // 5. Exam Preparation
  if (type === "exam_prep") {
    const c = cfg?.exam_prep || DEFAULT_PROMPT_CONFIG.exam_prep;

    return [
      `You are a professional exam preparation specialist.`,
      `Generate practice questions for ${c.examType} exam strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      ``,
      `INPUT:`,
      `- exam: ${c.examType}`,
      `- subject: ${c.subject}`,
      `- total questions: ${c.totalQuestions}`,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON.`,
      `2) Generate ${c.totalQuestions} questions.`,
      `3) Include answers and explanations if requested.`,
      ``,
      `OUTPUT JSON SCHEMA:`,
      `{`,
      `  "schema": "lessonlab.exam.v1",`,
      `  "exam": "${c.examType}",`,
      `  "subject": "${c.subject}",`,
      `  "questions": [`,
      `    {`,
      `      "question": "",`,
      `      "options": [],`,
      `      "correct": "",`,
      `      "explanation": ""`,
      `    }`,
      `  ]`,
      `}`,
    ].filter(Boolean).join("\n");
  }

  // 6. Professional Course
  if (type === "professional_course") {
    const c = cfg?.professional_course || DEFAULT_PROMPT_CONFIG.professional_course;

    return [
      `You are a professional training program designer.`,
      `Generate a professional course structure strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      ``,
      `INPUT:`,
      `- field: ${c.field}`,
      `- level: ${c.level}`,
      `- duration: ${c.duration}`,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON.`,
      `2) Include modules, projects, and certification details.`,
      ``,
      `OUTPUT JSON SCHEMA:`,
      `{`,
      `  "schema": "lessonlab.professional.v1",`,
      `  "field": "${c.field}",`,
      `  "level": "${c.level}",`,
      `  "duration": "${c.duration}",`,
      `  "modules": [],`,
      `  "projects": [],`,
      `  "certification": {}`,
      `}`,
    ].filter(Boolean).join("\n");
  }

  // 7. Game Content Generation
  if (type === "game_connections") {
    const c = cfg?.[type] || DEFAULT_PROMPT_CONFIG[type];

    return [
      `You are a professional educational game designer.`,
      `Generate a "Connections" style word grouping game strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      ``,
      `INPUT:`,
      `- subject: ${vars.subject}`,
      `- topic: ${vars.topic}`,
      `- grade: ${vars.grade}`,
      `- difficulty: ${c.difficulty}`,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON. No markdown, no code fences, no extra text.`,
      `2) Start output with "{" and end with "}".`,
      `3) Output must include a "groups" array with 4 groups.`,
      `4) Each group must include:`,
      `   - name: { EN: "...", KZ: "...", RU: "..." }`,
      `   - words: array of 4 related words/phrases`,
      `   - color: a tailwind-style color string (e.g., "bg-blue-100 border-blue-300")`,
      `5) Words should match the chosen topic/subject/grade. Avoid irrelevant terms.`,
      `6) Do NOT use null. Use [] or "" instead.`,
      ``,
      `OUTPUT JSON SCHEMA:`,
      `{`,
      `  "schema": "lessonlab.game.connections.v1",`,
      `  "lang": "${vars.lang}",`,
      `  "meta": {`,
      `    "subject": "${vars.subject}",`,
      `    "topic": "${vars.topic}",`,
      `    "grade": "${vars.grade}"`,
      `  },`,
      `  "groups": [`,
      `    {`,
      `      "name": { "EN": "", "KZ": "", "RU": "" },`,
      `      "words": ["", "", "", ""],`,
      `      "color": ""`,
      `    }`,
      `  ]`,
      `}`,
    ].filter(Boolean).join("\n");
  }

  if (type === "game_codenames") {
    const c = cfg?.[type] || DEFAULT_PROMPT_CONFIG[type];

    return [
      `You are a professional educational game designer.`,
      `Generate a Codenames-style board strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      ``,
      `INPUT:`,
      `- subject: ${vars.subject}`,
      `- topic: ${vars.topic}`,
      `- grade: ${vars.grade}`,
      `- difficulty: ${c.difficulty}`,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON. No markdown, no code fences, no extra text.`,
      `2) Start output with "{" and end with "}".`,
      `3) Output must include a "board" array with exactly 25 items.`,
      `4) Each board item must include:`,
      `   - word: string`,
      `   - team: one of ["red", "blue", "neutral", "assassin"]`,
      `5) Include "startingTeam" as either "red" or "blue".`,
      `6) Do NOT use null. Use "" instead.`,
      ``,
      `OUTPUT JSON SCHEMA:`,
      `{`,
      `  "schema": "lessonlab.game.codenames.v1",`,
      `  "lang": "${vars.lang}",`,
      `  "meta": {`,
      `    "subject": "${vars.subject}",`,
      `    "topic": "${vars.topic}",`,
      `    "grade": "${vars.grade}"`,
      `  },`,
      `  "startingTeam": "red",`,
      `  "board": [`,
      `    { "word": "", "team": "neutral" }`,
      `  ]`,
      `}`,
    ].filter(Boolean).join("\n");
  }

  if (type.startsWith("game_")) {
    const gameType = type.replace("game_", "");
    const c = cfg?.[type] || DEFAULT_PROMPT_CONFIG[type];

    return [
      `You are a professional educational game designer.`,
      `Generate content for ${gameType} game strictly as VALID JSON.`,
      ``,
      `Language of ALL text inside JSON: ${langWord(vars.lang)}.`,
      ``,
      `INPUT:`,
      `- game: ${gameType}`,
      `- theme: ${c.theme}`,
      `- difficulty: ${c.difficulty}`,
      ``,
      `STRICT RULES:`,
      `1) Output ONLY JSON.`,
      `2) Generate appropriate game content based on type.`,
      ``,
      `OUTPUT JSON SCHEMA:`,
      `{`,
      `  "schema": "lessonlab.game.v1",`,
      `  "game": "${gameType}",`,
      `  "theme": "${c.theme}",`,
      `  "difficulty": "${c.difficulty}",`,
      `  "content": {}`,
      `}`,
    ].filter(Boolean).join("\n");
  }

  return "";
}