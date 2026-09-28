export type ClassDictionary = Record<string, boolean | null | undefined>;
export type ClassValue = string | number | null | undefined | false | ClassDictionary | ClassValue[];

function collect(value: ClassValue, out: string[]): void {
  if (!value && value !== 0) return;

  if (typeof value === 'string' || typeof value === 'number') {
    out.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const entry of value) collect(entry, out);
    return;
  }

  for (const [key, enabled] of Object.entries(value)) {
    if (enabled) out.push(key);
  }
}

export function cx(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) collect(value, out);
  return out.join(' ');
}
