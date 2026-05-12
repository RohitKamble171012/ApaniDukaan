'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Nav */}
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

          <h1 className="text-3xl font-extrabold text-warm-900 mb-2">Privacy Policy</h1>
          <p className="text-warm-400 text-sm mb-8">Last updated: {lastUpdated}</p>

          <div className="prose prose-warm max-w-none space-y-8 text-warm-700 text-sm leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">1. Introduction</h2>
              <p>
                Welcome to ApaniDukaan ("we", "our", or "us"). ApaniDukaan is a digital platform that
                enables local shopkeepers to create an online storefront and accept orders from customers.
                We are committed to protecting the privacy of both shopkeepers and customers who use our platform.
              </p>
              <p className="mt-2">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website <strong>apanidukaan.live</strong> or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">2. Information We Collect</h2>

              <h3 className="font-bold text-warm-800 mb-2">2.1 Information from Shopkeepers (Registered Users)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name, email address, and profile photo (via Google Sign-In or email registration)</li>
                <li>Shop name, type, address, and contact details</li>
                <li>UPI ID or payment details you provide for receiving payments</li>
                <li>Product inventory data uploaded by you</li>
                <li>Business-related information for your shop profile</li>
              </ul>

              <h3 className="font-bold text-warm-800 mb-2 mt-4">2.2 Information from Customers</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and mobile number provided at checkout (no account required)</li>
                <li>Order details including items, quantities, and delivery preferences</li>
                <li>Feedback and product requests submitted voluntarily</li>
                <li>Payment information processed securely through Razorpay (we do not store card details)</li>
              </ul>

              <h3 className="font-bold text-warm-800 mb-2 mt-4">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Browser type, device information, and IP address</li>
                <li>Pages visited and time spent on platform</li>
                <li>Referring URLs and click patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To create and manage your shopkeeper account and shop profile</li>
                <li>To process customer orders and send order confirmations</li>
                <li>To facilitate payments between customers and shopkeepers</li>
                <li>To generate QR codes and shop links for your storefront</li>
                <li>To provide analytics and business insights to shopkeepers</li>
                <li>To improve our platform and user experience</li>
                <li>To send important service-related communications</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">4. Sharing of Information</h2>
              <p>We do not sell, trade, or rent your personal information. We share information only in these cases:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Between shopkeeper and customer:</strong> Customer order details (name, phone, items)
                  are shared with the shopkeeper to fulfill the order.
                </li>
                <li>
                  <strong>Payment processors:</strong> Payment information is processed by Razorpay.
                  We share only what is necessary to complete the transaction. Razorpay's privacy policy
                  governs their use of your data.
                </li>
                <li>
                  <strong>Service providers:</strong> Firebase (authentication), MongoDB Atlas (database),
                  and Vercel/Render (hosting). These providers process data on our behalf under strict
                  confidentiality agreements.
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law, court order, or government authority.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>All data transmission uses HTTPS/TLS encryption</li>
                <li>Authentication is handled by Firebase (Google's infrastructure)</li>
                <li>Passwords are never stored in plain text</li>
                <li>Payment card data is handled entirely by Razorpay — we never see or store card numbers</li>
                <li>Database access is restricted and monitored</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">6. Cookies</h2>
              <p>
                We use minimal cookies required for platform functionality, including authentication
                tokens to keep you logged in. We do not use advertising cookies or track you across
                other websites.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">7. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
                <li><strong>Correction:</strong> Update incorrect or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at <strong>privacy@apanidukaan.live</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">8. Data Retention</h2>
              <p>
                We retain shopkeeper account data for as long as the account is active. Order data is
                retained for 3 years for business and legal compliance purposes. You may request earlier
                deletion by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">9. Children's Privacy</h2>
              <p>
                Our platform is not intended for children under 13. We do not knowingly collect
                personal information from children under 13. If you believe we have inadvertently
                collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify registered
                shopkeepers of significant changes via email. Continued use of the platform after
                changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-warm-900 mb-3">11. Contact Us</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <p className="font-bold text-warm-800 mb-3">For privacy-related queries:</p>
                <div className="space-y-1 text-warm-600">
                  <p>📧 Email: <a href="mailto:privacy@apanidukaan.live" className="text-amber-600 hover:text-amber-700">privacy@apanidukaan.live</a></p>
                  <p>🌐 Website: <a href="https://apanidukaan.live" className="text-amber-600 hover:text-amber-700">apanidukaan.live</a></p>
                  <p>📍 India</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-amber-100 bg-white py-8 mt-8">
      <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-warm-400 text-sm">© 2025 ApaniDukaan. All rights reserved.</p>
        <div className="flex gap-6 text-sm">
          <Link href="/privacy"   className="text-warm-400 hover:text-amber-600">Privacy Policy</Link>
          <Link href="/terms"     className="text-warm-400 hover:text-amber-600">Terms of Service</Link>
          <Link href="/refunds"   className="text-warm-400 hover:text-amber-600">Refund Policy</Link>
          <Link href="/contact"   className="text-warm-400 hover:text-amber-600">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
