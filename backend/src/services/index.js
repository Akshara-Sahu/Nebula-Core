import Anthropic from '@anthropic-ai/sdk';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import * as acorn from 'acorn';
import logger from '../utils/logger.js';
import { cache } from '../config/redis.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Code Analysis Service
export const codeAnalysisService = {
  // Parse code using Babel for JavaScript/TypeScript
  parseJavaScript(code) {
    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        errorRecovery: true,
      });
      return ast;
    } catch (error) {
      logger.warn('Babel parse error:', error.message);
      return null;
    }
  },

  // Parse code using Acorn
  parseWithAcorn(code) {
    try {
      const ast = acorn.parse(code, { ecmaVersion: 2021 });
      return ast;
    } catch (error) {
      logger.warn('Acorn parse error:', error.message);
      return null;
    }
  },

  // Extract metrics from AST
  extractMetrics(code, ast) {
    const metrics = {
      linesOfCode: code.split('\n').length,
      functions: 0,
      classes: 0,
      variables: 0,
      imports: 0,
      comments: 0,
      complexity: 1, // Cyclomatic complexity
    };

    if (!ast) return metrics;

    try {
      traverse(ast, {
        FunctionDeclaration() {
          metrics.functions++;
        },
        FunctionExpression() {
          metrics.functions++;
        },
        ArrowFunctionExpression() {
          metrics.functions++;
        },
        ClassDeclaration() {
          metrics.classes++;
        },
        VariableDeclarator() {
          metrics.variables++;
        },
        ImportDeclaration() {
          metrics.imports++;
        },
        IfStatement() {
          metrics.complexity++;
        },
        WhileStatement() {
          metrics.complexity++;
        },
        ForStatement() {
          metrics.complexity++;
        },
        SwitchCase() {
          metrics.complexity++;
        },
      });
    } catch (error) {
      logger.warn('Error extracting metrics:', error.message);
    }

    return metrics;
  },

  // Detect potential issues in code
  detectIssues(code, ast) {
    const issues = [];

    // Check for console statements
    if (code.includes('console.log') || code.includes('console.warn')) {
      issues.push({
        type: 'debug-statement',
        severity: 'warning',
        message: 'Found console statements - remove before production',
      });
    }

    // Check for empty catch blocks
    if (code.includes('} catch') && code.includes('{}')) {
      issues.push({
        type: 'empty-catch',
        severity: 'error',
        message: 'Empty catch block detected - should handle errors',
      });
    }

    // Check for unused variables (basic heuristic)
    if (code.includes('const ') && !code.includes('${') && !code.includes('` ${')) {
      // Simple check - not exhaustive
    }

    // Check for hardcoded API keys
    if (code.match(/['"]?(api[_-]?key|secret|password|token)['"']?\s*[:=]/i)) {
      issues.push({
        type: 'security-issue',
        severity: 'critical',
        message: 'Potential hardcoded credentials detected',
      });
    }

    return issues;
  },

  // Perform full code analysis
  async analyzeCode(code, language = 'javascript') {
    const cacheKey = `analysis:${Buffer.from(code).toString('base64').slice(0, 50)}`;

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Code analysis retrieved from cache');
      return { ...cached, cached: true };
    }

    const startTime = Date.now();
    let ast = null;

    if (language === 'javascript' || language === 'typescript') {
      ast = this.parseJavaScript(code);
    }

    const metrics = this.extractMetrics(code, ast);
    const issues = this.detectIssues(code, ast);

    const analysis = {
      language,
      metrics,
      issues,
      ast: ast ? { type: 'babel-ast' } : null,
      executionTime: Date.now() - startTime,
      cached: false,
    };

    // Cache the result
    await cache.set(cacheKey, analysis, parseInt(process.env.CACHE_TTL_LONG) || 3600);

    return analysis;
  },
};

// Visualization Service
export const visualizationService = {
  // Generate Mermaid diagram from code structure
  generateMermaidFromCode(code, language) {
    let diagram = 'graph TD\n';

    // Basic code structure visualization
    if (code.includes('function') || code.includes('const')) {
      diagram += '    A["Code Structure"]\n';
      diagram += '    B["Functions"]\n';
      diagram += '    C["Variables"]\n';
      diagram += '    A --> B\n';
      diagram += '    A --> C\n';
    }

    return diagram;
  },

  // Generate D3 graph data
  generateD3Graph(code) {
    const nodes = [];
    const links = [];

    // Extract function names and create nodes
    const functionMatches = code.match(/function\s+(\w+)/g) || [];
    functionMatches.forEach((match, i) => {
      const name = match.replace('function ', '');
      nodes.push({
        id: name,
        group: i % 3,
        size: 15 + Math.random() * 20,
      });
    });

    // Create links between nodes (simplified)
    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({
        source: nodes[i].id,
        target: nodes[(i + 1) % nodes.length].id,
        value: Math.random() * 5,
      });
    }

    return { nodes, links };
  },

  // Generate visualization based on type
  async generateVisualization(code, type = 'mermaid', language = 'javascript') {
    try {
      let visualization;

      switch (type) {
        case 'mermaid':
          visualization = this.generateMermaidFromCode(code, language);
          break;
        case 'd3':
          visualization = this.generateD3Graph(code);
          break;
        case 'flowchart':
          visualization = this.generateMermaidFromCode(code, language);
          break;
        default:
          visualization = this.generateMermaidFromCode(code, language);
      }

      return {
        type,
        visualization,
        language,
      };
    } catch (error) {
      logger.error('Error generating visualization:', error.message);
      throw error;
    }
  },
};

// AI Explanation Service (Claude API)
export const explanationService = {
  async generateExplanation(code, language = 'javascript', explainType = 'summary') {
    const cacheKey = `explanation:${Buffer.from(code).toString('base64').slice(0, 50)}:${explainType}`;

    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      logger.info('Explanation retrieved from cache');
      return { ...cached, cached: true };
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const prompts = {
        summary: `Provide a brief summary of this ${language} code in 2-3 sentences:`,
        detailed: `Provide a detailed explanation of this ${language} code, explaining each section:`,
        educational: `Explain this ${language} code in a way that would help a junior developer understand it:`,
      };

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${prompts[explainType]}\n\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
      });

      const explanation = message.content[0].type === 'text' ? message.content[0].text : '';

      const result = {
        explanation,
        language,
        explainType,
        model: 'claude-3-5-sonnet-20241022',
        tokensUsed: message.usage.output_tokens,
        cached: false,
      };

      // Cache the result
      await cache.set(cacheKey, result, parseInt(process.env.CACHE_TTL_LONG) || 3600);

      return result;
    } catch (error) {
      logger.error('Error generating explanation:', error.message);
      throw error;
    }
  },

  // Extract key points from code
  async extractKeyPoints(code, language) {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Extract the 3-5 main key points from this ${language} code. Return as a numbered list:\n\n\`\`\`${language}\n${code}\n\`\`\``,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const keyPoints = text
      .split('\n')
      .filter((line) => line.match(/^\d+\.|^-|^•/))
      .map((line) => line.replace(/^\d+\.|^-|^•/, '').trim());

    return keyPoints;
  },
};

export default {
  codeAnalysisService,
  visualizationService,
  explanationService,
};
