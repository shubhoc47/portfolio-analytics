import { useState, type FormEvent } from "react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

interface HoldingFormValues {
  ticker: string;
  quantity: string;
  average_cost: string;
}

export interface HoldingFormSubmitPayload {
  ticker: string;
  quantity: number;
  average_cost: number;
}

interface HoldingFormProps {
  initialValues?: Partial<HoldingFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (payload: HoldingFormSubmitPayload) => Promise<void>;
  onCancel?: () => void;
}

export function HoldingForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  submitError,
  onSubmit,
  onCancel,
}: HoldingFormProps) {
  const [values, setValues] = useState<HoldingFormValues>({
    ticker: initialValues?.ticker || "",
    quantity: initialValues?.quantity || "",
    average_cost: initialValues?.average_cost || "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = (field: keyof HoldingFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    const ticker = values.ticker.trim().toUpperCase();
    const quantity = Number(values.quantity);
    const averageCost = Number(values.average_cost);

    if (!ticker) {
      errors.ticker = "Ticker is required.";
    } else if (ticker.length > 32) {
      errors.ticker = "Ticker cannot be longer than 32 characters.";
    }

    if (!values.quantity.trim()) {
      errors.quantity = "Quantity is required.";
    } else if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0.";
    }

    if (!values.average_cost.trim()) {
      errors.average_cost = "Average cost is required.";
    } else if (!Number.isFinite(averageCost) || averageCost <= 0) {
      errors.average_cost = "Average cost must be greater than 0.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      ticker: values.ticker.trim().toUpperCase(),
      quantity: Number(values.quantity),
      average_cost: Number(values.average_cost),
    });
  };

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <Input
        label="Ticker"
        name="ticker"
        placeholder="e.g. AAPL"
        value={values.ticker}
        onChange={(event) => setField("ticker", event.target.value)}
        error={fieldErrors.ticker}
      />

      <Input
        label="Quantity"
        name="quantity"
        type="number"
        min="0"
        step="any"
        placeholder="e.g. 10"
        value={values.quantity}
        onChange={(event) => setField("quantity", event.target.value)}
        error={fieldErrors.quantity}
      />

      <Input
        label="Average Cost"
        name="average_cost"
        type="number"
        min="0"
        step="any"
        placeholder="e.g. 180"
        value={values.average_cost}
        onChange={(event) => setField("average_cost", event.target.value)}
        error={fieldErrors.average_cost}
      />

      {submitError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitError}
        </p>
      ) : null}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
