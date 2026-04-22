# 🛒 SmartShop — Local Shop Management & Customer Ordering Platform

A full-stack production-ready platform for local shopkeepers to manage their digital shop, inventory, orders, analytics, and customer storefront.

---

## 🚀 Features

### Shopkeeper Dashboard
- 🔐 Firebase Authentication (Google + Email/Password)
- 📊 Real-time dashboard with revenue, orders, and low-stock alerts
- 📦 Product management with bulk Excel import/export
- 🛍️ Order management with status tracking and payment confirmation
- 📈 Analytics with charts, best sellers, recommendations
- 💰 Revenue & Sales breakdown
- 🏪 Full shop info & branding editor
- 📱 QR code generation for instant customer access
- 💬 Customer feedback and item request management
- ⚙️ Settings — visibility toggle, payment, delivery options

### Customer Storefront
- 🚫 No login required for customers
- 📲 QR code scan → instant shop page
- 🔍 Search & filter products by category
- 🎙️ Voice/NLP shopping input ("2 kg rice, 1 oil, 3 soaps")
- 🛒 Full cart & checkout flow
- 💳 Cash or Razorpay online payment
- 📍 Order tracking by order number
- ⭐ Feedback and item request submission

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Auth | Firebase Authentication + Firebase Admin SDK |
| Database | MongoDB (via Mongoose) |
| Inventory | Excel files via SheetJS (xlsx) |
| Payments | Razorpay |
| Charts | Recharts |
| State | Zustand |
| QR Code | qrcode + qrcode.react |

---

## 📁 Project Structure

```
smart-shop/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── models/           # Mongoose models
│   │   │   ├── User.ts
│   │   │   ├── Shop.ts
│   │   │   ├── Product.ts
│   │   │   ├── Order.ts
│   │   │   ├── Feedback.ts
│   │   │   └── Analytics.ts
│   │   ├── routes/           # API routes
│   │   │   ├── auth.ts
│   │   │   ├── shop.ts
│   │   │   ├── product.ts
│   │   │   ├── order.ts
│   │   │   ├── payment.ts
│   │   │   ├── analytics.ts
│   │   │   ├── feedback.ts
│   │   │   ├── qr.ts
│   │   │   └── upload.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts       # Firebase token verification
│   │   │   └── upload.ts     # Multer config
│   │   └── utils/
│   │       ├── db.ts         # MongoDB connection
│   │       ├── firebase.ts   # Firebase Admin
│   │       ├── excel.ts      # SheetJS parsing/export
│   │       ├── qr.ts         # QR code generation
│   │       └── helpers.ts    # Order numbers, slugs
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/                 # Next.js 14 App Router
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx              # Landing page
    │   │   ├── layout.tsx            # Root layout
    │   │   ├── globals.css
    │   │   ├── auth/
    │   │   │   ├── login/page.tsx    # Login/register
    │   │   │   └── onboard/page.tsx  # Shop onboarding wizard
    │   │   ├── dashboard/
    │   │   │   ├── layout.tsx        # Dashboard sidebar layout
    │   │   │   ├── page.tsx          # Home stats
    │   │   │   ├── orders/page.tsx
    │   │   │   ├── products/page.tsx # + Excel import
    │   │   │   ├── analytics/page.tsx
    │   │   │   ├── sales/page.tsx
    │   │   │   ├── revenue/page.tsx
    │   │   │   ├── shop-info/page.tsx
    │   │   │   ├── qr/page.tsx
    │   │   │   ├── feedback/page.tsx
    │   │   │   └── settings/page.tsx
    │   │   ├── shop/[shopSlug]/
    │   │   │   ├── layout.tsx        # Cart context
    │   │   │   ├── page.tsx          # Customer storefront
    │   │   │   ├── checkout/page.tsx # Razorpay checkout
    │   │   │   └── confirmation/page.tsx
    │   │   └── track/[orderNumber]/page.tsx
    │   ├── components/shared/
    │   │   └── AuthProvider.tsx
    │   ├── lib/
    │   │   ├── firebase.ts   # Firebase client
    │   │   ├── api.ts        # Axios API client
    │   │   └── utils.ts      # Helpers, formatters
    │   ├── store/
    │   │   └── index.ts      # Zustand stores (auth + cart)
    │   └── utils/
    │       └── voiceParser.ts # NLP shopping list parser
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    └── .env.example
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Firebase project
- Razorpay account (test mode is fine)

---

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd smart-shop

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Sign-in Methods → Enable **Google** and **Email/Password**
4. Go to **Project Settings** → Service Accounts → Generate new private key
5. Download the JSON file — you'll need values from it for backend `.env`
6. Go to **Project Settings** → General → Add a Web App
7. Copy the Firebase config — you'll need it for frontend `.env`

---

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/smart-shop

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret

FRONTEND_BASE_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

### 4. Run Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → Starts on http://localhost:3000
```

Visit http://localhost:3000

---

## 📊 Excel Import Format

Download the template from Dashboard → Products → Template button.

Required columns: `productName`, `price`, `quantity`

Full column list:
| Column | Required | Example |
|---|---|---|
| productName | ✅ | Basmati Rice 1kg |
| category | | Groceries |
| brand | | India Gate |
| price | ✅ | 120 |
| discountPrice | | 110 |
| quantity | ✅ | 50 |
| unit | | kg |
| sku | | GRC001 |
| description | | Premium basmati |
| imageUrl | | https://... |
| tags | | rice,staple |
| availability | | true |

---

## 💳 Razorpay Integration

The platform uses Razorpay for online payments.

**Test mode**: Use Razorpay test keys. Test card: `4111 1111 1111 1111`, any future expiry, any CVV.

**Production mode**:
1. Complete Razorpay KYC
2. Replace test keys with live keys in `.env`
3. For marketplace payout (shop owner receives directly), implement Razorpay Route/Connect — see `backend/src/routes/payment.ts` for the architecture hook.

---

## 🚀 Deployment

### Backend → Railway or Render

**Railway**:
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```
Set all environment variables in Railway dashboard.

**Render**:
1. Connect GitHub repo
2. New Web Service → select `backend/` directory
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables in dashboard

---

### Frontend → Vercel

```bash
npm install -g vercel
cd frontend
vercel
```
Or connect GitHub repo at vercel.com.

Set environment variables in Vercel dashboard under Project Settings → Environment Variables.

Update `NEXT_PUBLIC_BACKEND_URL` and `NEXT_PUBLIC_API_URL` to your deployed backend URL.

---

## 🔒 Security Notes

- All shopkeeper API routes require a valid Firebase JWT token
- Customers don't need auth — public routes are read-only per shop
- File uploads are validated for type and size
- Rate limiting applied on all API routes
- CORS restricted to frontend domain in production
- MongoDB queries are scoped by `shopId` to prevent data leakage

---

## 🗺️ Customer Flow

```
Customer scans QR code
        ↓
/shop/[shopSlug] — Browse products
        ↓
Add to cart (voice or manual)
        ↓
/shop/[shopSlug]/checkout — Enter name, phone
        ↓
Choose: Cash or Razorpay
        ↓
Order placed → /confirmation
        ↓
Track at /track/[orderNumber]
```

---

## 🗺️ Shopkeeper Flow

```
/auth/login — Firebase auth
        ↓
/auth/onboard — Shop setup wizard
        ↓
/dashboard — Stats + quick actions
        ↓
/dashboard/products — Add/import products
        ↓
/dashboard/orders — Confirm/reject/update orders
        ↓
/dashboard/analytics — Insights & recommendations
        ↓
/dashboard/qr — Share QR code
```

---

## 📦 Sample Excel Template

A sample `product-template.xlsx` can be downloaded from:
`GET /api/products/template` (requires auth) or from the Products dashboard page.

---

## 🤝 Contributing / Extending

Ideas to extend:
- Push notifications via Firebase Cloud Messaging
- WhatsApp order notifications via Twilio
- Multi-language support (Hindi, Marathi, etc.)
- Barcode scanning for product lookup
- Print invoice PDF generation
- Loyalty points system

---

## 📄 License

MIT License — free for personal and commercial use.
