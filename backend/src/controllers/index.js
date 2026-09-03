import {
  codeAnalysisService,
  visualizationService,
  explanationService,
} from '../services/index.js';
import { Analysis } from '../models/mongoModels.js';
import { pgAnalyses } from '../models/postgresModels.js';
import logger from '../utils/logger.js';

// Analyze endpoint - POST /api/analyze
export const analyzeCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript', analysisType = 'general' } = req.body;
    const userId = req.userId || 'anonymous';

    if (!code) {
      return res.status(400).json({
        success: false,
        error: { message: 'Code is required' },
      });
    }

    logger.info(`Analyzing ${language} code for user ${userId}`);

    // Perform code analysis
    const analysis = await codeAnalysisService.analyzeCode(code, language);

    // Store in MongoDB
    const mongoAnalysis = new Analysis({
      userId,
      code,
      language,
      analysisType,
      results: {
        ...analysis,
        issues: analysis.issues || [],
      },
      executionTime: analysis.executionTime,
      cached: analysis.cached,
    });

    await mongoAnalysis.save();

    res.status(200).json({
      success: true,
      data: {
        id: mongoAnalysis._id,
        ...analysis,
        language,
      },
    });
  } catch (error) {
    logger.error('Error analyzing code:', error.message);
    next(error);
  }
};

// Visualize endpoint - POST /api/visualize
export const visualizeCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript', visualizationType = 'mermaid' } = req.body;
    const userId = req.userId || 'anonymous';

    if (!code) {
      return res.status(400).json({
        success: false,
        error: { message: 'Code is required' },
      });
    }

    logger.info(
      `Generating ${visualizationType} visualization for user ${userId}`
    );

    // Generate visualization
    const visualization = await visualizationService.generateVisualization(
      code,
      visualizationType,
      language
    );

    res.status(200).json({
      success: true,
      data: {
        ...visualization,
        cached: false,
      },
    });
  } catch (error) {
    logger.error('Error visualizing code:', error.message);
    next(error);
  }
};

// Explain endpoint - POST /api/explain
export const explainCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript', explainType = 'summary' } = req.body;
    const userId = req.userId || 'anonymous';

    if (!code) {
      return res.status(400).json({
        success: false,
        error: { message: 'Code is required' },
      });
    }

    logger.info(`Generating ${explainType} explanation for user ${userId}`);

    // Generate explanation using Claude
    const explanation = await explanationService.generateExplanation(
      code,
      language,
      explainType
    );

    // Store in MongoDB
    const mongoExplanation = new (require('../models/mongoModels.js').Explanation)({
      userId,
      code,
      language,
      explainType,
      explanation: explanation.explanation,
      explanationTokens: explanation.tokensUsed,
      model: explanation.model,
      keyPoints: await explanationService.extractKeyPoints(code, language),
    });

    await mongoExplanation.save();

    res.status(200).json({
      success: true,
      data: {
        id: mongoExplanation._id,
        ...explanation,
      },
    });
  } catch (error) {
    logger.error('Error explaining code:', error.message);
    if (error.message.includes('Anthropic API key')) {
      return res.status(503).json({
        success: false,
        error: { message: 'AI explanation service is not configured' },
      });
    }
    next(error);
  }
};

// Save progress endpoint - POST /api/save
export const saveProgress = async (req, res, next) => {
  try {
    const { analysisId, visualizationId, explanationId, progressData } = req.body;
    const userId = req.userId || 'anonymous';

    logger.info(`Saving progress for user ${userId}`);

    // Update user progress in MongoDB
    const { UserProgress } = require('../models/mongoModels.js');
    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      {
        $inc: {
          analysesCount: analysisId ? 1 : 0,
          visualizationsCount: visualizationId ? 1 : 0,
          explanationsCount: explanationId ? 1 : 0,
        },
        ...progressData,
        lastActivity: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        message: 'Progress saved successfully',
        progress,
      },
    });
  } catch (error) {
    logger.error('Error saving progress:', error.message);
    next(error);
  }
};

// Get analysis history
export const getAnalysisHistory = async (req, res, next) => {
  try {
    const userId = req.userId || 'anonymous';
    const { limit = 50, offset = 0 } = req.query;

    logger.info(`Fetching analysis history for user ${userId}`);

    // Fetch from MongoDB
    const analyses = await Analysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Analysis.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        analyses,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching analysis history:', error.message);
    next(error);
  }
};

// Health check endpoint
export const healthCheck = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Nebula Backend API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
};

export default {
  analyzeCode,
  visualizeCode,
  explainCode,
  saveProgress,
  getAnalysisHistory,
  healthCheck,
};
