import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./layouts/AppLayout";
import { HomePage } from "./pages/HomePage";
import { PortfolioCreatePage } from "./pages/PortfolioCreatePage";
import { PortfolioDetailPage } from "./pages/PortfolioDetailPage";
import { PortfolioEditPage } from "./pages/PortfolioEditPage";
import { PortfoliosPage } from "./pages/PortfoliosPage";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/portfolios" element={<PortfoliosPage />} />
        <Route path="/portfolios/new" element={<PortfolioCreatePage />} />
        <Route path="/portfolios/:id" element={<PortfolioDetailPage />} />
        <Route path="/portfolios/:id/edit" element={<PortfolioEditPage />} />
        <Route path="*" element={<Navigate to="/portfolios" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
