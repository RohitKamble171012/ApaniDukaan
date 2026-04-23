import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/shared/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: 'ApaniDukaan — Local Shop Management Platform',
  description: 'Manage your local shop digitally. Products, orders, analytics and customer storefront in one place.',
  keywords: 'local shop, inventory management, orders, QR code shop'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-surface-50`}>
        <AuthProvider>
          {children}

          {/*  Add Toaster here */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#fff',
                color: '#1c1917',
                borderRadius: '12px',
                fontSize: '14px',
                border: '1px solid #fde68a',
                boxShadow: '0 4px 24px rgba(245,158,11,0.15)'
              },
              success: {
                iconTheme: { primary: '#f59e0b', secondary: '#fff' }
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' }
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
