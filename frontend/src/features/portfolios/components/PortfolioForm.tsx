import { useState, type FormEvent } from "react";

import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import type { PortfolioUpdateInput } from "../../../types/portfolio";

interface PortfolioFormValues {
  name: string;
  description: string;
  base_currency: string;
  owner_name: string;
}

export interface PortfolioFormSubmitPayload extends PortfolioUpdateInput {
  name: string;
  base_currency: string;
}

interface PortfolioFormProps {
  initialValues?: Partial<PortfolioFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string | null;
  onSubmit: (payload: PortfolioFormSubmitPayload) => Promise<void>;
}

export function PortfolioForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  submitError,
  onSubmit,
}: PortfolioFormProps) {
  const [values, setValues] = useState<PortfolioFormValues>({
    name: initialValues?.name || "",
    description: initialValues?.description || "",
    base_currency: initialValues?.base_currency || "USD",
    owner_name: initialValues?.owner_name || "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setField = (field: keyof PortfolioFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!values.name.trim()) {
      errors.name = "Portfolio name is required.";
    }

    const currency = values.base_currency.trim().toUpperCase();
    if (!currency) {
      errors.base_currency = "Base currency is required.";
    } else if (currency.length < 3 || currency.length > 10) {
      errors.base_currency = "Use a currency code between 3 and 10 characters.";
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
      name: values.name.trim(),
      description: values.description.trim() || null,
      base_currency: values.base_currency.trim().toUpperCase(),
      owner_name: values.owner_name.trim() || null,
    });
  };

  return (
    <form className="space-y-4 sm:space-y-5" onSubmit={(event) => void handleSubmit(event)}>
      <Input
        label="Portfolio Name"
        name="name"
        placeholder="e.g. Long-Term Growth"
        value={values.name}
        onChange={(event) => setField("name", event.target.value)}
        error={fieldErrors.name}
      />

      <Textarea
        label="Description"
        name="description"
        rows={4}
        placeholder="Optional short description"
        value={values.description}
        onChange={(event) => setField("description", event.target.value)}
        error={fieldErrors.description}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Base Currency"
          name="base_currency"
          placeholder="USD"
          value={values.base_currency}
          onChange={(event) => setField("base_currency", event.target.value)}
          error={fieldErrors.base_currency}
        />
        <Input
          label="Owner Name"
          name="owner_name"
          placeholder="Optional owner name"
          value={values.owner_name}
          onChange={(event) => setField("owner_name", event.target.value)}
          error={fieldErrors.owner_name}
        />
      </div>

      {submitError ? (
        <p className="rounded-xl border border-piq-loss/25 bg-piq-loss/5 px-3 py-2 text-sm text-rose-800 dark:border-piq-loss/35 dark:bg-piq-loss/10 dark:text-piq-loss">
          {submitError}
        </p>
      ) : null}

      <div className="pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
