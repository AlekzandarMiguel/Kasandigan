import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import ResidentLayout from './layouts/ResidentLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Resident Pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import AssistanceRequestsList from './pages/resident/AssistanceRequestsList';
import CreateRequestPage from './pages/resident/CreateRequestPage';
import RequestDetailPage from './pages/resident/RequestDetailPage';
import SkillsAvailabilityPage from './pages/resident/SkillsAvailabilityPage';
import AssistanceTrackerPage from './pages/resident/AssistanceTrackerPage';
import ResourcesLendingPage from './pages/resident/ResourcesLendingPage';
import NotificationsPage from './pages/resident/NotificationsPage';
import ResidentAnnouncementsPage from './pages/resident/ResidentAnnouncementsPage';
import ProfileSettingsPage from './pages/resident/ProfileSettingsPage';
import VolunteerCertificatePage from './pages/resident/VolunteerCertificatePage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import ResidentVerificationsPage from './pages/staff/ResidentVerificationsPage';
import StaffResidentsDirectoryPage from './pages/staff/StaffResidentsDirectoryPage';
import StaffRequestsTriagePage from './pages/staff/StaffRequestsTriagePage';
import StaffReportsPage from './pages/staff/StaffReportsPage';
import StaffAnnouncementsPage from './pages/staff/StaffAnnouncementsPage';

// Barangay Admin Pages
import BarangayDashboard from './pages/admin/BarangayDashboard';
import BarangayResidentsPage from './pages/admin/BarangayResidentsPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import BarangayRequestsPage from './pages/admin/BarangayRequestsPage';
import SkillsManagementPage from './pages/admin/SkillsManagementPage';
import CategoriesManagementPage from './pages/admin/CategoriesManagementPage';
import BarangayReportsPage from './pages/admin/BarangayReportsPage';
import BarangayAnnouncementsPage from './pages/admin/BarangayAnnouncementsPage';
import ActivityLogsPage from './pages/admin/ActivityLogsPage';
import BarangaySettingsPage from './pages/admin/BarangaySettingsPage';
import BarangayDILGReportPage from './pages/admin/BarangayDILGReportPage';

// Platform Admin Pages
import PlatformDashboard from './pages/platform/PlatformDashboard';
import BarangaysManagementPage from './pages/platform/BarangaysManagementPage';
import PlatformUsersPage from './pages/platform/PlatformUsersPage';
import PlatformReportsPage from './pages/platform/PlatformReportsPage';
import PlatformActivityLogsPage from './pages/platform/PlatformActivityLogsPage';
import PlatformSettingsPage from './pages/platform/PlatformSettingsPage';
import MunicipalDILGReportPage from './pages/platform/MunicipalDILGReportPage';
import PlatformAnnouncementsPage from './pages/platform/PlatformAnnouncementsPage';

// Loading Spinner
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Authenticating user session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to user's authorized role dashboard
    if (user.role === 'PLATFORM_ADMIN') return <Navigate to="/platform/dashboard" replace />;
    if (user.role === 'BARANGAY_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'BARANGAY_STAFF') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const DynamicUserLayout = () => {
  const { user } = useAuth();
  if (user?.role === 'RESIDENT') {
    return <ResidentLayout />;
  }
  return <AdminLayout />;
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LanguageProvider>
          <Router>
            <Routes>
            {/* Standalone Login Route (No Public Navbar) */}
            <Route path="/login" element={<LoginPage />} />

            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Resident Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <ResidentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<ResidentDashboard />} />
              <Route path="/announcements" element={<ResidentAnnouncementsPage />} />
              <Route path="/requests" element={<AssistanceRequestsList />} />
              <Route path="/requests/create" element={<CreateRequestPage />} />
              <Route path="/requests/:id" element={<RequestDetailPage />} />
              <Route path="/skills" element={<SkillsAvailabilityPage />} />
              <Route path="/assistance" element={<AssistanceTrackerPage />} />
              <Route path="/resources" element={<ResourcesLendingPage />} />
              <Route path="/certificate" element={<VolunteerCertificatePage />} />
              <Route path="/settings" element={<ProfileSettingsPage />} />
            </Route>

            {/* Universally Accessible Authenticated Notifications Route */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['RESIDENT', 'BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN']}>
                  <DynamicUserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Barangay Staff Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['BARANGAY_STAFF', 'BARANGAY_ADMIN', 'PLATFORM_ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/verifications" element={<ResidentVerificationsPage />} />
              <Route path="/staff/residents" element={<StaffResidentsDirectoryPage />} />
              <Route path="/staff/requests" element={<StaffRequestsTriagePage />} />
              <Route path="/staff/reports" element={<StaffReportsPage />} />
              <Route path="/staff/announcements" element={<StaffAnnouncementsPage />} />
            </Route>

            {/* Barangay Admin Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['BARANGAY_ADMIN', 'PLATFORM_ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<BarangayDashboard />} />
              <Route path="/admin/dilg-report" element={<BarangayDILGReportPage />} />
              <Route path="/admin/residents" element={<BarangayResidentsPage />} />
              <Route path="/admin/staff" element={<StaffManagementPage />} />
              <Route path="/admin/requests" element={<BarangayRequestsPage />} />
              <Route path="/admin/skills" element={<SkillsManagementPage />} />
              <Route path="/admin/categories" element={<CategoriesManagementPage />} />
              <Route path="/admin/reports" element={<BarangayReportsPage />} />
              <Route path="/admin/announcements" element={<BarangayAnnouncementsPage />} />
              <Route path="/admin/activity-logs" element={<ActivityLogsPage />} />
              <Route path="/admin/settings" element={<BarangaySettingsPage />} />
            </Route>

            {/* Platform Admin Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/platform/dashboard" element={<PlatformDashboard />} />
              <Route path="/platform/announcements" element={<PlatformAnnouncementsPage />} />
              <Route path="/platform/dilg-report" element={<MunicipalDILGReportPage />} />
              <Route path="/platform/barangays" element={<BarangaysManagementPage />} />
              <Route path="/platform/users" element={<PlatformUsersPage />} />
              <Route path="/platform/reports" element={<PlatformReportsPage />} />
              <Route path="/platform/activity-logs" element={<PlatformActivityLogsPage />} />
              <Route path="/platform/settings" element={<PlatformSettingsPage />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </LanguageProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
