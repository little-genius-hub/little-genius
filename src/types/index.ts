export interface User {
  id: string
  name: string
  username?: string
  email: string
  avatar?: string
  parentPin?: string
  children: Child[]
  createdAt?: Date
  updatedAt?: Date
}

export interface Child {
  id: string
  name: string
  age: number
  avatar?: string
  preferredLanguage: "en" | "id"
  progress: GameProgress
  achievements: Achievement[]
  createdAt: Date
}

export interface GameProgress {
  numbers: {
    level: number
    subLevel: number
    totalScore: number
    completedLevels: CompletedLevel[]
  }
  letters: {
    level: number
    subLevel: number
    totalScore: number
    completedLevels: CompletedLevel[]
  }
  stories: {
    readStories: string[]
    favoriteStories: string[]
  }
}

export interface CompletedLevel {
  level: number
  subLevel: number
  score: number
  timeSpent: number
  completedAt: Date
  mistakes: number
}

export interface Achievement {
  id: string
  type: "numbers" | "letters" | "stories" | "streak"
  title: string
  description: string
  icon: string
  unlockedAt: Date
}

export interface MathProblem {
  id: string
  operation: "addition" | "subtraction" | "multiplication" | "division"
  operand1: number
  operand2: number
  answer: number
  level: number
  subLevel: number
}

export interface WordProblem {
  id: string
  word: string
  scrambledWord: string
  pronunciation: string
  meaning: string
  level: number
  subLevel: number
  language: "en" | "id"
}

export interface Story {
  id: string
  title: string
  content: string
  illustration?: string
  audioUrl?: string
  language: "en" | "id"
  ageGroup: number[]
  category: string
  readingTime: number
}

export type Language = "en" | "id"
export type GameType = "numbers" | "letters"
