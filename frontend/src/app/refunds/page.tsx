'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function RefundPolicyPage() {
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
        <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-8 md:p-12">

          <h1 className="text-3xl font-extrabold text-warm-900 mb-2">Refund & Cancellation Policy</h1>
          <p className="text-warm-400 text-sm mb-8">Last updated: January 1, 2025</p>

          <div className="space-y-8 text-warm-700 text-sm leading-relaxed">

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <p className="font-bold text-warm-800 mb-1">Important Note</p>
              <p className="text-warm-600">
                ApaniDukaan is a platform connecting local shopkeepers with customers.
                Refunds and cancellations are primarily handled between the customer and
                the respective shopkeeper. This policy describes our platform-level guidelines.
              </p>
            </div>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">1. Order Cancellations</h2>

              <h3 className="font-bold text-warm-800 mb-2">By Customer</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Before confirmation:</strong> Orders can be cancelled any time before
                  the shopkeeper confirms. Contact the shopkeeper directly using the phone number
                  on the shop page.
                </li>
                <li>
                  <strong>After confirmation:</strong> Cancellations depend on the individual
                  shopkeeper's policy. Some shopkeepers may charge a cancellation fee if
                  the order is already being prepared.
                </li>
                <li>
                  <strong>Cash orders:</strong> No payment has been made, so no refund is needed.
                  Simply inform the shopkeeper.
                </li>
              </ul>

              <h3 className="font-bold text-warm-800 mb-2 mt-4">By Shopkeeper</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  If a shopkeeper cancels an order (out of stock, unable to fulfill),
                  and payment was made online, a full refund will be initiated within
                  5-7 business days to the original payment method.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">2. Refunds for Online Payments</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="border border-amber-200 px-4 py-3 text-left font-bold text-warm-800">Scenario</th>
                      <th className="border border-amber-200 px-4 py-3 text-left font-bold text-warm-800">Refund</th>
                      <th className="border border-amber-200 px-4 py-3 text-left font-bold text-warm-800">Timeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Order cancelled before confirmation', 'Full refund', '5-7 business days'],
                      ['Shopkeeper cancels order', 'Full refund', '5-7 business days'],
                      ['Wrong item delivered', 'Full refund or replacement', '3-5 business days after verification'],
                      ['Item missing from order', 'Partial refund for missing items', '3-5 business days'],
                      ['Payment deducted but order not placed', 'Full refund', '5-7 business days'],
                      ['Customer changes mind (after delivery)', 'At shopkeeper\'s discretion', 'Varies'],
                    ].map(([scenario, refund, timeline], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                        <td className="border border-amber-100 px-4 py-3 text-warm-700">{scenario}</td>
                        <td className="border border-amber-100 px-4 py-3 text-warm-700">{refund}</td>
                        <td className="border border-amber-100 px-4 py-3 text-warm-500">{timeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">3. UPI Payment Refunds</h2>
              <p>
                For UPI payments made directly to the shopkeeper's UPI ID, refunds are processed
                by the shopkeeper directly back to your UPI ID. ApaniDukaan does not hold UPI
                funds and cannot process these refunds on behalf of shopkeepers.
              </p>
              <p className="mt-2">
                Please contact the shopkeeper directly using the phone number displayed on the
                shop page for UPI refund requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">4. How to Request a Refund</h2>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Contact the Shopkeeper', desc: 'First, reach out to the shopkeeper directly using the phone number on their shop page. Most issues are resolved at this level.' },
                  { step: '2', title: 'Provide Order Details', desc: 'Share your Order Number (from confirmation screen or SMS), the issue, and any supporting photos if relevant.' },
                  { step: '3', title: 'Contact ApaniDukaan Support', desc: 'If the shopkeeper does not respond within 48 hours or refuses a valid refund, email us at support@apanidukaan.live with your order details.' },
                  { step: '4', title: 'Razorpay Dispute', desc: 'For card payments, you may also raise a dispute with Razorpay or your bank as a last resort.' },
                ].map(item => (
                  <div key={item.step} className="flex gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-bold text-warm-800 mb-0.5">{item.title}</p>
                      <p className="text-warm-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">5. Non-Refundable Situations</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Orders that have been delivered and accepted by the customer</li>
                <li>Perishable items (fresh fruits, vegetables, dairy) once delivered</li>
                <li>Items where the customer simply changed their mind after delivery</li>
                <li>Orders where incorrect address or phone number was provided by the customer</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">6. Platform Fee</h2>
              <p>
                Currently, ApaniDukaan does not charge shopkeepers or customers any platform fee.
                This policy will be updated with prior notice if this changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">7. Contact for Refunds</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="space-y-2 text-warm-600">
                  <p>📧 Email: <a href="mailto:support@apanidukaan.live" className="text-amber-600 hover:text-amber-700">support@apanidukaan.live</a></p>
                  <p>⏰ Response time: Within 24-48 hours on business days</p>
                  <p>📋 Include: Order number, issue description, and contact details</p>
                </div>
              </div>
            </section>

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
