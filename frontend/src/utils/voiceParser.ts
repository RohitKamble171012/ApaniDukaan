// Parse natural language shopping list like "2 kg rice, 1 oil packet, 3 soaps"

export interface ParsedItem {
  name: string;
  quantity: number;
  unit?: string;
}

const QUANTITY_WORDS: Record<string, number> = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'a': 1, 'an': 1, 'half': 0.5
};

const UNITS = ['kg', 'gram', 'g', 'liter', 'l', 'ml', 'piece', 'pieces', 'packet', 'packets', 'box', 'boxes', 'dozen', 'pair', 'bottle', 'bottles', 'can', 'cans', 'pack', 'packs', 'bag', 'bags', 'roll', 'rolls'];

export function parseVoiceInput(text: string): ParsedItem[] {
  if (!text.trim()) return [];

  // Split by commas, "and", semicolons
  const segments = text.split(/[,;]|\band\b/).map(s => s.trim()).filter(Boolean);
  const items: ParsedItem[] = [];

  for (const segment of segments) {
    const tokens = segment.toLowerCase().trim().split(/\s+/);
    let quantity = 1;
    let unitFound = '';
    let nameTokens: string[] = [];
    let i = 0;

    // Try to parse quantity (number or word)
    if (tokens[i]) {
      const numVal = parseFloat(tokens[i]);
      if (!isNaN(numVal)) {
        quantity = numVal;
        i++;
      } else if (QUANTITY_WORDS[tokens[i]] !== undefined) {
        quantity = QUANTITY_WORDS[tokens[i]];
        i++;
      }
    }

    // Try to parse unit
    if (tokens[i] && UNITS.includes(tokens[i])) {
      unitFound = tokens[i];
      i++;
    }

    // The rest is the product name
    nameTokens = tokens.slice(i);
    const name = nameTokens.join(' ').trim();

    if (name.length >= 2) {
      items.push({ name, quantity, unit: unitFound || undefined });
    }
  }

  return items;
}

export function matchProductsFromText(text: string, products: any[]): {
  matched: Array<{ product: any; quantity: number; parsedName: string }>;
  unmatched: string[];
} {
  const parsed = parseVoiceInput(text);
  const matched: Array<{ product: any; quantity: number; parsedName: string }> = [];
  const unmatched: string[] = [];

  for (const item of parsed) {
    // Try to find matching product
    const searchName = item.name.toLowerCase();
    let bestMatch: any = null;
    let bestScore = 0;

    for (const product of products) {
      const productName = product.productName.toLowerCase();
      const tags = (product.tags || []).map((t: string) => t.toLowerCase());

      // Exact match
      if (productName.includes(searchName) || searchName.includes(productName)) {
        const score = productName === searchName ? 100 : productName.includes(searchName) ? 80 : 60;
        if (score > bestScore) { bestScore = score; bestMatch = product; }
        continue;
      }

      // Word match
      const searchWords = searchName.split(/\s+/);
      const productWords = productName.split(/\s+/);
      const matchingWords = searchWords.filter((w: string) => productWords.some((pw: string) => pw.includes(w) || w.includes(pw)));
      if (matchingWords.length > 0) {
        const score = (matchingWords.length / searchWords.length) * 50;
        if (score > bestScore) { bestScore = score; bestMatch = product; }
      }

      // Tag match
      if (tags.some((t: string) => t.includes(searchName) || searchName.includes(t))) {
        if (30 > bestScore) { bestScore = 30; bestMatch = product; }
      }
    }

    if (bestMatch && bestScore >= 30) {
      matched.push({ product: bestMatch, quantity: item.quantity, parsedName: item.name });
    } else {
      unmatched.push(`${item.quantity > 1 ? item.quantity + ' ' : ''}${item.name}`);
    }
  }

  return { matched, unmatched };
}
