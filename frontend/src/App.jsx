import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonationFeed from './pages/DonationFeed';
import DonationDetail from './pages/DonationDetail';
import DonorDashboard from './pages/DonorDashboard';
import CreateDonation from './pages/CreateDonation';
import EditDonation from './pages/EditDonation';
import MyClaims from './pages/MyClaims';
import VerificationStatus from './pages/VerificationStatus';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-cream-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/feed" element={<DonationFeed />} />
          <Route path="/donations/:id" element={<DonationDetail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Donor Routes (Role: donor, admin) */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/create"
            element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <CreateDonation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <EditDonation />
              </ProtectedRoute>
            }
          />

          {/* Recipient Routes (Role: recipient, admin) */}
          <Route
            path="/recipient/claims"
            element={
              <ProtectedRoute allowedRoles={['recipient', 'admin']}>
                <MyClaims />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipient/verification"
            element={
              <ProtectedRoute allowedRoles={['recipient', 'admin']}>
                <VerificationStatus />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes (Role: admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
