import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function truncate(text: string, length: number): string {
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
};

export const SHOP_TYPES = [
  'Grocery Store', 'Electrical Shop', 'Stationery', 'General Store',
  'Medical/Pharmacy', 'Hardware Store', 'Cosmetics', 'Fruits & Vegetables',
  'Clothing & Apparel', 'Electronics', 'Bakery', 'Dairy', 'Toys',
  'Sports & Fitness', 'Books & Stationery', 'Other'
];

export const UNITS = ['piece', 'kg', 'gram', 'liter', 'ml', 'packet', 'box', 'dozen', 'pair', 'set', 'bottle', 'can', 'bag', 'roll'];
