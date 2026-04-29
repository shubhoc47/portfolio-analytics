import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";

import { getHoldingSectorSuggestion } from "../../../api/holdings";
import { searchSymbols, type SymbolSearchResult } from "../../../api/marketData";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { HOLDING_SECTOR_OPTIONS } from "../sectorOptions";

interface HoldingFormValues {
  ticker: string;
  sector: string;
  quantity: string;
  average_cost: string;
}

interface HoldingFormInitialValues extends Partial<HoldingFormValues> {
  company_name?: string | null;
}

export interface HoldingFormSubmitPayload {
  ticker: string;
  company_name?: string | null;
  sector: string;
  quantity: number;
  average_cost: number;
}

interface HoldingFormProps {
  initialValues?: HoldingFormInitialValues;
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
    sector: initialValues?.sector || "",
    quantity: initialValues?.quantity || "",
    average_cost: initialValues?.average_cost || "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSectorManuallySelected, setIsSectorManuallySelected] = useState(
    Boolean(initialValues?.sector),
  );
  const [sectorSuggestionMessage, setSectorSuggestionMessage] = useState<string | null>(null);
  const [acceptedTicker, setAcceptedTicker] = useState<string | null>(() => {
    const initialTicker = initialValues?.ticker?.trim().toUpperCase();
    return initialTicker || null;
  });
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolSearchResult | null>(null);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(
    initialValues?.company_name ?? null,
  );
  const [symbolSuggestions, setSymbolSuggestions] = useState<SymbolSearchResult[]>([]);
  const [isSymbolSearchOpen, setIsSymbolSearchOpen] = useState(false);
  const [isSymbolSearching, setIsSymbolSearching] = useState(false);
  const [symbolSearchError, setSymbolSearchError] = useState<string | null>(null);
  const [hasSymbolSearchCompleted, setHasSymbolSearchCompleted] = useState(false);
  const [activeSymbolIndex, setActiveSymbolIndex] = useState(-1);

  const setField = (field: keyof HoldingFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleTickerChange = (value: string) => {
    const nextTicker = value.trim().toUpperCase();
    setValues((prev) => ({
      ...prev,
      ticker: value,
      sector: isSectorManuallySelected ? prev.sector : "",
    }));
    if (acceptedTicker !== nextTicker) {
      setAcceptedTicker(null);
      setSelectedSymbol(null);
      setSelectedDescription(null);
    }
    if (!isSectorManuallySelected) {
      setSectorSuggestionMessage(null);
    }
  };

  const handleSymbolSelect = (result: SymbolSearchResult) => {
    setValues((prev) => ({
      ...prev,
      ticker: result.symbol,
      sector: isSectorManuallySelected ? prev.sector : "",
    }));
    setAcceptedTicker(result.symbol);
    setSelectedSymbol(result);
    setSelectedDescription(result.description || result.display_symbol);
    setSymbolSuggestions([]);
    setIsSymbolSearchOpen(false);
    setSymbolSearchError(null);
    setHasSymbolSearchCompleted(false);
    setActiveSymbolIndex(-1);
    if (!isSectorManuallySelected) {
      setSectorSuggestionMessage(null);
    }
  };

  const handleSectorChange = (value: string) => {
    setIsSectorManuallySelected(Boolean(value));
    setSectorSuggestionMessage(null);
    setField("sector", value);
  };

  useEffect(() => {
    const query = values.ticker.trim();
    const normalizedQuery = query.toUpperCase();

    if (query.length < 2 || acceptedTicker === normalizedQuery) {
      setSymbolSuggestions([]);
      setIsSymbolSearchOpen(false);
      setIsSymbolSearching(false);
      setSymbolSearchError(null);
      setHasSymbolSearchCompleted(false);
      setActiveSymbolIndex(-1);
      return;
    }

    let isCancelled = false;
    setIsSymbolSearching(true);
    setSymbolSearchError(null);
    setHasSymbolSearchCompleted(false);
    setIsSymbolSearchOpen(true);
    setActiveSymbolIndex(-1);

    const timeoutId = window.setTimeout(() => {
      void searchSymbols(query)
        .then((results) => {
          if (isCancelled) {
            return;
          }
          setSymbolSuggestions(results);
          setHasSymbolSearchCompleted(true);
          setIsSymbolSearchOpen(true);
          setActiveSymbolIndex(results.length ? 0 : -1);
        })
        .catch((err) => {
          if (isCancelled) {
            return;
          }
          const message =
            err instanceof Error
              ? err.message
              : "Symbol search failed. Please try again.";
          setSymbolSuggestions([]);
          setSymbolSearchError(message);
          setHasSymbolSearchCompleted(true);
          setIsSymbolSearchOpen(true);
          setActiveSymbolIndex(-1);
        })
        .finally(() => {
          if (!isCancelled) {
            setIsSymbolSearching(false);
          }
        });
    }, 300);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [acceptedTicker, values.ticker]);

  useEffect(() => {
    const ticker = values.ticker.trim().toUpperCase();
    if (!ticker || values.sector || isSectorManuallySelected) {
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(() => {
      void getHoldingSectorSuggestion(ticker)
        .then((suggestion) => {
          if (
            isCancelled ||
            !suggestion.suggested_sector ||
            !HOLDING_SECTOR_OPTIONS.includes(
              suggestion.suggested_sector as (typeof HOLDING_SECTOR_OPTIONS)[number],
            )
          ) {
            return;
          }

          setValues((prev) => {
            if (prev.ticker.trim().toUpperCase() !== ticker || prev.sector) {
              return prev;
            }
            return { ...prev, sector: suggestion.suggested_sector ?? "" };
          });
          setSectorSuggestionMessage(
            `Suggested ${suggestion.suggested_sector} from existing ${ticker} holdings.`,
          );
        })
        .catch(() => {
          // Sector suggestions are best-effort; users can still select manually.
        });
    }, 350);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [isSectorManuallySelected, values.sector, values.ticker]);

  const handleSymbolKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsSymbolSearchOpen(false);
      setActiveSymbolIndex(-1);
      return;
    }

    if (!isSymbolSearchOpen || symbolSuggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSymbolIndex((prev) => (prev + 1) % symbolSuggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSymbolIndex((prev) =>
        prev <= 0 ? symbolSuggestions.length - 1 : prev - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeSymbolIndex >= 0) {
      event.preventDefault();
      handleSymbolSelect(symbolSuggestions[activeSymbolIndex]);
    }
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
    } else if (acceptedTicker !== ticker) {
      errors.ticker = symbolSearchError
        ? "Symbol search is unavailable. Please try again before saving."
        : "Select a valid ticker from the search suggestions.";
    }

    if (!values.sector) {
      errors.sector = "Sector is required.";
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
      company_name: selectedSymbol?.description || selectedDescription || null,
      sector: values.sector,
      quantity: Number(values.quantity),
      average_cost: Number(values.average_cost),
    });
  };

  return (
    <form className="space-y-4 sm:space-y-5" onSubmit={(event) => void handleSubmit(event)}>
      <div className="relative space-y-1">
        <label htmlFor="ticker" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Ticker or Company
        </label>
        <input
          id="ticker"
          name="ticker"
          placeholder="e.g. AAPL or Apple"
          value={values.ticker}
          onChange={(event) => handleTickerChange(event.target.value)}
          onFocus={() => {
            if (
              values.ticker.trim().length >= 2 &&
              acceptedTicker !== values.ticker.trim().toUpperCase()
            ) {
              setIsSymbolSearchOpen(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => setIsSymbolSearchOpen(false), 120);
          }}
          onKeyDown={handleSymbolKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isSymbolSearchOpen}
          aria-controls="symbol-search-results"
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-piq-canvas/90 dark:text-slate-100 dark:placeholder:text-slate-500 ${
            fieldErrors.ticker
              ? "border-piq-loss/60 focus:border-piq-loss focus:ring-piq-loss/25 dark:border-piq-loss/50 dark:focus:border-piq-loss"
              : "border-slate-300 focus:border-piq-accent focus:ring-piq-accent/30 dark:border-white/15 dark:focus:border-piq-accent/70 dark:focus:ring-piq-accent/25"
          }`}
        />
        {isSymbolSearchOpen ? (
          <div
            id="symbol-search-results"
            role="listbox"
            className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/15 dark:bg-slate-950"
          >
            {isSymbolSearching ? (
              <p className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                Searching symbols...
              </p>
            ) : null}
            {!isSymbolSearching && symbolSearchError ? (
              <p className="px-3 py-2 text-sm text-piq-loss">{symbolSearchError}</p>
            ) : null}
            {!isSymbolSearching &&
            !symbolSearchError &&
            hasSymbolSearchCompleted &&
            symbolSuggestions.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                No matching symbols found.
              </p>
            ) : null}
            {!isSymbolSearching && !symbolSearchError
              ? symbolSuggestions.map((result, index) => (
                  <button
                    key={`${result.provider}-${result.symbol}`}
                    type="button"
                    role="option"
                    aria-selected={index === activeSymbolIndex}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSymbolSelect(result);
                    }}
                    onMouseEnter={() => setActiveSymbolIndex(index)}
                    className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                      index === activeSymbolIndex
                        ? "bg-piq-accent/10 text-slate-950 dark:text-white"
                        : "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <span>
                      <span className="block font-semibold">{result.display_symbol}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {result.description || "No company description"}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {result.type || "Symbol"}
                    </span>
                  </button>
                ))
              : null}
          </div>
        ) : null}
        {fieldErrors.ticker ? (
          <p className="text-xs text-piq-loss dark:text-piq-loss">{fieldErrors.ticker}</p>
        ) : selectedDescription && acceptedTicker === values.ticker.trim().toUpperCase() ? (
          <p className="text-xs text-piq-profit">
            Selected {acceptedTicker}: {selectedDescription}
          </p>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Type at least 2 characters, then choose a valid symbol.
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="sector" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Sector
        </label>
        <select
          id="sector"
          name="sector"
          value={values.sector}
          onChange={(event) => handleSectorChange(event.target.value)}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 dark:bg-piq-canvas/90 dark:text-slate-100 ${
            fieldErrors.sector
              ? "border-piq-loss/60 focus:border-piq-loss focus:ring-piq-loss/25 dark:border-piq-loss/50 dark:focus:border-piq-loss"
              : "border-slate-300 focus:border-piq-accent focus:ring-piq-accent/30 dark:border-white/15 dark:focus:border-piq-accent/70 dark:focus:ring-piq-accent/25"
          }`}
        >
          <option value="">Choose a sector</option>
          {HOLDING_SECTOR_OPTIONS.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
        {fieldErrors.sector ? (
          <p className="text-xs text-piq-loss dark:text-piq-loss">{fieldErrors.sector}</p>
        ) : null}
        {!fieldErrors.sector && sectorSuggestionMessage ? (
          <p className="text-xs text-piq-profit">{sectorSuggestionMessage}</p>
        ) : null}
      </div>

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
        <p className="rounded-xl border border-piq-loss/25 bg-piq-loss/5 px-3 py-2 text-sm text-rose-800 dark:border-piq-loss/35 dark:bg-piq-loss/10 dark:text-piq-loss">
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
