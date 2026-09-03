import express from 'express';
import Joi from 'joi';
import {
  analyzeCode,
  visualizeCode,
  explainCode,
  saveProgress,
  getAnalysisHistory,
  healthCheck,
} from '../controllers/index.js';
import { validate } from '../middleware/index.js';

const router = express.Router();

// Validation schemas
const codeAnalysisSchema = Joi.object({
  code: Joi.string().required().min(1).max(50000),
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp', 'typescript')
    .default('javascript'),
  analysisType: Joi.string()
    .valid('syntax', 'complexity', 'security', 'performance', 'general')
    .default('general'),
});

const visualizationSchema = Joi.object({
  code: Joi.string().required().min(1).max(50000),
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp', 'typescript')
    .default('javascript'),
  visualizationType: Joi.string()
    .valid('mermaid', 'd3', 'flowchart', 'tree', 'graph', 'sequence')
    .default('mermaid'),
});

const explanationSchema = Joi.object({
  code: Joi.string().required().min(1).max(50000),
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp', 'typescript')
    .default('javascript'),
  explainType: Joi.string()
    .valid('summary', 'detailed', 'educational')
    .default('summary'),
});

const progressSchema = Joi.object({
  analysisId: Joi.string().optional(),
  visualizationId: Joi.string().optional(),
  explanationId: Joi.string().optional(),
  progressData: Joi.object().optional(),
});

// Routes
router.get('/health', healthCheck);

router.post('/analyze', validate(codeAnalysisSchema), analyzeCode);

router.post('/visualize', validate(visualizationSchema), visualizeCode);

router.post('/explain', validate(explanationSchema), explainCode);

router.post('/save', validate(progressSchema), saveProgress);

router.get('/history', getAnalysisHistory);

export default router;
