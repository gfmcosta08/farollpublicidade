import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, '../../logs');

if (!existsSync(LOGS_DIR)) {
  mkdirSync(LOGS_DIR, { recursive: true });
}

export class LogService {
  constructor() {
    this.logsPath = join(LOGS_DIR, 'executions.json');
    this.initializeLogs();
  }

  initializeLogs() {
    if (!existsSync(this.logsPath)) {
      writeFileSync(this.logsPath, JSON.stringify([], null, 2));
    }
  }

  readLogs() {
    const content = readFileSync(this.logsPath, 'utf-8');
    return JSON.parse(content);
  }

  writeLogs(logs) {
    writeFileSync(this.logsPath, JSON.stringify(logs, null, 2));
  }

  async startExecution(squadName) {
    const executionId = uuidv4();
    const logs = this.readLogs();
    
    const execution = {
      id: executionId,
      squadName,
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: null,
      duration: null,
      logs: [],
      result: null,
      error: null
    };
    
    logs.unshift(execution);
    this.writeLogs(logs);
    
    return executionId;
  }

  async finishExecution(executionId, result) {
    const logs = this.readLogs();
    const index = logs.findIndex(e => e.id === executionId);
    
    if (index !== -1) {
      logs[index].status = result.success ? 'success' : 'failed';
      logs[index].finishedAt = result.completedAt || new Date().toISOString();
      logs[index].duration = new Date(logs[index].finishedAt) - new Date(logs[index].startedAt);
      logs[index].logs = result.logs || [];
      logs[index].result = result;
      
      this.writeLogs(logs);
    }
  }

  async failExecution(executionId, errorMessage) {
    const logs = this.readLogs();
    const index = logs.findIndex(e => e.id === executionId);
    
    if (index !== -1) {
      logs[index].status = 'error';
      logs[index].finishedAt = new Date().toISOString();
      logs[index].duration = new Date(logs[index].finishedAt) - new Date(logs[index].startedAt);
      logs[index].error = errorMessage;
      
      this.writeLogs(logs);
    }
  }

  async getExecution(executionId) {
    const logs = this.readLogs();
    return logs.find(e => e.id === executionId) || null;
  }

  async getAllExecutions(limit = 50, offset = 0) {
    const logs = this.readLogs();
    return logs.slice(offset, offset + limit);
  }
}
