export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export function generateShopSlug(shopName: string, existingSlugs: string[] = []): string {
  const base = shopName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (!existingSlugs.includes(base)) return base;

  let counter = 1;
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}
