'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    // Simulate form submission — replace with your email service
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <nav className="bg-white border-b border-amber-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-warm-900">ApaniDukaan</span>
          </Link>
          <Link href="/" className="text-amber-600 text-sm font-medium hover:text-amber-700">← Home</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-warm-900 mb-3">Contact Us</h1>
          <p className="text-warm-400">We're here to help. Reach out anytime.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Contact Info Cards */}
          <div className="space-y-4">
            {[
              {
                icon: Mail,
                title: 'Email Support',
                desc:  'For general enquiries and support',
                value: 'support@apanidukaan.live',
                href:  'mailto:support@apanidukaan.live',
                color: 'bg-amber-100 text-amber-600'
              },
              {
                icon: Mail,
                title: 'Business & Partnerships',
                desc:  'For business collaborations',
                value: 'business@apanidukaan.live',
                href:  'mailto:business@apanidukaan.live',
                color: 'bg-orange-100 text-orange-600'
              },
              {
                icon: Mail,
                title: 'Legal & Privacy',
                desc:  'For privacy or legal concerns',
                value: 'legal@apanidukaan.live',
                href:  'mailto:legal@apanidukaan.live',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Clock,
                title: 'Response Time',
                desc:  'We typically respond within',
                value: '24–48 business hours',
                color: 'bg-emerald-100 text-emerald-600'
              }
            ].map(item => (
              <div key={item.title} className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className="font-bold text-warm-800 text-sm">{item.title}</p>
                  <p className="text-warm-400 text-xs mb-1">{item.desc}</p>
                  {item.href ? (
                    <a href={item.href} className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-warm-700 text-sm font-medium">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* FAQ Quick Links */}
            <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={16} className="text-amber-500" />
                <p className="font-bold text-warm-800 text-sm">Quick Help</p>
              </div>
              <div className="space-y-2">
                {[
                  { q: 'How do I create a shop?',         href: '/auth/onboard' },
                  { q: 'How does UPI payment work?',      href: '/refunds' },
                  { q: 'How to import products via Excel?', href: '/dashboard/products' },
                  { q: 'Refund & cancellation policy',    href: '/refunds' },
                ].map(item => (
                  <Link key={item.q} href={item.href}
                    className="block text-sm text-amber-600 hover:text-amber-700 hover:underline">
                    → {item.q}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-warm-900 mb-2">Message Sent!</h2>
                <p className="text-warm-400 text-sm">
                  Thank you for reaching out. We'll get back to you within 24–48 hours.
                </p>
                <button onClick={() => { setSubmitted(false); setForm({ name:'', email:'', subject:'', message:'' }); }}
                  className="mt-5 text-amber-600 text-sm font-medium hover:text-amber-700">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-bold text-warm-800 mb-5">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-warm-600 mb-1.5 block">Your Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Rahul Sharma"
                      className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm text-warm-800 placeholder-warm-300 focus:outline-none focus:border-amber-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-warm-600 mb-1.5 block">Email Address *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="rahul@example.com"
                      className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm text-warm-800 placeholder-warm-300 focus:outline-none focus:border-amber-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-warm-600 mb-1.5 block">Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm text-warm-700 focus:outline-none focus:border-amber-400 transition-all">
                      <option value="">Select a topic</option>
                      <option value="general">General Enquiry</option>
                      <option value="shopkeeper">Shopkeeper Support</option>
                      <option value="payment">Payment Issue</option>
                      <option value="refund">Refund Request</option>
                      <option value="technical">Technical Problem</option>
                      <option value="business">Business / Partnership</option>
                      <option value="legal">Legal / Privacy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-warm-600 mb-1.5 block">Message *</label>
                    <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      rows={5} placeholder="Describe your issue or question in detail..."
                      className="w-full bg-amber-50 border-2 border-amber-100 rounded-xl px-4 py-2.5 text-sm text-warm-800 placeholder-warm-300 focus:outline-none focus:border-amber-400 transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={loading || !form.name || !form.email || !form.message}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-amber-200">
                    {loading ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>

      <footer className="border-t border-amber-100 bg-white py-8 mt-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-warm-400 text-sm">© 2025 ApaniDukaan. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-warm-400 hover:text-amber-600">Privacy Policy</Link>
            <Link href="/terms"   className="text-warm-400 hover:text-amber-600">Terms of Service</Link>
            <Link href="/refunds" className="text-warm-400 hover:text-amber-600">Refund Policy</Link>
            <Link href="/contact" className="text-warm-400 hover:text-amber-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
