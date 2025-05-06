export function capitalize(str: string): string {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toTitleCase(str: string) {
  return str
    .toLowerCase() // まずすべて小文字に
    .split(/\s+/) // 空白で分割
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
