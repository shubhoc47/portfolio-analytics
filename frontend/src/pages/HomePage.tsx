import { Link } from "react-router-dom";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export function HomePage() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white to-brand-50">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          PortfolioIQ Frontend
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
          Professional portfolio management interface connected to your FastAPI backend.
          This milestone includes complete portfolio CRUD with polished UX and clean
          architecture.
        </p>
        <div className="mt-6">
          <Link to="/portfolios">
            <Button>Go to Portfolios</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
