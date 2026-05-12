'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function TermsPage() {
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

          <h1 className="text-3xl font-extrabold text-warm-900 mb-2">Terms of Service</h1>
          <p className="text-warm-400 text-sm mb-8">Last updated: January 1, 2025</p>

          <div className="space-y-8 text-warm-700 text-sm leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using ApaniDukaan ("Platform", "we", "us") at apanidukaan.live,
                you agree to be bound by these Terms of Service. If you do not agree, please do not
                use our platform. These terms apply to all users — shopkeepers and customers alike.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">2. Description of Service</h2>
              <p>ApaniDukaan provides:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>A digital storefront creation platform for local shopkeepers</li>
                <li>Inventory and product management tools</li>
                <li>Customer ordering system with QR code access</li>
                <li>Payment processing integration (Razorpay, UPI)</li>
                <li>Order management and analytics dashboard</li>
              </ul>
              <p className="mt-2">
                ApaniDukaan acts as a technology platform connecting shopkeepers and customers.
                We are not a party to any transaction between shopkeepers and customers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">3. Shopkeeper Accounts</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must be at least 18 years old to create a shopkeeper account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must provide accurate and truthful information about your shop</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You may not create multiple accounts for the same shop</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">4. Shopkeeper Responsibilities</h2>
              <p>As a shopkeeper on ApaniDukaan, you agree to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Only list products that you are legally permitted to sell</li>
                <li>Accurately represent product descriptions, prices, and availability</li>
                <li>Fulfill orders placed by customers in a timely manner</li>
                <li>Maintain adequate stock of listed products</li>
                <li>Handle customer complaints and refunds fairly and promptly</li>
                <li>Comply with all applicable Indian laws and regulations</li>
                <li>Not list prohibited items (drugs, weapons, counterfeit goods, etc.)</li>
                <li>Keep your shop information accurate and up-to-date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">5. Customer Orders</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Customers do not need to create an account to place orders</li>
                <li>By placing an order, customers agree to pay the stated price</li>
                <li>Orders are contracts between customers and shopkeepers — ApaniDukaan is not liable</li>
                <li>Customers must provide accurate delivery information</li>
                <li>Cancellations and refunds are subject to the shopkeeper's policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">6. Payments</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Payments are processed by Razorpay, subject to their terms and conditions</li>
                <li>ApaniDukaan does not store credit/debit card information</li>
                <li>For UPI payments, transactions occur directly between customer and shopkeeper</li>
                <li>ApaniDukaan is not responsible for payment disputes between parties</li>
                <li>In case of payment failures, contact Razorpay or your bank first</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">7. Prohibited Uses</h2>
              <p>You may not use ApaniDukaan to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Sell illegal, counterfeit, or prohibited products</li>
                <li>Engage in fraudulent transactions or misrepresentation</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to hack, reverse-engineer, or disrupt the platform</li>
                <li>Collect user data without authorization</li>
                <li>Create fake shops or fraudulent listings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">8. Intellectual Property</h2>
              <p>
                The ApaniDukaan platform, including its design, code, and content, is owned by us
                and protected by intellectual property laws. Shopkeepers retain ownership of their
                shop content (product photos, descriptions) but grant us a license to display it
                on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">9. Limitation of Liability</h2>
              <p>
                ApaniDukaan is provided "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Disputes between shopkeepers and customers</li>
                <li>Product quality, authenticity, or fitness for purpose</li>
                <li>Losses due to platform downtime or technical issues</li>
                <li>Third-party payment processor failures</li>
                <li>Any indirect, incidental, or consequential damages</li>
              </ul>
              <p className="mt-2">
                Our maximum liability shall not exceed the amount paid to us (if any) in the
                3 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">10. Termination</h2>
              <p>
                We may suspend or terminate your access to ApaniDukaan at any time for violations
                of these terms, without prior notice. Upon termination, your right to use the
                platform ceases immediately. You may also delete your account at any time by
                contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">11. Governing Law</h2>
              <p>
                These Terms are governed by the laws of India. Any disputes shall be subject to
                the exclusive jurisdiction of courts in India. If any provision of these terms
                is found unenforceable, the remaining provisions shall continue in full force.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">12. Contact</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="font-bold text-warm-800 mb-3">For terms-related queries:</p>
                <div className="space-y-1 text-warm-600">
                  <p>📧 <a href="mailto:legal@apanidukaan.live" className="text-amber-600 hover:text-amber-700">legal@apanidukaan.live</a></p>
                  <p>🌐 <a href="https://apanidukaan.live" className="text-amber-600 hover:text-amber-700">apanidukaan.live</a></p>
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
