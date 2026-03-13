export const DEFAULT_PROMPT_CONFIG = {
  lesson_plan: {
    style: "strict",          // strict | friendly | short
    includeTiming: true,
    includeDifferentiation: true,
    includeAssessment: true,
    includeHomework: true,
    detailLevel: "high",      // low | medium | high
    markdown: true,
    sections: [
      "goals",
      "equipment",
      "key_concepts",
      "timeline",
      "tasks",
      "differentiation",
      "assessment",
      "homework",
    ],
  },

  tests: {
    difficulty: "medium",     // easy | medium | hard
    total: 10,
    mcq: { count: 6, options: 4 },
    short: { count: 2 },
    matching: { count: 2 },
    includeAnswers: true,
    markdown: true,
    shuffle: false,
  },

  // New: Higher Education Content
  university_course: {
    level: "undergraduate",   // undergraduate | graduate
    year: 1,                  // 1-4 for undergrad, 1-2 for grad
    includeSyllabus: true,
    includeLectures: true,
    includeAssignments: true,
    includeAssessments: true,
    detailLevel: "high",
    markdown: true,
  },

  syllabus: {
    includeObjectives: true,
    includeTopics: true,
    includeSchedule: true,
    includeResources: true,
    includeAssessment: true,
    detailLevel: "high",
    markdown: true,
  },

  // New: Exam Preparation
  exam_prep: {
    examType: "UNT",          // UNT | IELTS | SAT
    subject: "general",       // general | math | reading | etc.
    difficulty: "medium",
    totalQuestions: 20,
    includeAnswers: true,
    includeExplanations: true,
    markdown: true,
  },

  // New: Professional Courses
  professional_course: {
    field: "technology",      // technology | business | healthcare | etc.
    level: "beginner",        // beginner | intermediate | advanced
    duration: "3 months",
    includeModules: true,
    includeProjects: true,
    includeCertification: true,
    detailLevel: "high",
    markdown: true,
  },

  // New: Interactive Games
  game_connections: {
    theme: "education",
    difficulty: "medium",
    gridSize: "4x4",
    includeHints: true,
  },

  game_codenames: {
    theme: "vocabulary",
    difficulty: "medium",
    boardSize: "5x5",
    includeHints: true,
  },

  game_four_pictures: {
    theme: "vocabulary",
    difficulty: "medium",
    includeHints: true,
  },

  game_odd_one_out: {
    theme: "logic",
    difficulty: "medium",
    setSize: 4,
    includeHints: true,
  },

  game_crosswords: {
    theme: "vocabulary",
    difficulty: "medium",
    gridSize: "10x10",
    includeHints: true,
  },
};
