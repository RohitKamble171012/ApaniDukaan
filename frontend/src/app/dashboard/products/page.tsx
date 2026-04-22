'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Upload, Download, Search, Edit2, Trash2, X, FileSpreadsheet, CheckCircle, XCircle, Package } from 'lucide-react';
import { productApi } from '@/lib/api';
import { formatCurrency, downloadBlob, UNITS } from '@/lib/utils';

interface Product {
  _id: string; productName: string; category: string; brand?: string;
  price: number; discountPrice?: number; quantity: number; unit: string;
  sku?: string; imageUrl?: string; availability: boolean; tags: string[];
}

const emptyForm = { productName: '', category: 'General', brand: '', price: '', discountPrice: '', quantity: '', unit: 'piece', sku: '', description: '', tags: '', availability: true };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | 'excel' | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  async function load(q = search) {
    setLoading(true);
    try {
      const { data } = await productApi.list({ search: q || undefined, limit: 100 });
      setProducts(data.products); setTotal(data.total);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault(); load(search);
  }

  function openAdd() { setForm(emptyForm); setSelected(null); setModal('add'); }
  function openEdit(p: Product) {
    setForm({ ...emptyForm, ...p, price: String(p.price), discountPrice: String(p.discountPrice || ''), quantity: String(p.quantity), tags: p.tags.join(', ') });
    setSelected(p); setModal('edit');
  }

  async function saveProduct() {
    if (!form.productName || !form.price || !form.quantity) { toast.error('Name, price and quantity are required'); return; }
    try {
      const payload = { ...form, price: Number(form.price), discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined, quantity: Number(form.quantity), tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      if (modal === 'edit' && selected) {
        await productApi.update(selected._id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product added');
      }
      setModal(null); load();
    } catch (err: any) { toast.error(err.message); }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return;
    try { await productApi.delete(id); toast.success('Deleted'); load(); }
    catch (err: any) { toast.error(err.message); }
  }

  async function handleExcelPreview(file: File) {
    setExcelFile(file);
    try {
      const { data } = await productApi.excelPreview(file);
      setExcelPreview(data);
    } catch (err: any) { toast.error(err.message); setExcelFile(null); }
  }

  async function confirmImport() {
    if (!excelFile) return;
    setImporting(true);
    try {
      const { data } = await productApi.excelImport(excelFile);
      toast.success(`Imported! ${data.created} added, ${data.updated} updated`);
      setModal(null); setExcelPreview(null); setExcelFile(null); load();
    } catch (err: any) { toast.error(err.message); }
    finally { setImporting(false); }
  }

  async function handleExport() {
    try {
      const { data } = await productApi.exportExcel();
      downloadBlob(data, 'products.xlsx');
    } catch (err: any) { toast.error(err.message); }
  }

  async function handleTemplate() {
    try {
      const { data } = await productApi.downloadTemplate();
      downloadBlob(data, 'product-template.xlsx');
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Products</h1>
          <p className="text-amber-600 text-sm">{total} products in inventory</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleTemplate} className="flex items-center gap-1.5 border border-amber-200 hover:border-amber-300 text-amber-700 px-3 py-2 rounded-lg text-xs transition-colors">
            <FileSpreadsheet size={14} /> Template
          </button>
          <button onClick={() => setModal('excel')} className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 rounded-lg text-xs transition-colors">
            <Upload size={14} /> Import Excel
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 border border-amber-200 hover:border-amber-300 text-amber-700 px-3 py-2 rounded-lg text-xs transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-white px-3 py-2 rounded-lg text-xs transition-colors">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full bg-amber-50 border border-amber-200 rounded-lg pl-9 pr-4 py-2.5 text-stone-800 text-sm placeholder-amber-300 focus:outline-none focus:border-amber-400" />
        </div>
        <button type="submit" className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-sm transition-colors">Search</button>
      </form>

      {/* Products Table */}
      <div className="bg-white border border-amber-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50/50 border-b border-amber-200">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-amber-600 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-amber-100/50 rounded shimmer" /></td></tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Package size={40} className="mx-auto text-amber-200 mb-3" />
                  <p className="text-amber-500">No products yet. Add one or import from Excel.</p>
                </td></tr>
              ) : products.map(p => (
                <tr key={p._id} className="hover:bg-amber-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.productName} className="w-8 h-8 rounded-lg object-cover bg-amber-100" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-500 text-xs">
                          {p.productName[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-stone-800 font-medium">{p.productName}</p>
                        {p.sku && <p className="text-amber-500 text-xs">SKU: {p.sku}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-amber-600">{p.category}</td>
                  <td className="px-4 py-3">
                    {p.discountPrice ? (
                      <div>
                        <span className="text-stone-800 font-medium">{formatCurrency(p.discountPrice)}</span>
                        <span className="text-amber-400 line-through ml-1 text-xs">{formatCurrency(p.price)}</span>
                      </div>
                    ) : (
                      <span className="text-stone-800">{formatCurrency(p.price)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${p.quantity <= 5 ? 'text-red-500' : p.quantity <= 15 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {p.quantity} {p.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.availability ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-400'}`}>
                      {p.availability ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-amber-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteProduct(p._id)} className="p-1.5 text-amber-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(modal === 'add' || modal === 'edit') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-amber-100 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100">
                <h2 className="font-semibold text-stone-800">{modal === 'edit' ? 'Edit Product' : 'Add Product'}</h2>
                <button onClick={() => setModal(null)} className="text-amber-400 hover:text-stone-800"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-amber-600 mb-1 block">Product Name *</label>
                    <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-amber-600 mb-1 block">Category</label>
                    <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-amber-600 mb-1 block">Brand</label>
                    <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-amber-600 mb-1 block">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-amber-600 mb-1 block">Discount Price (₹)</label>
                    <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-amber-600 mb-1 block">Quantity *</label>
                    <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div>
                    <label className="text-xs text-amber-600 mb-1 block">Unit</label>
                    <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400">
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-amber-600 mb-1 block">SKU</label>
                    <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-amber-600 mb-1 block">Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="rice, staple, organic"
                      className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-amber-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.checked }))} className="accent-amber-500" />
                      <span className="text-sm text-amber-700">Available for customers</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setModal(null)} className="flex-1 border border-amber-200 text-amber-700 py-2.5 rounded-lg text-sm hover:bg-amber-50 transition-colors">Cancel</button>
                  <button onClick={saveProduct} className="flex-1 bg-amber-500 hover:bg-amber-400 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                    {modal === 'edit' ? 'Update' : 'Add Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Excel Import Modal */}
      <AnimatePresence>
        {modal === 'excel' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-amber-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100">
                <h2 className="font-semibold text-stone-800">Import Products from Excel</h2>
                <button onClick={() => { setModal(null); setExcelPreview(null); setExcelFile(null); }} className="text-amber-400 hover:text-stone-800"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-5">
                {!excelPreview ? (
                  <div>
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-xl p-10 text-center cursor-pointer transition-colors bg-amber-50/30">
                      <FileSpreadsheet size={40} className="mx-auto text-amber-400 mb-3" />
                      <p className="text-stone-800 font-medium">Drop Excel file or click to upload</p>
                      <p className="text-amber-500 text-sm mt-1">.xlsx, .xls, .csv supported</p>
                    </div>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                      onChange={e => e.target.files?.[0] && handleExcelPreview(e.target.files[0])} />
                    <div className="mt-4 flex gap-2">
                      <button onClick={handleTemplate} className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-500">
                        <Download size={13} /> Download template
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-emerald-700 text-sm">{excelPreview.totalValid} valid</span>
                      </div>
                      {excelPreview.totalErrors > 0 && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          <XCircle size={14} className="text-red-500" />
                          <span className="text-red-600 text-sm">{excelPreview.totalErrors} errors</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-amber-600 text-xs mb-2">Preview (first 10 rows)</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-amber-50 border-b border-amber-200">
                            <tr>{['Name', 'Category', 'Price', 'Qty', 'Unit'].map(h => (
                              <th key={h} className="text-left px-3 py-2 text-amber-600 font-medium">{h}</th>
                            ))}</tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100">
                            {excelPreview.preview.map((row: any, i: number) => (
                              <tr key={i}>
                                <td className="px-3 py-2 text-stone-800">{row.productName}</td>
                                <td className="px-3 py-2 text-amber-600">{row.category}</td>
                                <td className="px-3 py-2 text-emerald-600">₹{row.price}</td>
                                <td className="px-3 py-2 text-amber-700">{row.quantity}</td>
                                <td className="px-3 py-2 text-amber-600">{row.unit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {excelPreview.errors?.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-500 text-xs font-medium mb-1">Rows with errors:</p>
                        {excelPreview.errors.slice(0, 3).map((e: any, i: number) => (
                          <p key={i} className="text-red-500 text-xs">Row {e.row}: {e.error}</p>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={() => { setExcelPreview(null); setExcelFile(null); }}
                        className="flex-1 border border-amber-200 text-amber-700 py-2.5 rounded-lg text-sm hover:bg-amber-50 transition-colors">
                        Choose Different File
                      </button>
                      <button onClick={confirmImport} disabled={importing || excelPreview.totalValid === 0}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                        {importing ? 'Importing...' : `Import ${excelPreview.totalValid} Products`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}