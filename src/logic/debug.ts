const isDebug = typeof process !== 'undefined' && process.env?.MARVIN_DEBUG === 'true';

export function debug(...args: unknown[]): void {
  if (isDebug) console.log('[marvin-renderers]', ...args);
}
