import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PortfolioCreatePage } from "./pages/PortfolioCreatePage";
import { PortfolioDetailPage } from "./pages/PortfolioDetailPage";
import { PortfolioEditPage } from "./pages/PortfolioEditPage";
import { PortfoliosPage } from "./pages/PortfoliosPage";
import { SignupPage } from "./pages/SignupPage";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<Navigate to="/login" replace />} />
        <Route
          path="/portfolios"
          element={
            <ProtectedRoute>
              <PortfoliosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolios/new"
          element={
            <ProtectedRoute>
              <PortfolioCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolios/:id"
          element={
            <ProtectedRoute>
              <PortfolioDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolios/:id/edit"
          element={
            <ProtectedRoute>
              <PortfolioEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/portfolios" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
