import { db } from './persistence';
import { LogEntry } from '../types';

export class LogService {
  static async getAll(): Promise<LogEntry[]> {
    return await db.getLogs();
  }

  static async getByReference(referenceId: string): Promise<LogEntry[]> {
    const allLogs = await db.getLogs();
    return allLogs
      .filter(log => log.referenceId === referenceId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async add(logData: Omit<LogEntry, 'id'>): Promise<LogEntry[]> {
    const currentLogs = await db.getLogs();
    const newLog: LogEntry = {
      ...logData,
      id: Date.now().toString(),
    };
    const updatedLogs = [newLog, ...currentLogs];
    await db.saveLogs(updatedLogs);
    return updatedLogs;
  }
}