import { useCallback, useEffect, useState } from "react";

import {
  createHolding,
  deleteHolding,
  listHoldingsByPortfolio,
  updateHolding,
} from "../../../api/holdings";
import { refreshPortfolioPrices } from "../../../api/marketData";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { LoadingState } from "../../../components/common/LoadingState";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Modal } from "../../../components/ui/Modal";
import type { Holding, HoldingUpdateInput } from "../types";
import { formatDate } from "../../../utils/format";
import { HoldingForm, type HoldingFormSubmitPayload } from "./HoldingForm";
import { HoldingsList } from "./HoldingsList";

function latestQuoteFetchedAt(fetchedAtIso: string[]): string | null {
  if (!fetchedAtIso.length) {
    return null;
  }
  let best = fetchedAtIso[0];
  let bestMs = new Date(best).getTime();
  for (const iso of fetchedAtIso.slice(1)) {
    const ms = new Date(iso).getTime();
    if (!Number.isNaN(ms) && ms > bestMs) {
      best = iso;
      bestMs = ms;
    }
  }
  return Number.isNaN(bestMs) ? null : best;
}

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
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  const loadHoldings = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await listHoldingsByPortfolio(portfolioId);
      setHoldings(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load holdings.";
      setError(message);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
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

  const handleCloseEditModal = useCallback(() => {
    setEditingHolding(null);
    setUpdateError(null);
  }, []);

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

  const handleRefreshPrices = async () => {
    setIsRefreshingPrices(true);
    setActionMessage(null);
    setError(null);
    try {
      const result = await refreshPortfolioPrices(portfolioId);
      const noteText = result.notes?.length ? result.notes.join(" ") : "";
      if (result.skipped_count > 0 && noteText) {
        setActionMessage(noteText);
      } else if (result.updated_count > 0) {
        const failHint =
          result.failed_count > 0
            ? ` ${result.failed_count} ticker(s) could not be updated.`
            : "";
        const latestIso = latestQuoteFetchedAt(
          result.updated_quotes.map((q) => q.fetched_at),
        );
        const asOf =
          latestIso !== null
            ? ` Finnhub quote time: ${formatDate(latestIso)}.`
            : "";
        setActionMessage(
          `Live prices updated for ${result.updated_count} holding(s).${failHint}${asOf}`,
        );
      } else if (result.failed_count > 0) {
        setActionMessage(
          `No prices saved. ${result.failed_count} ticker(s) failed — check failures in API or Finnhub.`,
        );
      } else {
        setActionMessage(noteText || "Holdings reloaded.");
      }
      await loadHoldings({ silent: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to refresh live prices.";
      setError(message);
    } finally {
      setIsRefreshingPrices(false);
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
    <Card variant="workspace" className="space-y-4">
      <SectionHeader
        title="Holdings"
        description="Refresh prices fetches live quotes (Finnhub) and reloads this table. Estimated market value uses quantity × current price when a price is stored."
        actions={
          <>
            <Button
              variant="ghost"
              loading={isRefreshingPrices}
              onClick={() => void handleRefreshPrices()}
            >
              Refresh prices
            </Button>
            <Button variant="secondary" onClick={() => setIsCreateOpen((prev) => !prev)}>
              {isCreateOpen ? "Close Add Form" : "Add Holding"}
            </Button>
          </>
        }
      />

      {actionMessage ? (
        <p className="rounded-xl border border-piq-profit/35 bg-piq-profit/10 px-3 py-2 text-sm text-piq-profit">
          {actionMessage}
        </p>
      ) : null}

      {isCreateOpen ? (
        <div className="rounded-xl border border-white/15 bg-white/[0.04] p-4 backdrop-blur-sm">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-piq-accent">
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

      <Modal
        open={editingHolding !== null}
        onClose={handleCloseEditModal}
        title={editingHolding ? `Edit Holding: ${editingHolding.ticker}` : "Edit Holding"}
      >
        {editingHolding ? (
          <HoldingForm
            key={editingHolding.id}
            initialValues={{
              ticker: editingHolding.ticker,
              quantity: String(editingHolding.quantity),
              average_cost: String(editingHolding.average_cost),
            }}
            submitLabel="Save Changes"
            isSubmitting={isUpdating}
            submitError={updateError}
            onSubmit={handleUpdate}
            onCancel={handleCloseEditModal}
          />
        ) : null}
      </Modal>
    </Card>
  );
}
