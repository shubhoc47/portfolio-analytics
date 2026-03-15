import { useCallback, useEffect, useState } from "react";

import {
  createHolding,
  deleteHolding,
  listHoldingsByPortfolio,
  updateHolding,
} from "../../../api/holdings";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { LoadingState } from "../../../components/common/LoadingState";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { Holding, HoldingUpdateInput } from "../types";
import { HoldingForm, type HoldingFormSubmitPayload } from "./HoldingForm";
import { HoldingsList } from "./HoldingsList";

interface HoldingsSectionProps {
  portfolioId: number;
}

export function HoldingsSection({ portfolioId }: HoldingsSectionProps) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createFormVersion, setCreateFormVersion] = useState(0);

  const [editingHolding, setEditingHolding] = useState<Holding | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [deletingHoldingId, setDeletingHoldingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadHoldings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listHoldingsByPortfolio(portfolioId);
      setHoldings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load holdings.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    void loadHoldings();
  }, [loadHoldings]);

  const handleCreate = async (payload: HoldingFormSubmitPayload) => {
    setIsCreating(true);
    setCreateError(null);
    setActionMessage(null);

    try {
      await createHolding(portfolioId, payload);
      setCreateFormVersion((prev) => prev + 1);
      setActionMessage("Holding added successfully.");
      await loadHoldings();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create holding.";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (holding: Holding) => {
    setUpdateError(null);
    setEditingHolding(holding);
    setActionMessage(null);
  };

  const handleUpdate = async (payload: HoldingFormSubmitPayload) => {
    if (!editingHolding) {
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setActionMessage(null);

    const updatePayload: HoldingUpdateInput = {
      ticker: payload.ticker,
      quantity: payload.quantity,
      average_cost: payload.average_cost,
    };

    try {
      await updateHolding(editingHolding.id, updatePayload);
      setEditingHolding(null);
      setActionMessage("Holding updated successfully.");
      await loadHoldings();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update holding.";
      setUpdateError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (holding: Holding) => {
    const shouldDelete = window.confirm(
      `Delete holding "${holding.ticker}"? This action cannot be undone.`,
    );
    if (!shouldDelete) {
      return;
    }

    setDeletingHoldingId(holding.id);
    setActionMessage(null);
    try {
      await deleteHolding(holding.id);
      setActionMessage("Holding deleted successfully.");
      await loadHoldings();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete holding.";
      setError(message);
    } finally {
      setDeletingHoldingId(null);
    }
  };

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Holdings</h2>
          <p className="text-sm text-slate-600">
            Manage positions for this portfolio (create, edit, and delete).
          </p>
        </div>
      </div>

      {actionMessage ? (
        <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {actionMessage}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
            Add Holding
          </h3>
          <HoldingForm
            key={`create-form-${createFormVersion}`}
            submitLabel="Add Holding"
            isSubmitting={isCreating}
            submitError={createError}
            onSubmit={handleCreate}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Current Holdings
            </h3>
            <Button variant="ghost" onClick={() => void loadHoldings()}>
              Refresh
            </Button>
          </div>

          {isLoading ? <LoadingState message="Loading holdings..." /> : null}
          {!isLoading && error ? (
            <ErrorState
              title="Unable to load holdings"
              message={error}
              onRetry={() => void loadHoldings()}
            />
          ) : null}
          {!isLoading && !error && holdings.length === 0 ? (
            <EmptyState
              title="No holdings yet"
              description="Add your first holding to start tracking this portfolio."
            />
          ) : null}
          {!isLoading && !error && holdings.length > 0 ? (
            <HoldingsList
              holdings={holdings}
              deletingHoldingId={deletingHoldingId}
              onEdit={handleStartEdit}
              onDelete={handleDelete}
            />
          ) : null}
        </div>
      </div>

      {editingHolding ? (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
            Edit Holding: {editingHolding.ticker}
          </h3>
          <HoldingForm
            initialValues={{
              ticker: editingHolding.ticker,
              quantity: String(editingHolding.quantity),
              average_cost: String(editingHolding.average_cost),
            }}
            submitLabel="Save Changes"
            isSubmitting={isUpdating}
            submitError={updateError}
            onSubmit={handleUpdate}
            onCancel={() => setEditingHolding(null)}
          />
        </div>
      ) : null}
    </Card>
  );
}
