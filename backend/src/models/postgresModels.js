import { postgresPool } from '../config/database.js';
import logger from '../utils/logger.js';

// Initialize PostgreSQL tables
export async function initializePostgresDB() {
  const client = await postgresPool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        api_key VARCHAR(255) UNIQUE,
        subscription_tier VARCHAR(20) DEFAULT 'free',
        api_calls_used INTEGER DEFAULT 0,
        api_calls_limit INTEGER DEFAULT 1000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Code analyses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS code_analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        language VARCHAR(50) NOT NULL,
        analysis_type VARCHAR(50) NOT NULL,
        complexity_score FLOAT,
        lines_of_code INTEGER,
        function_count INTEGER,
        security_issues INTEGER,
        performance_issues INTEGER,
        execution_time_ms INTEGER,
        cached BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Visualizations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS visualizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        code TEXT,
        visualization_type VARCHAR(50) NOT NULL,
        mermaid_diagram TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Explanations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS explanations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        language VARCHAR(50) NOT NULL,
        explanation_type VARCHAR(50) NOT NULL,
        explanation TEXT NOT NULL,
        tokens_used INTEGER,
        model VARCHAR(100) DEFAULT 'claude-3-sonnet',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // User progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        analyses_count INTEGER DEFAULT 0,
        visualizations_count INTEGER DEFAULT 0,
        explanations_count INTEGER DEFAULT 0,
        total_code_lines INTEGER DEFAULT 0,
        completed_lessons TEXT,
        current_lesson VARCHAR(255),
        learning_score FLOAT,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON code_analyses(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_visualizations_user_id ON visualizations(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_explanations_user_id ON explanations(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON code_analyses(created_at);');

    logger.info('PostgreSQL tables initialized successfully');
  } catch (error) {
    logger.error('Error initializing PostgreSQL tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Query helper functions
export async function queryDatabase(query, values = []) {
  try {
    const result = await postgresPool.query(query, values);
    return result;
  } catch (error) {
    logger.error('Database query error:', error.message);
    throw error;
  }
}

// User operations
export const pgUsers = {
  async create(username, email, passwordHash) {
    const result = await queryDatabase(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [username, email, passwordHash]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await queryDatabase('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await queryDatabase('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async update(id, updates) {
    const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
    const values = Object.values(updates);
    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
      values.length
    } RETURNING *`;
    const result = await queryDatabase(query, values);
    return result.rows[0];
  },
};

// Code analysis operations
export const pgAnalyses = {
  async create(userId, codeData) {
    const result = await queryDatabase(
      `INSERT INTO code_analyses 
        (user_id, code, language, analysis_type, complexity_score, lines_of_code, 
         function_count, security_issues, performance_issues, execution_time_ms, cached) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        userId,
        codeData.code,
        codeData.language,
        codeData.analysisType,
        codeData.complexity,
        codeData.loc,
        codeData.functions,
        codeData.securityIssues,
        codeData.performanceIssues,
        codeData.executionTime,
        codeData.cached,
      ]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await queryDatabase('SELECT * FROM code_analyses WHERE id = $1', [id]);
    return result.rows[0];
  },

  async findByUserId(userId, limit = 50, offset = 0) {
    const result = await queryDatabase(
      'SELECT * FROM code_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows;
  },
};

export default { initializePostgresDB, queryDatabase, pgUsers, pgAnalyses };
