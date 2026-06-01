import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyserPage } from './pages/AnalyserPage';
import { InterviewPage } from './pages/InterviewPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import './styles/globals.scss';

// QueryClient controls caching, refetching, stale time globally
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // data stays fresh for 5 minutes
      retry: 1,                      // retry failed requests once
    },
  },
});

export default function App() {
  return (
    <Provider store={store}>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — must be logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/analyse" element={<AnalyserPage />} />
            <Route path="/interview"  element={<InterviewPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
    </Provider>
  );
}