import { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import NotFound from '@/pages/NotFound';

// Lazy load pages for code splitting
const Home = lazy(() => import('@/pages/home/page'));
const Menu = lazy(() => import('@/pages/menu/page'));
const Offers = lazy(() => import('@/pages/offers/page'));
const Events = lazy(() => import('@/pages/events/page'));
const About = lazy(() => import('@/pages/about/page'));
const Contact = lazy(() => import('@/pages/contact/page'));
const Cart = lazy(() => import('@/pages/cart/page'));
const Checkout = lazy(() => import('@/pages/checkout/page'));
const OrderTracking = lazy(() => import('@/pages/order-tracking/page'));
const Login = lazy(() => import('@/pages/auth/login/page'));
const Register = lazy(() => import('@/pages/auth/register/page'));
const Account = lazy(() => import('@/pages/account/page'));
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard/page'));
const AdminProducts = lazy(() => import('@/pages/admin/products/page'));
const AdminOrders = lazy(() => import('@/pages/admin/orders/page'));
const AdminOffers = lazy(() => import('@/pages/admin/offers/page'));
const AdminEvents = lazy(() => import('@/pages/admin/events/page'));
const AdminMessages = lazy(() => import('@/pages/admin/messages/page'));
const AdminContent = lazy(() => import('@/pages/admin/content/page'));
const AdminSettings = lazy(() => import('@/pages/admin/settings/page'));
const AdminUsers = lazy(() => import('@/pages/admin/users/page'));
const AdminActivity = lazy(() => import('@/pages/admin/activity/page'));
const BranchSelection = lazy(() => import('@/pages/auth/branch-selection/page'));

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <PageWrapper>
        <Home />
      </PageWrapper>
    ),
  },
  {
    path: '/menu',
    element: (
      <PageWrapper>
        <Menu />
      </PageWrapper>
    ),
  },
  {
    path: '/offers',
    element: (
      <PageWrapper>
        <Offers />
      </PageWrapper>
    ),
  },
  {
    path: '/events',
    element: (
      <PageWrapper>
        <Events />
      </PageWrapper>
    ),
  },
  {
    path: '/about',
    element: (
      <PageWrapper>
        <About />
      </PageWrapper>
    ),
  },
  {
    path: '/contact',
    element: (
      <PageWrapper>
        <Contact />
      </PageWrapper>
    ),
  },
  {
    path: '/cart',
    element: (
      <PageWrapper>
        <Cart />
      </PageWrapper>
    ),
  },
  {
    path: '/checkout',
    element: (
      <PageWrapper>
        <Checkout />
      </PageWrapper>
    ),
  },
  {
    path: '/order/:id',
    element: (
      <PageWrapper>
        <OrderTracking />
      </PageWrapper>
    ),
  },
  {
    path: '/select-branch',
    element: (
      <PageWrapper>
        <BranchSelection />
      </PageWrapper>
    ),
  },
  {
    path: '/login',
    element: (
      <PageWrapper>
        <Login />
      </PageWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <PageWrapper>
        <Register />
      </PageWrapper>
    ),
  },
  {
    path: '/account',
    element: (
      <PageWrapper>
        <Account />
      </PageWrapper>
    ),
  },
  {
    path: '/admin',
    element: (
      <PageWrapper>
        <AdminDashboard />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <PageWrapper>
        <AdminProducts />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <PageWrapper>
        <AdminOrders />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/offers',
    element: (
      <PageWrapper>
        <AdminOffers />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/events',
    element: (
      <PageWrapper>
        <AdminEvents />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/messages',
    element: (
      <PageWrapper>
        <AdminMessages />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/content',
    element: (
      <PageWrapper>
        <AdminContent />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <PageWrapper>
        <AdminSettings />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <PageWrapper>
        <AdminUsers />
      </PageWrapper>
    ),
  },
  {
    path: '/admin/activity',
    element: (
      <PageWrapper>
        <AdminActivity />
      </PageWrapper>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;