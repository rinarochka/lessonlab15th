// Prompt builders for different exam formats.
// Each function returns a strict prompt for the AI to generate JSON in the expected schema.

export function generateIELTS(section, difficulty = "medium", count = 5, lang = "EN") {
  const sectionLabel = section || "Reading";
  const difficultyLabel = difficulty || "medium";
  const total = Number.isFinite(Number(count)) ? Number(count) : 5;

  // Base instructions to ensure consistent JSON output
  const base = [
    `You are an expert IELTS test creator.`,
    `Generate a JSON object only, with no markdown, no code fences, no extra text.`,
    `Output must be valid JSON and nothing else.`,
    `Language: ${lang === "RU" ? "Russian" : lang === "KZ" ? "Kazakh" : "English"}.`,
    `Difficulty: ${difficultyLabel}.`,
    `Section: ${sectionLabel}.`,
  ];

  switch (sectionLabel.toLowerCase()) {
    case "reading":
      return [
        ...base,
        `Output schema:`,
        `{
  "passage": "...",
  "questions": [
    {"question":"...","options":["A","B","C","D"],"answer":"A"}
  ]
}`,
        `Generate a realistic passage of approximately 250-400 words on an educational topic, followed by ${total} multiple-choice questions.`,
        `Each question must have 4 options (A-D) and a single correct answer value (A, B, C, or D).`,
      ].join("\n");

    case "writing":
      return [
        ...base,
        `Output schema:`,
        `{
  "task": "Essay topic",
  "instructions": "Describe..."
}`,
        `Generate a single IELTS Writing task. Provide a clear essay prompt and instructions for what the student must do.`,
      ].join("\n");

    case "listening":
      return [
        ...base,
        `Output schema:`,
        `{
  "dialog": "...",
  "questions": [
    {"question":"...","options":["A","B","C","D"],"answer":"A"}
  ]
}`,
        `Generate a short listening dialogue (2-3 speakers) and ${total} multiple-choice questions based on it.`,
        `The dialogue should be formatted as plain text (speaker names optional).`,
      ].join("\n");

    case "speaking":
      return [
        ...base,
        `Output schema:`,
        `{
  "questions": ["...", "..."]
}`,
        `Generate a list of ${total} speaking interview questions typical for IELTS Speaking (Part 1 and Part 2 style).`,
      ].join("\n");

    default:
      return [
        ...base,
        `Unknown section. Default to reading format.`,
        `{
  "passage": "...",
  "questions": [
    {"question":"...","options":["A","B","C","D"],"answer":"A"}
  ]
}`,
      ].join("\n");
  }
}

export function generateSAT(section, difficulty = "medium", count = 10, lang = "EN") {
  const sectionLabel = section || "Math";
  const difficultyLabel = difficulty || "medium";
  const total = Number.isFinite(Number(count)) ? Number(count) : 10;

  const base = [
    `You are an expert SAT test creator.`,
    `Generate a JSON object only, with no markdown, no code fences, no extra text.`,
    `Output must be valid JSON and nothing else.`,
    `Language: ${lang === "RU" ? "Russian" : lang === "KZ" ? "Kazakh" : "English"}.`,
    `Difficulty: ${difficultyLabel}.`,
    `Section: ${sectionLabel}.`,
  ];

  switch (sectionLabel.toLowerCase()) {
    case "math":
      return [
        ...base,
        `Output schema:`,
        `{
  "questions": [
    {"question":"...","options":["A","B","C","D"],"answer":"A"}
  ]
}`,
        `Generate ${total} SAT Math multiple-choice questions with 4 options each (A-D).`,
        `Ensure each question includes clear math notation in plain text and has exactly one correct option.`,
      ].join("\n");

    case "reading":
      return [
        ...base,
        `Output schema:`,
        `{
  "passage": "...",
  "questions": [
    {"question":"...","options":["A","B","C","D"],"answer":"A"}
  ]
}`,
        `Generate a passage (200-300 words) and ${total} multiple-choice reading questions about it.`,
      ].join("\n");

    case "writing and language":
    case "writing":
      return [
        ...base,
        `Output schema:`,
        `{
  "passage": "...",
  "questions": [
    {"question":"...","options":["A","B","C","D"],"answer":"A"}
  ]
}`,
        `Generate a short passage (150-250 words) with errors, followed by ${total} multiple-choice grammar/usage questions.`,
      ].join("\n");

    default:
      return [
        ...base,
        `Unknown section. Returning SAT Math format.`,
        `{
  "questions": [
    {"question":"...","options":["A","B","C","D"],"answer":"A"}
  ]
}`,
      ].join("\n");
  }
}

export function buildENTPrompt(subject, difficulty = "medium", count = 20, lang = "RU") {
  const subjectLabel = subject || "Математическая грамотность";
  const difficultyLabel = difficulty || "medium";
  const total = Number.isFinite(Number(count)) ? Number(count) : 20;

  return `Create a practice test for the Kazakhstan Unified National Testing (ENT).

Subject: ${subjectLabel}
Difficulty: ${difficultyLabel}
Number of questions: ${total}

Questions must follow ENT format.
Return ONLY JSON.

Format:
{
  "questions":[
    {
      "question":"string",
      "options":["A","B","C","D","E"],
      "answer":"A"
    }
  ]
}`;
}

export function generateENT(subject, difficulty = "medium", count = 20, lang = "RU") {
  return buildENTPrompt(subject, difficulty, count, lang);
}

