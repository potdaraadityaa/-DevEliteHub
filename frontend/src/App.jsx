import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layout
import Navbar from './components/layout/Navbar.jsx'

// Auth
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

// Pages – always loaded
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// Phase 3 – Creator
import CreatorDashboard from './pages/creator/CreatorDashboard.jsx'

// Phase 4 – Payments
import SubscribePage from './pages/payment/SubscribePage.jsx'
import SubscribeSuccessPage from './pages/payment/SubscribeSuccessPage.jsx'

// Phase 5 – Subscriber
import ExplorePage from './pages/subscriber/ExplorePage.jsx'
import CreatorProfilePage from './pages/subscriber/CreatorProfilePage.jsx'

// Phase 7 – Admin
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* ── Public ─────────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Browse ─────────────────────────────────────── */}
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/creator/:creatorId" element={<CreatorProfilePage />} />

          {/* ── Subscribe (Phase 4) ────────────────────────── */}
          <Route path="/subscribe/:tierId" element={<SubscribePage />} />
          <Route path="/subscribe/success" element={<SubscribeSuccessPage />} />

          {/* ── Creator Dashboard (Phase 3) ────────────────── */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute role="CREATOR">
              <CreatorDashboard />
            </ProtectedRoute>
          } />

          {/* ── Admin (Phase 7) ────────────────────────────── */}
          <Route path="/admin/*" element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
