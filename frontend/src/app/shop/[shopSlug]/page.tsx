'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search, ShoppingCart, Mic, MicOff, X, Plus, Minus,
  MapPin, Phone, Clock, Star,Check, Info, MessageSquare, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { shopApi, productApi, feedbackApi } from '@/lib/api';
import { useCartStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { parseVoiceInput, matchProductsFromText } from '@/utils/voiceParser';



export default function ShopPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.shopSlug as string;

  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceMatches, setVoiceMatches] = useState<any>(null);

  const { items, addItem, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [shopRes, productsRes] = await Promise.all([
          shopApi.getPublic(slug),
          productApi.listPublic(slug)
        ]);
        setShop(shopRes.data.shop);
        setProducts(productsRes.data.products);
        setCategories(productsRes.data.categories || []);
      } catch {
        toast.error('Shop not found');
      } finally { setLoading(false); }
    }
    load();
  }, [slug]);

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = !activeCategory || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  function addToCart(product: any, qty = 1) {
    addItem({ productId: product._id, productName: product.productName, price: product.price, discountPrice: product.discountPrice, quantity: qty, unit: product.unit, imageUrl: product.imageUrl });
    toast.success(`${product.productName} added to cart`);
  }

  function getCartQty(productId: string) {
    return items.find(i => i.productId === productId)?.quantity || 0;
  }

  // Voice input
  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Voice input not supported in this browser'); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setVoiceText(text);
      const matches = matchProductsFromText(text, products);
      setVoiceMatches(matches);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
    setListening(true);
    setVoiceOpen(true);
  }

  function addVoiceMatches() {
    if (!voiceMatches) return;
    for (const match of voiceMatches.matched) {
      addItem({ productId: match.product._id, productName: match.product.productName, price: match.product.price, discountPrice: match.product.discountPrice, quantity: match.quantity, unit: match.product.unit, imageUrl: match.product.imageUrl });
    }
    toast.success(`Added ${voiceMatches.matched.length} items to cart`);
    setVoiceOpen(false);
    setVoiceMatches(null);
    setVoiceText('');
  }

  function processTextInput() {
    if (!voiceText.trim()) return;
    const matches = matchProductsFromText(voiceText, products);
    setVoiceMatches(matches);
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!shop) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Shop not found or unavailable</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner */}
      {shop.bannerUrl && (
        <div className="h-40 sm:h-56 w-full overflow-hidden">
          <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${shop.bannerUrl}`} alt="Banner" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Shop Header */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-start gap-4">
            {shop.logoUrl ? (
              <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${shop.logoUrl}`} alt={shop.shopName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700 flex-shrink-0">
                {shop.shopName[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{shop.shopName}</h1>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{shop.shopType}</span>
              </div>
              {shop.tagline && <p className="text-slate-500 text-sm mt-0.5">{shop.tagline}</p>}
              {shop.address && (
                <div className="flex items-center gap-1 text-slate-400 text-xs mt-1.5">
                  <MapPin size={11} />
                  {shop.address.city}, {shop.address.state}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Search + Cart Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
              className="w-full bg-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-200" />
          </div>
          <button onClick={startListening}
            className={`p-2.5 rounded-xl transition-colors ${listening ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'}`}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button onClick={() => setCartOpen(true)} className="relative p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors">
            <ShoppingCart size={18} />
            {itemCount() > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {itemCount()}
              </span>
            )}
          </button>
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveCategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${!activeCategory ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${activeCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">No products found</p>
            {search && <button onClick={() => setSearch('')} className="text-indigo-600 text-sm mt-2">Clear search</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(product => {
              const qty = getCartQty(product._id);
              return (
                <motion.div key={product._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-32 bg-slate-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL}${product.imageUrl}`}
                        alt={product.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🛒
                      </div>
                    )}
                    {product.discountPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-slate-800 font-medium text-sm line-clamp-2 leading-tight">{product.productName}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{product.unit}</p>

                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-slate-900 font-bold text-sm">
                          {formatCurrency(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-slate-400 text-xs line-through ml-1">{formatCurrency(product.price)}</span>
                        )}
                      </div>
                    </div>

                    {qty > 0 ? (
                      <div className="flex items-center justify-between mt-2 bg-indigo-50 rounded-xl px-1 py-0.5">
                        <button onClick={() => updateQuantity(product._id, qty - 1)} className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 rounded-lg">
                          <Minus size={14} />
                        </button>
                        <span className="text-indigo-700 font-semibold text-sm">{qty}</span>
                        <button onClick={() => updateQuantity(product._id, qty + 1)} className="w-7 h-7 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 rounded-lg">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)}
                        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-xl text-xs font-medium transition-colors">
                        Add to Cart
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <Link href={`/shop/${slug}/checkout`} className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-indigo-600" />
              <span className="text-slate-700 text-sm font-medium">View Cart</span>
            </div>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{itemCount()}</span>
          </Link>
          <Link href={`/shop/${slug}#feedback`} className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-indigo-600" />
              <span className="text-slate-700 text-sm font-medium">Feedback</span>
            </div>
            <ChevronRight size={15} className="text-slate-400" />
          </Link>
        </div>

        {/* Feedback Section */}
        <FeedbackSection shopSlug={slug} />
      </div>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} shopSlug={slug} shop={shop} />

      {/* Voice Modal */}
      <AnimatePresence>
        {voiceOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="bg-white rounded-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900">Voice Shopping</h2>
                <button onClick={() => { setVoiceOpen(false); setVoiceMatches(null); setVoiceText(''); }}><X size={20} className="text-slate-400" /></button>
              </div>

              <p className="text-slate-500 text-sm mb-4">Say or type your shopping list, e.g. "2 kg rice, 1 oil, 3 soaps"</p>

              <div className="flex gap-2 mb-4">
                <input value={voiceText} onChange={e => setVoiceText(e.target.value)} placeholder="Type your list..."
                  className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                <button onClick={processTextInput} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium">Parse</button>
              </div>

              {listening && (
                <div className="flex items-center gap-2 text-red-500 text-sm mb-4">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Listening...
                </div>
              )}

              {voiceMatches && (
                <div className="space-y-3">
                  {voiceMatches.matched.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-emerald-600 mb-2">✓ Matched ({voiceMatches.matched.length})</p>
                      {voiceMatches.matched.map((m: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-700 text-sm">{m.product.productName}</span>
                          <span className="text-slate-500 text-xs">× {m.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {voiceMatches.unmatched.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-600 mb-2">✗ Not found ({voiceMatches.unmatched.length})</p>
                      {voiceMatches.unmatched.map((item: string, i: number) => (
                        <p key={i} className="text-slate-500 text-sm py-1 border-b border-slate-100">{item}</p>
                      ))}
                    </div>
                  )}
                  {voiceMatches.matched.length > 0 && (
                    <button onClick={addVoiceMatches}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-medium mt-2">
                      Add {voiceMatches.matched.length} items to Cart
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Cart Drawer ---
function CartDrawer({ open, onClose, shopSlug, shop }: any) {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-bold text-slate-900">Cart ({items.length})</h2>
              <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Your cart is empty</p>
                </div>
              ) : items.map(item => (
                <div key={item.productId} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-sm font-medium truncate">{item.productName}</p>
                    <p className="text-slate-500 text-xs">{formatCurrency(item.discountPrice || item.price)} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-100">
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-100">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeItem(item.productId)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg ml-1">
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">{formatCurrency(subtotal())}</span>
                </div>
                <button onClick={() => { onClose(); router.push(`/shop/${shopSlug}/checkout`); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors">
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- Feedback Section ---
function FeedbackSection({ shopSlug }: { shopSlug: string }) {
  const [tab, setTab]           = useState<'request' | 'feedback'>('request');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // Item request state
  const [itemName, setItemName]   = useState('');
  const [itemQty, setItemQty]     = useState('');
  const [itemNote, setItemNote]   = useState('');
  const [itemList, setItemList]   = useState<Array<{name:string;qty:string}>>([]);

  // Feedback state
  const [fbName, setFbName]     = useState('');
  const [fbPhone, setFbPhone]   = useState('');
  const [fbMsg, setFbMsg]       = useState('');
  const [fbRating, setFbRating] = useState(0);

  function addItem() {
    if (!itemName.trim()) return;
    setItemList(l => [...l, { name: itemName.trim(), qty: itemQty.trim() }]);
    setItemName(''); setItemQty('');
  }

  async function submitRequest() {
    if (itemList.length === 0 && !itemName.trim()) {
      toast.error('Add at least one item'); return;
    }
    const finalList = [...itemList];
    if (itemName.trim()) finalList.push({ name: itemName.trim(), qty: itemQty.trim() });
    setSubmitting(true);
    try {
      await feedbackApi.submit(shopSlug, {
        type: 'item_request',
        requestedItems: finalList.map(i => ({ name: i.name, quantity: i.qty, note: itemNote })),
        message: itemNote
      });
      setSubmitted(true);
      toast.success('Request sent to shop owner!');
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  }

  async function submitFeedback() {
    if (!fbMsg.trim()) { toast.error('Please write something'); return; }
    setSubmitting(true);
    try {
      await feedbackApi.submit(shopSlug, {
        customerName: fbName, customerPhone: fbPhone,
        type: 'feedback', message: fbMsg,
        rating: fbRating || undefined
      });
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (err: any) { toast.error(err.message); }
    finally { setSubmitting(false); }
  }

  if (submitted) return (
    <div id="feedback" className="mt-6 bg-white border border-green-100 rounded-3xl p-8 text-center shadow-sm">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <Check size={28} className="text-green-600" />
      </div>
      <p className="font-bold text-slate-900 text-lg">
        {tab === 'request' ? 'Request sent!' : 'Feedback submitted!'}
      </p>
      <p className="text-slate-400 text-sm mt-1">The shop owner has been notified.</p>
      <button onClick={() => { setSubmitted(false); setItemList([]); setItemName(''); setFbMsg(''); }}
        className="mt-4 text-indigo-600 text-sm font-medium hover:text-indigo-700">
        Submit another
      </button>
    </div>
  );

  return (
    <div id="feedback" className="mt-6 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">

      {/* Tab Header */}
      <div className="grid grid-cols-2 border-b border-slate-200">
        <button onClick={() => setTab('request')}
          className={`py-4 text-sm font-bold transition-all ${tab === 'request' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
          📦 Request an Item
        </button>
        <button onClick={() => setTab('feedback')}
          className={`py-4 text-sm font-bold transition-all ${tab === 'feedback' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
          ⭐ Leave Feedback
        </button>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">

          {/* ITEM REQUEST TAB */}
          {tab === 'request' && (
            <motion.div key="req" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <p className="text-slate-500 text-sm">
                Can't find what you need? Let the shop owner know — they'll try to stock it!
              </p>

              {/* Added items list */}
              {itemList.length > 0 && (
                <div className="space-y-2">
                  {itemList.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                      <span className="text-slate-800 text-sm font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                        {item.qty && <span className="text-slate-400 text-xs">× {item.qty}</span>}
                        <button onClick={() => setItemList(l => l.filter((_, j) => j !== i))}
                          className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add item input */}
              <div className="flex gap-2">
                <input value={itemName} onChange={e => setItemName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())}
                  placeholder="Item name (e.g. Amul Butter)"
                  className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 transition-all" />
                <input value={itemQty} onChange={e => setItemQty(e.target.value)}
                  placeholder="Qty"
                  className="w-20 bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 transition-all" />
                <button onClick={addItem}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  + Add
                </button>
              </div>

              <textarea value={itemNote} onChange={e => setItemNote(e.target.value)}
                rows={2} placeholder="Any additional notes... (optional)"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 transition-all resize-none" />

              <button onClick={submitRequest} disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-sm transition-all disabled:opacity-60">
                {submitting ? 'Sending...' : `Send Request${itemList.length > 0 ? ` (${itemList.length + (itemName ? 1 : 0)} items)` : ''}`}
              </button>
            </motion.div>
          )}

          {/* FEEDBACK TAB */}
          {tab === 'feedback' && (
            <motion.div key="fb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input value={fbName} onChange={e => setFbName(e.target.value)} placeholder="Your name"
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 transition-all" />
                <input value={fbPhone} onChange={e => setFbPhone(e.target.value)} placeholder="Phone (optional)"
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 transition-all" />
              </div>

              <div className="flex gap-1">
                {[1,2,3,4,5].map(r => (
                  <button key={r} type="button" onClick={() => setFbRating(r)}>
                    <Star size={26} className={r <= fbRating ? 'text-indigo-400 fill-indigo-400' : 'text-slate-200'} />
                  </button>
                ))}
                {fbRating > 0 && <span className="text-slate-400 text-xs self-center ml-1">{['','Poor','Fair','Good','Great','Excellent'][fbRating]}</span>}
              </div>

              <textarea value={fbMsg} onChange={e => setFbMsg(e.target.value)} rows={3}
                placeholder="Share your experience or suggestions..."
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-indigo-400 transition-all resize-none" />

              <button onClick={submitFeedback} disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-sm transition-all disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}