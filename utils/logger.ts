import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// Define log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define log file path
const LOG_FILE_PATH = FileSystem.documentDirectory + 'app-logs.txt';

// Maximum log file size (5MB)
const MAX_LOG_SIZE = 5 * 1024 * 1024;

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug
};

/**
 * Logger utility that writes logs to both console and a file
 */
class Logger {
  private static instance: Logger;
  private logQueue: string[] = [];
  private isWriting = false;
  private logFileExists = false;
  private isProcessingLog = false;

  private constructor() {
    this.initLogFile();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Initialize the log file
   */
  private async initLogFile() {
    try {
      if (Platform.OS === 'web') {
        return;
      }

      // Check if log file exists
      const fileInfo = await FileSystem.getInfoAsync(LOG_FILE_PATH);
      
      if (!fileInfo.exists) {
        // Create log file with header
        await FileSystem.writeAsStringAsync(
          LOG_FILE_PATH,
          `=== APPLICATION LOG STARTED AT ${new Date().toISOString()} ===\n\n`,
          { encoding: FileSystem.EncodingType.UTF8 }
        );
      } else {
        // Check if log file is too large
        if (fileInfo.size > MAX_LOG_SIZE) {
          await this.rotateLogFile();
        }
      }
      
      this.logFileExists = true;
      
      // Log application start using native console to avoid recursion
      const startMessage = `[${new Date().toISOString()}] [INFO ] [APPLICATION] Application started\n`;
      originalConsole.info(startMessage);
      this.writeToFile(startMessage);
    } catch (error) {
      originalConsole.error('Failed to initialize log file:', error);
    }
  }

  /**
   * Rotate log file when it gets too large
   */
  private async rotateLogFile() {
    try {
      // Rename current log file
      const backupPath = `${LOG_FILE_PATH}.backup`;
      await FileSystem.moveAsync({
        from: LOG_FILE_PATH,
        to: backupPath
      });
      
      // Create new log file
      await FileSystem.writeAsStringAsync(
        LOG_FILE_PATH,
        `=== LOG ROTATED AT ${new Date().toISOString()} ===\n\n`,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      
      originalConsole.info(`Log file rotated. Backup at ${backupPath}`);
    } catch (error) {
      originalConsole.error('Failed to rotate log file:', error);
    }
  }

  /**
   * Write log entry to file
   */
  private async writeToFile(logEntry: string) {
    if (Platform.OS === 'web' || !this.logFileExists) return;
    
    this.logQueue.push(logEntry);
    
    if (!this.isWriting) {
      this.processQueue();
    }
  }

  /**
   * Process the log queue
   */
  private async processQueue() {
    if (this.logQueue.length === 0) {
      this.isWriting = false;
      return;
    }
    
    this.isWriting = true;
    
    try {
      const batch = this.logQueue.splice(0, 10).join('');
      await FileSystem.appendAsStringAsync(LOG_FILE_PATH, batch);
      
      // Continue processing queue
      setTimeout(() => this.processQueue(), 100);
    } catch (error) {
      originalConsole.error('Failed to write to log file:', error);
      this.isWriting = false;
    }
  }

  /**
   * Format log message with safeguards against recursion
   */
  private formatLogMessage(level: LogLevel, module: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase();
    // Use fixed width for level without using padEnd/padStart which can cause issues
    const levelFormatted = levelUpper.length < 5 ? 
      `${levelUpper}${' '.repeat(5 - levelUpper.length)}` : 
      levelUpper.substring(0, 5);
    
    let logMessage = `[${timestamp}] [${levelFormatted}] [${module}] ${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        try {
          const dataStr = JSON.stringify(data, null, 2);
          logMessage += `\nData: ${dataStr}`;
        } catch (e) {
          logMessage += `\nData: [Object could not be stringified]`;
        }
      } else {
        logMessage += `\nData: ${data}`;
      }
    }
    
    return logMessage + '\n';
  }

  /**
   * Log a debug message with safeguards against recursion
   */
  public debug(module: string, message: string, data?: any) {
    if (this.isProcessingLog) return; // Prevent recursion
    
    this.isProcessingLog = true;
    try {
      const logMessage = this.formatLogMessage('debug', module, message, data);
      originalConsole.debug(logMessage);
      this.writeToFile(logMessage);
    } finally {
      this.isProcessingLog = false;
    }
  }

  /**
   * Log an info message with safeguards against recursion
   */
  public info(module: string, message: string, data?: any) {
    if (this.isProcessingLog) return; // Prevent recursion
    
    this.isProcessingLog = true;
    try {
      const logMessage = this.formatLogMessage('info', module, message, data);
      originalConsole.info(logMessage);
      this.writeToFile(logMessage);
    } finally {
      this.isProcessingLog = false;
    }
  }

  /**
   * Log a warning message with safeguards against recursion
   */
  public warn(module: string, message: string, data?: any) {
    if (this.isProcessingLog) return; // Prevent recursion
    
    this.isProcessingLog = true;
    try {
      const logMessage = this.formatLogMessage('warn', module, message, data);
      originalConsole.warn(logMessage);
      this.writeToFile(logMessage);
    } finally {
      this.isProcessingLog = false;
    }
  }

  /**
   * Log an error message with safeguards against recursion
   */
  public error(module: string, message: string, data?: any) {
    if (this.isProcessingLog) return; // Prevent recursion
    
    this.isProcessingLog = true;
    try {
      const logMessage = this.formatLogMessage('error', module, message, data);
      originalConsole.error(logMessage);
      this.writeToFile(logMessage);
    } finally {
      this.isProcessingLog = false;
    }
  }

  /**
   * Get the log file path
   */
  public getLogFilePath(): string {
    return LOG_FILE_PATH;
  }

  /**
   * Get the log file content
   */
  public async getLogContent(): Promise<string> {
    if (Platform.OS === 'web' || !this.logFileExists) {
      return 'Log file not available on web platform';
    }
    
    try {
      return await FileSystem.readAsStringAsync(LOG_FILE_PATH);
    } catch (error) {
      originalConsole.error('Failed to read log file:', error);
      return 'Failed to read log file';
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Override console methods to also log to file
// Use a safer approach to avoid infinite recursion
const safeConsoleOverride = (originalFn: typeof console.log, level: LogLevel) => {
  return function(...args: any[]) {
    // Call original first
    originalFn.apply(console, args);
    
    // Don't try to log to file from console overrides
    // This prevents potential recursion issues
  };
};

// Only override in non-development environments to avoid dev tool issues
if (process.env.NODE_ENV !== 'development') {
  console.log = safeConsoleOverride(originalConsole.log, 'info');
  console.info = safeConsoleOverride(originalConsole.info, 'info');
  console.warn = safeConsoleOverride(originalConsole.warn, 'warn');
  console.error = safeConsoleOverride(originalConsole.error, 'error');
  console.debug = safeConsoleOverride(originalConsole.debug, 'debug');
}