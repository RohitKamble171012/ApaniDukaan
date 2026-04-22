/**
 * Run this script to generate a sample products.xlsx file
 * Usage: npx ts-node src/generate-template.ts
 */
import * as XLSX from 'xlsx';
import path from 'path';

const headers = ['productName', 'category', 'brand', 'price', 'discountPrice', 'quantity', 'unit', 'sku', 'description', 'imageUrl', 'tags', 'availability'];

const sampleRows = [
  ['Basmati Rice 1kg', 'Groceries', 'India Gate', 120, 110, 50, 'kg', 'GRC001', 'Premium aged basmati', '', 'rice,staple', 'true'],
  ['Sunflower Oil 1L', 'Groceries', 'Fortune', 160, 150, 30, 'liter', 'GRC002', 'Refined sunflower oil', '', 'oil,cooking', 'true'],
  ['Toor Dal 500g', 'Groceries', 'Tata Sampann', 90, '', 40, 'packet', 'GRC003', '', '', 'dal,pulses', 'true'],
  ['Colgate Toothpaste', 'Personal Care', 'Colgate', 80, 72, 25, 'piece', 'PC001', 'Cavity protection', '', 'oral,hygiene', 'true'],
  ['Dove Soap 100g', 'Personal Care', 'Dove', 55, '', 60, 'piece', 'PC002', '', '', 'soap,bath', 'true'],
  ['Maggi Noodles 70g', 'Snacks', 'Nestle', 14, '', 100, 'packet', 'SNK001', 'Instant noodles', '', 'noodles,instant', 'true'],
  ['Amul Butter 100g', 'Dairy', 'Amul', 55, '', 15, 'piece', 'DRY001', 'Pasteurized butter', '', 'butter,dairy', 'true'],
  ['Surf Excel 1kg', 'Household', 'HUL', 140, '', 8, 'kg', 'HH001', 'Washing powder', '', 'detergent,washing', 'true'],
  ['Example Product', 'Category', 'Brand', 99, 89, 100, 'piece', 'SKU001', 'Product description', 'https://example.com/img.jpg', 'tag1,tag2', 'true'],
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

// Add column widths
ws['!cols'] = [
  { wch: 25 }, // productName
  { wch: 18 }, // category
  { wch: 15 }, // brand
  { wch: 10 }, // price
  { wch: 14 }, // discountPrice
  { wch: 10 }, // quantity
  { wch: 10 }, // unit
  { wch: 12 }, // sku
  { wch: 30 }, // description
  { wch: 35 }, // imageUrl
  { wch: 20 }, // tags
  { wch: 12 }, // availability
];

XLSX.utils.book_append_sheet(wb, ws, 'Products');

const outputPath = path.join(process.cwd(), 'product-template.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`✅ Template written to: ${outputPath}`);
