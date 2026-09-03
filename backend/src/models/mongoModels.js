import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// User Model
const userSchema = new Schema(
  {
    id: { type: String, default: uuidv4, primary: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    apiKey: { type: String, unique: true, sparse: true },
    profile: {
      firstName: String,
      lastName: String,
      avatar: String,
      bio: String,
    },
    preferences: {
      theme: { type: String, default: 'dark', enum: ['light', 'dark'] },
      language: { type: String, default: 'en' },
      notificationsEnabled: { type: Boolean, default: true },
    },
    subscription: {
      tier: { type: String, default: 'free', enum: ['free', 'pro', 'enterprise'] },
      apiCallsUsed: { type: Number, default: 0 },
      apiCallsLimit: { type: Number, default: 1000 },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'users' }
);

// Code Analysis Result Model
const analysisSchema = new Schema(
  {
    id: { type: String, default: uuidv4, primary: true },
    userId: { type: String, required: true, ref: 'User' },
    code: { type: String, required: true },
    language: { type: String, enum: ['javascript', 'python', 'java', 'cpp', 'typescript'] },
    analysisType: { type: String, enum: ['syntax', 'complexity', 'security', 'performance'] },
    results: {
      ast: Schema.Types.Mixed,
      issues: [
        {
          type: String,
          severity: String,
          line: Number,
          message: String,
        },
      ],
      metrics: {
        complexity: Number,
        linesOfCode: Number,
        functions: Number,
      },
      suggestions: [String],
    },
    executionTime: Number,
    cached: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'analyses' }
);

// Visualization Model
const visualizationSchema = new Schema(
  {
    id: { type: String, default: uuidv4, primary: true },
    userId: { type: String, required: true, ref: 'User' },
    title: { type: String, required: true },
    description: String,
    code: String,
    visualizationType: { type: String, enum: ['flowchart', 'graph', 'tree', 'sequence', 'd3', 'three'] },
    mermaidDiagram: String,
    data: Schema.Types.Mixed,
    settings: Schema.Types.Mixed,
    isPublic: { type: Boolean, default: false },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'visualizations' }
);

// Explanation Model
const explanationSchema = new Schema(
  {
    id: { type: String, default: uuidv4, primary: true },
    userId: { type: String, required: true, ref: 'User' },
    code: { type: String, required: true },
    language: { type: String, required: true },
    explainType: { type: String, enum: ['summary', 'detailed', 'educational'] },
    explanation: { type: String, required: true },
    explanationTokens: Number,
    keyPoints: [String],
    codeSnippets: [
      {
        snippet: String,
        explanation: String,
      },
    ],
    model: { type: String, default: 'claude-3-sonnet' },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'explanations' }
);

// User Progress Model
const progressSchema = new Schema(
  {
    id: { type: String, default: uuidv4, primary: true },
    userId: { type: String, required: true, unique: true, ref: 'User' },
    analysesCount: { type: Number, default: 0 },
    visualizationsCount: { type: Number, default: 0 },
    explanationsCount: { type: Number, default: 0 },
    totalCodeLines: { type: Number, default: 0 },
    learningProgress: {
      completedLessons: [String],
      currentLesson: String,
      score: Number,
    },
    achievements: [String],
    lastActivity: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'user_progress' }
);

// Create and export models
export const User = model('User', userSchema);
export const Analysis = model('Analysis', analysisSchema);
export const Visualization = model('Visualization', visualizationSchema);
export const Explanation = model('Explanation', explanationSchema);
export const UserProgress = model('UserProgress', progressSchema);
