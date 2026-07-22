# 🍕 Milano Pizza — Authentic Italian Pizzeria in Hurghada

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

A modern, high-performance, multi-lingual online ordering and management web application built for **Milano Pizza** — serving wood-fired authentic Italian pizza across two branches (**Arabia** & **Dahar**) in Hurghada, Egypt.

---

## 🌟 Highlights & Features

### 🛒 Customer Ordering Experience
- **Interactive Menu**: Explore wood-fired pizzas, appetizers, pasta, desserts, and beverages with ingredient customization and dietary filters.
- **Multi-Branch Support**: Seamless switching between the **Arabia** and **Dahar** branches with localized operating hours and menu availability.
- **Real-Time Shopping Cart & Checkout**: Interactive cart with instant total calculations, delivery address management, and live order tracking.
- **5-Language Internationalization (i18n)**: Full support for both RTL and LTR languages:
  - 🇸🇦 Arabic (Default / RTL)
  - 🇬🇧 English
  - 🇮🇹 Italian
  - 🇩🇪 German
  - 🇷🇺 Russian
- **Offers & Events**: Dedicated promotion hub for combo deals, party reservations, and special event catering requests.

### 🛡️ Powerful Admin Portal
- **Dashboard Analytics**: Real-time sales, order volume, popular menu items, and active branch metrics.
- **Product & Category Management**: Dynamic CRUD management for menu items, pricing, sizes, toppings, and stock availability.
- **Live Order Fulfillment**: Process, update status (Pending, Preparing, Out for Delivery, Completed, Cancelled), and track delivery orders.
- **Content & Event Management**: Control promotional banners, customer inquiries, special events, user permissions, and system audit logs.

### ⚡ Technical Excellence & Security
- **Blazing Fast Performance**: Code-splitting with Vite & React Suspense for sub-second page loads.
- **Robust Security Headers**: Custom `vercel.json` with strict Content Security Policy (CSP), `X-Frame-Options`, `X-Content-Type-Options`, and `Permissions-Policy`.
- **Complete SEO Suite**: OpenGraph meta tags, Twitter cards, and Schema.org JSON-LD structured data tailored for restaurant discovery.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Core** | [React 18](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Build System** | [Vite 5](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), [PostCSS](https://postcss.org/), [Autoprefixer](https://github.com/postcss/autoprefixer) |
| **Routing** | [React Router v6](https://reactrouter.com/) |
| **Backend & DB** | [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`) |
| **Internationalization** | [i18next](https://www.i18next.com/), `react-i18next`, `i18next-browser-languagedetector` |
| **Icons & Fonts** | FontAwesome 6, RemixIcon 4.5, Google Fonts (Cairo, Inter, Playfair Display, Poppins) |
| **Deployment** | Vercel (Configured with custom caching & security rules in `vercel.json`) |

---

## 📁 Project Architecture

```
milano-pizza/
├── .agents/               # Skill configurations & project instructions
├── assets/                # Static public assets (Favicon, branding logos)
├── i18n/                  # Localization dictionary translation files
├── public/                # Static files served directly at root
├── src/
│   ├── components/        # UI components
│   │   ├── feature/       # High-level feature components (Navbar, Footer, Modals)
│   │   └── ui/            # Reusable core UI widgets (Buttons, Inputs, Cards)
│   ├── contexts/          # React Context providers (CartContext, BranchContext)
│   ├── hooks/             # Custom React hooks (Supabase query hooks, auto-refresh)
│   ├── i18n/              # i18n configuration setup
│   ├── lib/               # Utility functions and Supabase client initialization
│   ├── pages/             # Page components
│   │   ├── home/          # Landing page
│   │   ├── menu/          # Interactive menu
│   │   ├── offers/        # Special promotions & combos
│   │   ├── events/        # Special events & catering
│   │   ├── about/         # Pizzeria history & craftsmanship
│   │   ├── contact/       # Contact form & Google Maps location
│   │   ├── cart/          # Shopping cart page
│   │   ├── checkout/      # Checkout page
│   │   ├── order-tracking/# Real-time order tracking
│   │   ├── auth/          # Login, Register, Branch selection
│   │   └── admin/         # Admin suite (Dashboard, Products, Orders, Offers, etc.)
│   ├── router/            # React Router route configuration with lazy loading
│   ├── App.tsx            # Main application shell & providers
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global CSS & Tailwind imports
├── .env.local             # Environment variable configuration
├── index.html             # HTML5 template with SEO & social meta tags
├── tailwind.config.ts     # Custom theme palette (Primary, Secondary, Background)
├── vercel.json            # Vercel deployment headers, security policy & rewrite rules
├── vite.config.ts         # Vite build configuration
└── package.json           # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed on your machine:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lymonDa/milano-pizza-.git
   cd milano-pizza-
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_PUBLIC_SUPABASE_URL=https://txbmxxteishvbpnupmfp.supabase.co
   VITE_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 📜 NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches Vite dev server with hot module replacement (HMR) |
| `npm run build` | Runs TypeScript compiler checks (`tsc`) and builds for production |
| `npm run preview` | Serves the production build locally for verification |
| `npm run lint` | Runs ESLint to check for code style issues and errors |

---

## 🌐 Deployment

This application is fully optimized for **Vercel** deployment with the included [`vercel.json`](file:///c:/Users/User/Desktop/milano%20pizza/vercel.json).

### Deploying to Vercel
1. Connect your GitHub repository (`lymonDa/milano-pizza-`) to Vercel.
2. In the Vercel project settings, set the environment variables (`VITE_PUBLIC_SUPABASE_URL` and `VITE_PUBLIC_SUPABASE_ANON_KEY`).
3. Click **Deploy**. Vercel will automatically detect Vite and run `npm run build`.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p center="true">
  Made with ❤️ for <b>Milano Pizza Hurghada</b>
</p>
