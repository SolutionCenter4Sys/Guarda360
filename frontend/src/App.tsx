import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext'
import { ToastContainer } from './components/ui/Toast'
import { OnboardingWizard } from './components/onboarding/OnboardingWizard'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AppLayout } from './components/layout/AppLayout'

const LoginPage             = lazy(() => import('./pages/LoginPage'))
const RegisterPage          = lazy(() => import('./pages/RegisterPage'))
const InviteAcceptPage      = lazy(() => import('./pages/InviteAcceptPage'))
const DashboardPage         = lazy(() => import('./pages/DashboardPage'))
const CalendarPage          = lazy(() => import('./pages/CalendarPage'))
const ChatPage              = lazy(() => import('./pages/ChatPage'))
const FinancialPage         = lazy(() => import('./pages/FinancialPage'))
const IncidentsPage         = lazy(() => import('./pages/IncidentsPage'))
const ChildrenPage          = lazy(() => import('./pages/ChildrenPage'))
const ReportsPage           = lazy(() => import('./pages/ReportsPage'))
const HealthPage            = lazy(() => import('./pages/HealthPage'))
const AuthorizedPersonsPage = lazy(() => import('./pages/AuthorizedPersonsPage'))
const AuditPage             = lazy(() => import('./pages/AuditPage'))
const SettingsPage          = lazy(() => import('./pages/SettingsPage'))

function PageLoader() {
  return (
    <div
      className="flex items-center justify-center h-64"
      role="status"
      aria-label="Carregando..."
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        aria-hidden="true"
      />
    </div>
  )
}

function OnboardingTrigger() {
  const { isAuthenticated } = useAuth()
  const { isDone, openOnboarding } = useOnboarding()

  useEffect(() => {
    if (isAuthenticated && !isDone) {
      const timer = setTimeout(openOnboarding, 600)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, isDone, openOnboarding])

  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Suspense fallback={<PageLoader />}>
              <RegisterPage />
            </Suspense>
          </PublicRoute>
        }
      />
      <Route
        path="/invite"
        element={
          <Suspense fallback={<PageLoader />}>
            <InviteAcceptPage />
          </Suspense>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="children"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><ChildrenPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="calendar"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><CalendarPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="chat"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><ChatPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="financial"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><FinancialPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="incidents"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><IncidentsPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="reports"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="health"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><HealthPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="authorized-persons"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><AuthorizedPersonsPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="audit"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><AuditPage /></Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="settings"
          element={
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>
            </ErrorBoundary>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <OnboardingProvider>
            <ErrorBoundary>
              <OnboardingTrigger />
              <AppRoutes />
              <ToastContainer />
              <OnboardingWizard />
            </ErrorBoundary>
          </OnboardingProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
