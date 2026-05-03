export function getFlag(id?: string): string {
  if (!id) return '🌐';
  const iso = id.slice(0, 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso)) return '🌐';
  return [...iso].map((c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6)).join('');
}
