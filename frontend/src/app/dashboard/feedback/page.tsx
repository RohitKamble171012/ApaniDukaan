'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Trash2, Star, MessageSquare, ShoppingBag } from 'lucide-react';
import { feedbackApi } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  async function load(type = filter) {
    setLoading(true);
    try {
      const { data } = await feedbackApi.list({ type: type || undefined, limit: 50 });
      setFeedbacks(data.feedbacks); setTotal(data.total);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function markReviewed(id: string) {
    try {
      await feedbackApi.review(id);
      toast.success('Marked as reviewed');
      load(filter);
    } catch (err: any) { toast.error(err.message); }
  }

  async function deleteFeedback(id: string) {
    if (!confirm('Delete this feedback?')) return;
    try {
      await feedbackApi.delete(id);
      toast.success('Deleted');
      load(filter);
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Feedback & Requests</h1>
          <p className="text-amber-600 text-sm">{total} total entries</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[{ value: '', label: 'All' }, { value: 'feedback', label: 'Feedback' }, { value: 'item_request', label: 'Item Requests' }].map(tab => (
          <button key={tab.value} onClick={() => { setFilter(tab.value); load(tab.value); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === tab.value ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-amber-50 rounded-xl shimmer" />)
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={40} className="mx-auto text-amber-200 mb-3" />
            <p className="text-amber-500">No feedback yet</p>
          </div>
        ) : feedbacks.map(fb => (
          <div key={fb._id} className={`bg-white border rounded-xl p-5 ${fb.status === 'new' ? 'border-amber-300' : 'border-amber-100'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fb.type === 'item_request' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                    {fb.type === 'item_request' ? '📦 Item Request' : '💬 Feedback'}
                  </span>
                  {fb.status === 'new' && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">New</span>}
                  {fb.status === 'reviewed' && <span className="text-xs bg-amber-50 text-amber-400 px-2 py-0.5 rounded-full">Reviewed</span>}
                  {fb.rating && (
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < fb.rating ? 'text-amber-400 fill-amber-400' : 'text-amber-200'} />
                      ))}
                    </div>
                  )}
                </div>

                {(fb.customerName || fb.customerPhone) && (
                  <p className="text-amber-700 text-sm font-medium">
                    {fb.customerName}{fb.customerPhone && ` · ${fb.customerPhone}`}
                  </p>
                )}

                {fb.message && <p className="text-amber-600 text-sm mt-1">{fb.message}</p>}

                {fb.requestedItems?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {fb.requestedItems.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <ShoppingBag size={12} className="text-amber-400 flex-shrink-0" />
                        <span className="text-amber-700 text-sm">{item.name}{item.quantity && ` · ${item.quantity}`}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-amber-300 text-xs mt-2">{formatDateTime(fb.createdAt)}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {fb.status === 'new' && (
                  <button onClick={() => markReviewed(fb._id)} title="Mark reviewed"
                    className="p-2 text-amber-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Check size={15} />
                  </button>
                )}
                <button onClick={() => deleteFeedback(fb._id)} title="Delete"
                  className="p-2 text-amber-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}