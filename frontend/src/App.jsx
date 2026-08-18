// App.jsx - Complete route configuration with PropertyDetail

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AgentDashboard from './pages/Agent/AgentDashboard';
import AgentRegister from './pages/Agent/AgentRegister';

// Lazy load other pages
const HomePage = lazy(() => import('./pages/HomePage'));
const BusinessDirectory = lazy(() => import('./pages/BusinessDirectory'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const BusinessRegister = lazy(() => import('./pages/BusinessRegister'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const RequestReset = lazy(() => import('./pages/RequestReset'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const RealEstateHome = lazy(() => import('./pages/RealEstate/RealEstateHome'));
const PropertyDetail = lazy(() => import('./pages/RealEstate/PropertyDetail')); // ✅ ADD THIS

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<HomePage />} />
          <Route path="businesses" element={<BusinessDirectory />} />
          <Route path="business/:slug" element={<BusinessProfile />} />
          <Route path="deals" element={<DealsPage />} />
          <Route path="events" element={<EventsPage />} />
          
          {/* ✅ Real Estate Routes */}
          <Route path="real-estate" element={<RealEstateHome />} />
          <Route path="real-estate/:id" element={<PropertyDetail />} /> {/* ✅ ADD THIS */}
          
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="agent/register" element={<AgentRegister />} />
          
          {/* Business Registration */}
          <Route path="business/register" element={<BusinessRegister />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute requireBusiness={true} />}>
            <Route path="dashboard/*" element={<Dashboard />} />
          </Route>
          
          {/* Agent Dashboard - Protected */}
          <Route element={<ProtectedRoute requiredRole={['agent', 'admin', 'super_admin']} />}>
            <Route path="agent/dashboard" element={<AgentDashboard />} />
          </Route>
          
          {/* Admin Dashboard */}
          <Route element={<ProtectedRoute requiredRole={['admin', 'super_admin']} />}>
            <Route path="admin/*" element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;