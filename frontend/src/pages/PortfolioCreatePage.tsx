import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { createPortfolio } from "../api/portfolios";
import { PageHeader } from "../components/common/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  PortfolioForm,
  type PortfolioFormSubmitPayload,
} from "../features/portfolios/components/PortfolioForm";

export function PortfolioCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (payload: PortfolioFormSubmitPayload) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createPortfolio(payload);
      navigate(`/portfolios/${created.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create portfolio.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <PageHeader
        title="Create Portfolio"
        subtitle="Create a new portfolio workspace with core metadata and ownership details."
        actions={
          <Link to="/portfolios">
            <Button variant="secondary">Back to list</Button>
          </Link>
        }
      />
      <Card variant="elevated">
        <PortfolioForm
          submitLabel="Create Portfolio"
          isSubmitting={isSubmitting}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      </Card>
    </section>
  );
}
