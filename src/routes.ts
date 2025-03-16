
import { RouteObject } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import CategoriesPage from './pages/CategoriesPage';
import BusinessesPage from './pages/BusinessesPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SubscriptionDetailsPage from './pages/SubscriptionDetailsPage';
import SubscriptionDetails from './components/subscription/SubscriptionDetails';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminBusinessListingsPage from './pages/AdminBusinessListingsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardServicePage from './pages/AdminDashboardServicePage';
import InfluencerPage from './pages/InfluencerPage';
import BusinessPage from './pages/BusinessPage';
import ProfilePage from './pages/ProfilePage';
import InfluencerDashboardPage from './pages/InfluencerDashboardPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';

// Define all application routes
const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />
  },
  {
    path: '/categories',
    element: <CategoriesPage />
  },
  {
    path: '/businesses',
    element: <BusinessesPage />
  },
  {
    path: '/subscription',
    element: <SubscriptionPage />
  },
  {
    path: '/subscription/details',
    element: <SubscriptionDetailsPage />
  },
  {
    path: '/subscription/details/:packageId',
    element: <SubscriptionDetails />
  },
  {
    path: '/admin',
    element: <AdminLoginPage />
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />
  },
  {
    path: '/admin/businesses',
    element: <AdminBusinessListingsPage />
  },
  {
    path: '/admin/dashboard-services',
    element: <AdminDashboardServicePage />
  },
  {
    path: '/influencer',
    element: <InfluencerPage />
  },
  {
    path: '/business',
    element: <BusinessPage />
  },
  {
    path: '/profile',
    element: <ProfilePage />
  },
  {
    path: '/influencer-dashboard/*',
    element: <InfluencerDashboardPage />
  },
  {
    path: '/business-dashboard/*',
    element: <BusinessDashboardPage />
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
