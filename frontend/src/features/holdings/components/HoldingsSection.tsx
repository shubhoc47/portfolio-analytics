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
import { SectionHeader } from "../../../components/common/SectionHeader";
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
      setIsCreateOpen(false);
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
    <Card variant="elevated" className="space-y-4">
      <SectionHeader
        title="Holdings"
        description="Track positions and manage holdings with focused actions."
        actions={
          <>
            <Button variant="ghost" onClick={() => void loadHoldings()}>
              Refresh
            </Button>
            <Button variant="secondary" onClick={() => setIsCreateOpen((prev) => !prev)}>
              {isCreateOpen ? "Close Add Form" : "Add Holding"}
            </Button>
          </>
        }
      />

      {actionMessage ? (
        <p className="rounded-xl border border-emerald-200/90 bg-emerald-50/95 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-200">
          {actionMessage}
        </p>
      ) : null}

      {isCreateOpen ? (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300">
            Add Holding
          </h3>
          <HoldingForm
            key={`create-form-${createFormVersion}`}
            submitLabel="Add Holding"
            isSubmitting={isCreating}
            submitError={createError}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </div>
      ) : null}

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
          action={
            <Button variant="secondary" onClick={() => setIsCreateOpen(true)}>
              Add First Holding
            </Button>
          }
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

      {editingHolding ? (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/85 p-4 dark:border-slate-700 dark:bg-slate-900/70">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300">
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
