import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export interface ProductRow {
  productName: string;
  category: string;
  brand?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  unit: string;
  sku?: string;
  description?: string;
  imageUrl?: string;
  tags?: string;
  availability: boolean;
}

export interface ExcelParseResult {
  valid: ProductRow[];
  errors: Array<{ row: number; error: string; data: any }>;
  total: number;
}

// All possible column name variations → normalized key
const COLUMN_ALIASES: Record<string, string> = {
  // productName variants
  'productname':    'productName',
  'product_name':   'productName',
  'product name':   'productName',
  'name':           'productName',
  'item':           'productName',
  'item name':      'productName',
  'itemname':       'productName',
  'item_name':      'productName',
  'title':          'productName',
  'product':        'productName',

  // category
  'category':       'category',
  'cat':            'category',
  'type':           'category',

  // brand
  'brand':          'brand',
  'company':        'brand',
  'manufacturer':   'brand',

  // price
  'price':          'price',
  'mrp':            'price',
  'selling price':  'price',
  'sellingprice':   'price',
  'rate':           'price',
  'cost':           'price',

  // discountPrice
  'discountprice':  'discountPrice',
  'discount price': 'discountPrice',
  'disc price':     'discountPrice',
  'discounted':     'discountPrice',
  'sale price':     'discountPrice',
  'saleprice':      'discountPrice',
  'offer price':    'discountPrice',
  'discount':       'discountPrice',

  // quantity
  'quantity':       'quantity',
  'qty':            'quantity',
  'stock':          'quantity',
  'inventory':      'quantity',
  'count':          'quantity',
  'units':          'quantity',

  // unit
  'unit':           'unit',
  'uom':            'unit',
  'measure':        'unit',
  'unit of measure':'unit',

  // sku
  'sku':            'sku',
  'code':           'sku',
  'product code':   'sku',
  'productcode':    'sku',
  'barcode':        'sku',
  'item code':      'sku',
  'itemcode':       'sku',

  // description
  'description':    'description',
  'desc':           'description',
  'details':        'description',
  'info':           'description',

  // imageUrl
  'imageurl':       'imageUrl',
  'image url':      'imageUrl',
  'image':          'imageUrl',
  'img':            'imageUrl',
  'photo':          'imageUrl',
  'picture':        'imageUrl',
  'img url':        'imageUrl',

  // tags
  'tags':           'tags',
  'tag':            'tags',
  'keywords':       'tags',
  'labels':         'tags',

  // availability
  'availability':   'availability',
  'available':      'availability',
  'avail':          'availability',
  'status':         'availability',
  'active':         'availability',
  'instock':        'availability',
  'in stock':       'availability',
};

function normalizeHeader(header: string): string {
  if (header === null || header === undefined) return '';
  const lower = String(header).toLowerCase().trim();
  return COLUMN_ALIASES[lower] || lower.replace(/[\s_-]+/g, '');
}

function parseBoolean(val: any): boolean {
  if (val === null || val === undefined || val === '') return true; // default available
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  const str = String(val).toLowerCase().trim();
  if (['false', '0', 'no', 'n', 'inactive', 'unavailable', 'out of stock'].includes(str)) return false;
  return true; // default to true for anything else (yes, true, 1, available, etc.)
}

function parseNumber(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(/[₹,\s]/g, ''));
  return isNaN(num) ? null : num;
}

export function parseExcelFile(filePath: string): ExcelParseResult {
  const workbook = XLSX.readFile(filePath, {
    cellDates: true,
    cellNF: false,
    cellText: false
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Use raw: false to get formatted strings, but we'll handle types manually
  const rawData: any[] = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: true  // get raw values so booleans stay as booleans
  });

  if (rawData.length === 0) {
    return {
      valid: [],
      errors: [{ row: 0, error: 'Excel file is empty or has no data rows', data: {} }],
      total: 0
    };
  }

  // Normalize all row keys
  const normalizedData = rawData.map((row: any) => {
    const normalized: any = {};
    for (const key of Object.keys(row)) {
      const normalizedKey = normalizeHeader(key);
      if (normalizedKey) {
        normalized[normalizedKey] = row[key];
      }
    }
    return normalized;
  });

  // Check if productName column exists at all
  const firstRow = normalizedData[0];
  if (!firstRow.hasOwnProperty('productName')) {
    const availableKeys = Object.keys(firstRow).join(', ');
    return {
      valid: [],
      errors: [{
        row: 1,
        error: `Could not find "productName" column. Found columns: ${availableKeys}. Please rename your product name column to "productName".`,
        data: firstRow
      }],
      total: rawData.length
    };
  }

  const valid: ProductRow[] = [];
  const errors: Array<{ row: number; error: string; data: any }> = [];

  normalizedData.forEach((row: any, idx: number) => {
    const rowNum = idx + 2; // +2 for header row + 1-based

    // --- Validate productName ---
    const productName = row['productName'];
    if (productName === null || productName === undefined || String(productName).trim() === '') {
      errors.push({ row: rowNum, error: 'Missing productName', data: row });
      return;
    }

    // --- Validate price ---
    const priceRaw = row['price'];
    const price = parseNumber(priceRaw);
    if (price === null || price < 0) {
      errors.push({ row: rowNum, error: `Invalid price: "${priceRaw}"`, data: row });
      return;
    }

    // --- Validate quantity ---
    const qtyRaw = row['quantity'];
    const quantity = parseNumber(qtyRaw);
    if (quantity === null || quantity < 0) {
      errors.push({ row: rowNum, error: `Invalid quantity: "${qtyRaw}"`, data: row });
      return;
    }

    // --- Parse discountPrice ---
    const discountPriceRaw = row['discountPrice'];
    let discountPrice: number | undefined = undefined;
    if (discountPriceRaw !== '' && discountPriceRaw !== null && discountPriceRaw !== undefined) {
      const dp = parseNumber(discountPriceRaw);
      if (dp !== null && dp > 0) discountPrice = dp;
    }

    // --- Parse tags ---
    let tags: string | undefined = undefined;
    const tagsRaw = row['tags'];
    if (tagsRaw !== null && tagsRaw !== undefined && String(tagsRaw).trim() !== '') {
      tags = String(tagsRaw).trim();
    }

    // --- Parse availability (handles TRUE/FALSE booleans from Excel) ---
    const availability = parseBoolean(row['availability']);

    const product: ProductRow = {
      productName:   String(productName).trim(),
      category:      row['category'] ? String(row['category']).trim() : 'General',
      brand:         row['brand']    ? String(row['brand']).trim()    : undefined,
      price,
      discountPrice,
      quantity:      Math.floor(quantity),
      unit:          row['unit']        ? String(row['unit']).trim()        : 'piece',
      sku:           row['sku']         ? String(row['sku']).trim()         : undefined,
      description:   row['description'] ? String(row['description']).trim() : undefined,
      imageUrl:      row['imageUrl']    ? String(row['imageUrl']).trim()    : undefined,
      tags,
      availability,
    };

    valid.push(product);
  });

  return { valid, errors, total: rawData.length };
}

export function generateExcelTemplate(): Buffer {
  const wb = XLSX.utils.book_new();

  const headers = [
    'productName','category','brand','price','discountPrice',
    'quantity','unit','sku','description','imageUrl','tags','availability'
  ];

  const sampleData = [
    ['Basmati Rice 1kg',      'Groceries',     'India Gate', 120, 110, 50,  'kg',     'GRC001', 'Premium basmati rice',    '', 'rice,staple',    true],
    ['Sunflower Oil 1L',      'Groceries',     'Fortune',    160, 150, 30,  'liter',  'GRC002', 'Refined sunflower oil',   '', 'oil,cooking',    true],
    ['Colgate Toothpaste 200g','Personal Care','Colgate',    80,  75,  100, 'piece',  'PC001',  'Cavity protection',       '', 'oral,hygiene',   true],
    ['Maggi Noodles 70g',     'Snacks',        'Nestle',     14,  '',  200, 'packet', 'SNK001', '2-minute noodles',        '', 'noodles,instant',true],
    ['Dove Soap 100g',        'Personal Care', 'Dove',       55,  '',  80,  'piece',  'PC002',  'Moisturizing soap bar',   '', 'soap,bath',      true],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  ws['!cols'] = headers.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function exportProductsToExcel(products: any[]): Buffer {
  const wb = XLSX.utils.book_new();

  const headers = [
    'productName','category','brand','price','discountPrice',
    'quantity','unit','sku','description','imageUrl','tags','availability'
  ];

  const rows = products.map(p => [
    p.productName,
    p.category,
    p.brand        || '',
    p.price,
    p.discountPrice || '',
    p.quantity,
    p.unit,
    p.sku          || '',
    p.description  || '',
    p.imageUrl     || '',
    Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
    p.availability ? true : false
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Products');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export function ensureUploadDir(): void {
  const dirs = [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'uploads', 'inventory'),
    path.join(process.cwd(), 'uploads', 'images'),
    path.join(process.cwd(), 'uploads', 'qr'),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}