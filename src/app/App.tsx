import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { AuthSuccessPage } from '../pages/AuthSuccessPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ErrorPage } from '../pages/ErrorPage';
import { ProtectedRoute } from '../routes/ProtectedRoute';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register/user" element={<RegistrationPage role="user" />} />
      <Route path="/register/employee" element={<RegistrationPage role="employee" />} />
      <Route path="/auth/success" element={<AuthSuccessPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route
        path="/dashboard/user"
        element={
          <ProtectedRoute allowedRole="user">
            <DashboardPage role="user" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/employee"
        element={
          <ProtectedRoute allowedRole="employee">
            <DashboardPage role="employee" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
