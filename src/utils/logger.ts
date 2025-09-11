/**
 * Application Logger
 * Provides consistent logging across the application with different levels and development tools
 * 
 * Related GitHub Issue: #1 - Core Infrastructure
 */

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

/**
 * Log entry interface
 */
interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stack?: string;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  categories: string[];
  colors: Record<LogLevel, string>;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN,
  enableConsole: true,
  enableStorage: import.meta.env.DEV,
  maxStorageEntries: 1000,
  categories: [],
  colors: {
    [LogLevel.TRACE]: '#6B7280', // Gray
    [LogLevel.DEBUG]: '#3B82F6', // Blue
    [LogLevel.INFO]: '#059669',  // Green
    [LogLevel.WARN]: '#D97706',  // Yellow
    [LogLevel.ERROR]: '#DC2626', // Red
    [LogLevel.FATAL]: '#7C2D12', // Dark Red
  },
};

/**
 * Main Logger class
 */
export class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private category: string;

  constructor(category: string = 'App', config: Partial<LoggerConfig> = {}) {
    this.category = category;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Get the current log level
   */
  getLevel(): LogLevel {
    return this.config.level;
  }

  /**
   * Check if a log level is enabled
   */
  isLevelEnabled(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Create a log entry
   */
  private createEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date(),
      level,
      category: this.category,
      message,
      data,
      stack: level >= LogLevel.ERROR ? new Error().stack : undefined,
    };
  }

  /**
   * Log an entry
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.isLevelEnabled(level)) return;

    const entry = this.createEntry(level, message, data);

    // Store entry
    if (this.config.enableStorage) {
      this.entries.push(entry);
      if (this.entries.length > this.config.maxStorageEntries) {
        this.entries.shift(); // Remove oldest entry
      }
    }

    // Console output
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // External logging service (could be added later)
    if (level >= LogLevel.ERROR) {
      this.logToExternalService(entry);
    }
  }

  /**
   * Log to browser console with formatting
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const color = this.config.colors[entry.level];
    
    const prefix = `%c[${timestamp}] [${levelName}] [${entry.category}]`;
    const style = `color: ${color}; font-weight: bold;`;

    const consoleMethod = this.getConsoleMethod(entry.level);

    if (entry.data) {
      consoleMethod(prefix, style, entry.message, entry.data);
    } else {
      consoleMethod(prefix, style, entry.message);
    }

    // Log stack trace for errors
    if (entry.stack && entry.level >= LogLevel.ERROR) {
      console.groupCollapsed('Stack Trace');
      console.log(entry.stack);
      console.groupEnd();
    }
  }

  /**
   * Get appropriate console method for log level
   */
  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        return console.debug;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Log to external service (placeholder for future implementation)
   */
  private logToExternalService(entry: LogEntry): void {
    // TODO: Implement external logging service integration
    // This could send logs to services like Sentry, LogRocket, etc.
    if (import.meta.env.DEV) {
      console.debug('[Logger] Would send to external service:', entry);
    }
  }

  /**
   * Public logging methods
   */
  trace(message: string, data?: any): void {
    this.log(LogLevel.TRACE, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | any): void {
    const data = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;
    
    this.log(LogLevel.ERROR, message, data);
  }

  fatal(message: string, error?: Error | any): void {
    const data = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;
    
    this.log(LogLevel.FATAL, message, data);
  }

  /**
   * Performance timing utilities
   */
  time(label: string): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      console.time(`[${this.category}] ${label}`);
    }
  }

  timeEnd(label: string): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      console.timeEnd(`[${this.category}] ${label}`);
    }
  }

  /**
   * Group logging
   */
  group(label: string, collapsed: boolean = false): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      if (collapsed) {
        console.groupCollapsed(`[${this.category}] ${label}`);
      } else {
        console.group(`[${this.category}] ${label}`);
      }
    }
  }

  groupEnd(): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      console.groupEnd();
    }
  }

  /**
   * Table logging for arrays and objects
   */
  table(data: any, label?: string): void {
    if (this.isLevelEnabled(LogLevel.DEBUG)) {
      if (label) {
        console.log(`[${this.category}] ${label}`);
      }
      console.table(data);
    }
  }

  /**
   * Get all stored log entries
   */
  getEntries(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.entries.filter(entry => entry.level >= level);
    }
    return [...this.entries];
  }

  /**
   * Clear all stored entries
   */
  clearEntries(): void {
    this.entries = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  /**
   * Create a child logger with a sub-category
   */
  child(subCategory: string): Logger {
    return new Logger(`${this.category}:${subCategory}`, this.config);
  }
}

/**
 * Development debugging utilities
 */
export class DevTools {
  private static isEnabled = import.meta.env.DEV;

  /**
   * Enable/disable dev tools
   */
  static setEnabled(enabled: boolean): void {
    DevTools.isEnabled = enabled;
  }

  /**
   * Debug function execution time
   */
  static timeFunction<T extends (...args: any[]) => any>(
    fn: T,
    label?: string
  ): T {
    if (!DevTools.isEnabled) return fn;

    return ((...args: any[]) => {
      const name = label || fn.name || 'anonymous';
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      console.debug(`[DevTools] Function '${name}' took ${(end - start).toFixed(2)}ms`);
      
      return result;
    }) as T;
  }

  /**
   * Debug async function execution time
   */
  static timeAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    label?: string
  ): T {
    if (!DevTools.isEnabled) return fn;

    return (async (...args: any[]) => {
      const name = label || fn.name || 'anonymous';
      const start = performance.now();
      const result = await fn(...args);
      const end = performance.now();
      
      console.debug(`[DevTools] Async function '${name}' took ${(end - start).toFixed(2)}ms`);
      
      return result;
    }) as T;
  }

  /**
   * Log component render cycles
   */
  static logRender(componentName: string, props?: any): void {
    if (!DevTools.isEnabled) return;
    
    console.debug(`[DevTools] Rendering component: ${componentName}`, props);
  }

  /**
   * Log API calls
   */
  static logApiCall(method: string, url: string, data?: any): void {
    if (!DevTools.isEnabled) return;
    
    console.group(`[DevTools] API Call: ${method.toUpperCase()} ${url}`);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();
  }

  /**
   * Add global debug utilities to window object
   */
  static enableGlobalDebug(): void {
    if (typeof window === 'undefined' || !DevTools.isEnabled) return;

    (window as any).__GOCOMMERCE_DEBUG__ = {
      logger: logger,
      performance: {
        mark: (name: string) => performance.mark(name),
        measure: (name: string, start: string, end?: string) => {
          performance.measure(name, start, end);
          const measures = performance.getEntriesByName(name);
          const latest = measures[measures.length - 1];
          console.log(`[Performance] ${name}: ${latest.duration.toFixed(2)}ms`);
        },
        getEntries: () => performance.getEntries(),
        clearMarks: () => performance.clearMarks(),
        clearMeasures: () => performance.clearMeasures(),
      },
      memory: () => {
        if ('memory' in performance) {
          return (performance as any).memory;
        }
        return 'Memory API not available';
      },
      stores: () => {
        // This will be populated by the store manager
        return (window as any).__STORE_MANAGER__?.getAllStores() || {};
      },
    };

    console.log('[DevTools] Global debug utilities available at window.__GOCOMMERCE_DEBUG__');
  }
}

/**
 * Feature flags system for gradual rollouts
 */
export class FeatureFlags {
  private static flags: Map<string, boolean> = new Map();

  /**
   * Set a feature flag
   */
  static setFlag(name: string, enabled: boolean): void {
    FeatureFlags.flags.set(name, enabled);
  }

  /**
   * Check if a feature is enabled
   */
  static isEnabled(name: string): boolean {
    return FeatureFlags.flags.get(name) || false;
  }

  /**
   * Get all feature flags
   */
  static getAllFlags(): Record<string, boolean> {
    return Object.fromEntries(FeatureFlags.flags.entries());
  }

  /**
   * Load feature flags from environment or API
   */
  static async loadFlags(): Promise<void> {
    try {
      // Try to load from environment variables first
      const envFlags = import.meta.env.VITE_FEATURE_FLAGS;
      if (envFlags) {
        const flags = JSON.parse(envFlags);
        Object.entries(flags).forEach(([name, enabled]) => {
          FeatureFlags.setFlag(name, Boolean(enabled));
        });
      }

      // TODO: Load from API endpoint
      // const response = await fetch('/api/feature-flags');
      // const flags = await response.json();
      // Object.entries(flags).forEach(([name, enabled]) => {
      //   FeatureFlags.setFlag(name, Boolean(enabled));
      // });

    } catch (error) {
      logger.warn('Failed to load feature flags:', error);
    }
  }
}

/**
 * Environment configuration loader
 */
export class Environment {
  private static config: Record<string, any> = {};

  /**
   * Load environment configuration
   */
  static loadConfig(): void {
    Environment.config = {
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
      KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:9000',
      KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM || 'gocommerce',
      KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'gocommerce-admin-console',
      ENVIRONMENT: import.meta.env.MODE || 'development',
      VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
      BUILD_TIME: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
    };
  }

  /**
   * Get configuration value
   */
  static get<T = string>(key: string, defaultValue?: T): T {
    return Environment.config[key] ?? defaultValue;
  }

  /**
   * Get all configuration
   */
  static getAll(): Record<string, any> {
    return { ...Environment.config };
  }

  /**
   * Check if running in development
   */
  static isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  /**
   * Check if running in production
   */
  static isProduction(): boolean {
    return import.meta.env.PROD;
  }
}

// Create default logger instance
export const logger = new Logger('GoCommerce');

// Initialize environment and feature flags
Environment.loadConfig();
FeatureFlags.loadFlags();

// Enable global debug in development
if (import.meta.env.DEV) {
  DevTools.enableGlobalDebug();
}

// Export utilities
export { LogLevel };
export default logger;

// Copilot: This file may have been generated or refactored by GitHub Copilot.
