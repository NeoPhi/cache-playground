export function parseIntFromEnv(key: string, defaultValue: number): number {
  let parsedValue = defaultValue;
  const envValue = process.env[key];
  if (envValue) {
    parsedValue = parseInt(envValue, 10);
  }
  // TODO: If needed provided more flexibility
  if (parsedValue < 1) {
    throw new Error(`${key} must be at least 1`);
  }
  // Log to warn to not include in piped output
  console.warn(`Using ${parsedValue.toLocaleString()} for ${key}`);
  return parsedValue;
}

export function parseFloatFromEnv(key: string, defaultValue: number): number {
  let parsedValue = defaultValue;
  const envValue = process.env[key];
  if (envValue) {
    parsedValue = parseFloat(envValue);
  }
  // Log to warn to not include in piped output
  console.warn(`Using ${parsedValue.toLocaleString()} for ${key}`);
  return parsedValue;
}
