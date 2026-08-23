import { randomBytes } from 'node:crypto';

const DIACRITICS_REGEX = new RegExp('[̀-ͯ]', 'g');

function toBaseSlug(name: string): string {
  return (
    name
      .normalize('NFD')
      .replace(DIACRITICS_REGEX, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'evento'
  );
}

function randomCode(length = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export function generateSlug(name: string): string {
  return `${toBaseSlug(name)}-${randomCode()}`;
}
