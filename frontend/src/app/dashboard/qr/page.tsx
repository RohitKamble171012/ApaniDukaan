'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { Download, Copy, RefreshCw, ExternalLink, QrCode } from 'lucide-react';
import { qrApi } from '@/lib/api';
import { useAuthStore } from '@/store';

export default function QRPage() {
  const { shop } = useAuthStore();
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await qrApi.get();
      setQrData(data);
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  }

  async function regenerate() {
    setRegenerating(true);
    try {
      const { data } = await import('@/lib/api').then(m => m.shopApi.regenerateQR());
      setQrData((prev: any) => ({ ...prev, shopUrl: data.shopUrl, dataUrl: data.dataUrl }));
      toast.success('QR regenerated');
    } catch (err: any) { toast.error(err.message); }
    finally { setRegenerating(false); }
  }

  function copyLink() {
    navigator.clipboard.writeText(qrData?.shopUrl || '');
    toast.success('Link copied!');
  }

  function downloadQR() {
    const canvas = document.querySelector('#qr-container canvas') as HTMLCanvasElement;
    const svg = document.querySelector('#qr-container svg') as SVGElement;

    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${shop?.shopSlug || 'shop'}-qr.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('QR downloaded');
    }
  }

  if (loading) return <div className="h-64 bg-amber-50 rounded-xl shimmer" />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-800">QR Code</h1>
        <p className="text-amber-600 text-sm">Share your QR code with customers for quick access to your shop</p>
      </div>

      <div className="bg-white border border-amber-100 rounded-2xl p-8 flex flex-col items-center gap-6">
        {/* QR Code */}
        <div id="qr-container" className="bg-white p-5 rounded-2xl shadow-md border border-amber-100">
          <QRCodeSVG
            value={qrData?.shopUrl || `${window.location.origin}/shop/${shop?.shopSlug}`}
            size={220}
            level="H"
            includeMargin
          />
        </div>

        <div className="text-center">
          <p className="text-stone-800 font-semibold text-lg">{shop?.shopName}</p>
          <p className="text-amber-600 text-sm mt-1">{qrData?.shopUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={downloadQR} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Download size={16} /> Download QR
          </button>
          <button onClick={copyLink} className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-stone-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Copy size={16} /> Copy Link
          </button>
          <a href={qrData?.shopUrl} target="_blank" className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-stone-800 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <ExternalLink size={16} /> Open Store
          </a>
          <button onClick={regenerate} disabled={regenerating} className="flex items-center gap-2 border border-amber-200 hover:border-amber-300 text-amber-700 px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} /> Regenerate
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-5">
        <h2 className="font-semibold text-stone-800 text-sm mb-3">How to use</h2>
        <div className="space-y-2 text-sm text-amber-600">
          <p>1. <strong className="text-amber-700">Print and display</strong> the QR code at your shop counter, entrance, or billing area.</p>
          <p>2. Customers <strong className="text-amber-700">scan the QR</strong> with their phone camera to instantly open your shop page.</p>
          <p>3. They can browse products, add to cart, and <strong className="text-amber-700">place an order directly</strong> — no app download needed.</p>
          <p>4. You'll <strong className="text-amber-700">see new orders</strong> in real-time on your Orders dashboard.</p>
        </div>
      </div>

      {/* Share options */}
      <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-5">
        <h2 className="font-semibold text-stone-800 text-sm mb-3">Share your shop link</h2>
        <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2">
          <span className="text-stone-800 text-sm flex-1 truncate">{qrData?.shopUrl}</span>
          <button onClick={copyLink} className="text-amber-600 hover:text-amber-500 transition-colors">
            <Copy size={15} />
          </button>
        </div>
        <p className="text-amber-500 text-xs mt-2">Share this link on WhatsApp, Instagram, or wherever your customers are.</p>
      </div>
    </div>
  );
}
