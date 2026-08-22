import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/public/ResetPasswordPage';



// Public
const FacilitiesPage = lazy(() => import('./pages/public/FacilitiesPage').then(m => ({ default: m.FacilitiesPage })));
const GalleryPage = lazy(() => import('./pages/public/GalleryPage').then(m => ({ default: m.GalleryPage })));
const TrainersPage = lazy(() => import('./pages/public/TrainersPage').then(m => ({ default: m.TrainersPage })));
const TrainerDetailPage = lazy(() => import('./pages/public/TrainerDetailPage').then(m => ({ default: m.TrainerDetailPage })));
const VerifyEmailPage = lazy(() => import('./pages/public/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const OAuthCallbackPage = lazy(() => import('./pages/public/OAuthCallbackPage').then(m => ({ default: m.OAuthCallbackPage })));

// Member
const CheckInPage = lazy(() => import('./pages/member/CheckInPage').then(m => ({ default: m.CheckInPage })));
const MembershipPage = lazy(() => import('./pages/member/MembershipPage').then(m => ({ default: m.MembershipPage })));
const NotificationsPage = lazy(() => import('./pages/member/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const BookingPage = lazy(() => import('./pages/member/BookingPage').then(m => ({ default: m.BookingPage })));
const MyBookingsPage = lazy(() => import('./pages/member/MyBookingsPage').then(m => ({ default: m.MyBookingsPage })));
const KtaPage = lazy(() => import('./pages/member/KtaPage').then(m => ({ default: m.KtaPage })));
const MemberDashboardHome = lazy(() => import('./pages/member/MemberDashboardHome').then(m => ({ default: m.MemberDashboardHome })));

// Trainer
const TrainerScheduleDashboard = lazy(() => import('./pages/trainer/TrainerScheduleDashboard').then(m => ({ default: m.TrainerScheduleDashboard })));
const TrainerBookingsPage = lazy(() => import('./pages/trainer/TrainerBookingsPage').then(m => ({ default: m.TrainerBookingsPage })));
const TrainerProfilePage = lazy(() => import('./pages/trainer/TrainerProfilePage').then(m => ({ default: m.TrainerProfilePage })));
const TrainerDashboardHome = lazy(() => import('./pages/trainer/TrainerDashboardHome').then(m => ({ default: m.TrainerDashboardHome })));

// Admin/Owner
const CheckInFeedPage = lazy(() => import('./pages/admin/CheckInFeedPage').then(m => ({ default: m.CheckInFeedPage })));
const PaymentApprovalPage = lazy(() => import('./pages/admin/PaymentApprovalPage').then(m => ({ default: m.PaymentApprovalPage })));
const BookingApprovalPage = lazy(() => import('./pages/admin/BookingApprovalPage').then(m => ({ default: m.BookingApprovalPage })));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const AdminFacilitiesPage = lazy(() => import('./pages/admin/AdminFacilitiesPage').then(m => ({ default: m.AdminFacilitiesPage })));
const AdminGalleryPage = lazy(() => import('./pages/admin/AdminGalleryPage').then(m => ({ default: m.AdminGalleryPage })));
const AdminTrainersPage = lazy(() => import('./pages/admin/AdminTrainersPage').then(m => ({ default: m.AdminTrainersPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminMembershipPlansPage = lazy(() => import('./pages/admin/AdminMembershipPlansPage').then(m => ({ default: m.AdminMembershipPlansPage })));
const DropInPage = lazy(() => import('./pages/admin/DropInPage').then(m => ({ default: m.DropInPage })));
const AdminWarungProductsPage = lazy(() => import('./pages/admin/AdminWarungProductsPage').then(m => ({ default: m.AdminWarungProductsPage })));
const AdminWarungCashierPage = lazy(() => import('./pages/admin/AdminWarungCashierPage').then(m => ({ default: m.AdminWarungCashierPage })));
const AdminWarungHistoryPage = lazy(() => import('./pages/admin/AdminWarungHistoryPage').then(m => ({ default: m.AdminWarungHistoryPage })));
const FinancialReportPage = lazy(() => import('./pages/admin/FinancialReportPage').then(m => ({ default: m.FinancialReportPage })));
const AdminDashboardHome = lazy(() => import('./pages/admin/AdminDashboardHome').then(m => ({ default: m.AdminDashboardHome })));

function DashboardHomeRouter() {
  const { user } = useAuth();

  if (user?.role === 'PERSONAL_TRAINER') {
    return <TrainerDashboardHome />;
  }

  if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
    return <AdminDashboardHome />;
  }

  return <MemberDashboardHome />;
}

function PageLoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <span>Memuat...</span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/trainers/:id" element={<TrainerDetailPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          </Route>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHomeRouter />} />
            <Route path="check-in" element={<CheckInPage />} />
            <Route path="check-in-feed" element={<CheckInFeedPage />} />
            <Route path="membership" element={<MembershipPage />} />
            <Route path="payments" element={<PaymentApprovalPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="bookings/new" element={<BookingPage />} />
            <Route path="schedule" element={<TrainerScheduleDashboard />} />
            <Route path="trainer-bookings" element={<TrainerBookingsPage />} />
            <Route path="bookings-approval" element={<BookingApprovalPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="content/facilities" element={<AdminFacilitiesPage />} />
            <Route path="content/gallery" element={<AdminGalleryPage />} />
            <Route path="trainers" element={<AdminTrainersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="membership-plans" element={<AdminMembershipPlansPage />} />
            <Route path="drop-in" element={<DropInPage />} />
            <Route path="profile" element={<TrainerProfilePage />} />
            <Route path="warung/products" element={<AdminWarungProductsPage />} />
            <Route path="warung/cashier" element={<AdminWarungCashierPage />} />
            <Route path="warung/history" element={<AdminWarungHistoryPage />} />
            <Route path="kta" element={<KtaPage />} />
            <Route path="financial-report" element={<FinancialReportPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;