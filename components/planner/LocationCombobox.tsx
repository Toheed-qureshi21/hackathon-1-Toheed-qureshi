"use client";

import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { fetchPlannerPlaces } from "@/lib/planner/client-api";
import type { PlannerPlaceOption } from "@/schemas/plannerLocationSchema";
import { cn } from "@/lib/utils";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type LocationComboboxProps = {
  id: string;
  label: ReactNode;
  value: string;
  iataCode: string;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  onChange: (next: { label: string; iataCode: string }) => void;
};

export function LocationCombobox({
  id,
  label,
  value,
  iataCode,
  disabled = false,
  placeholder,
  error,
  onChange,
}: LocationComboboxProps) {
  const listId = useId();
  const [query, setQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [options, setOptions] = useState<PlannerPlaceOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  const runSearch = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setOptions([]);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const { response, data } = await fetchPlannerPlaces(text);
      if (!response.ok || !data.ok) {
        setOptions([]);
        setSearchError(
          !data.ok ? data.error : "Unable to search airports right now.",
        );
        return;
      }
      setOptions(data.places);
    } catch {
      setSearchError("Network error while searching airports.");
      setOptions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const inputValue = isFocused ? query : value;

  function handleInputChange(text: string) {
    setQuery(text);
    onChange({ label: text, iataCode: "" });
    setIsOpen(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void runSearch(text);
    }, 280);
  }

  function selectOption(option: PlannerPlaceOption) {
    setQuery(option.label);
    onChange({ label: option.label, iataCode: option.iataCode });
    setIsOpen(false);
    setOptions([]);
  }

  return (
    <div className="relative grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        disabled={disabled}
        hasError={Boolean(error)}
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setQuery(value);
          setIsOpen(true);
          if (value.trim().length >= 2) void runSearch(value);
        }}
        onBlur={() => {
          setIsFocused(false);
          const label = query.trim() || value;
          const keepIata = Boolean(iataCode && label === value);
          onChange({ label, iataCode: keepIata ? iataCode : "" });
          window.setTimeout(() => setIsOpen(false), 150);
        }}
      />
      {iataCode ? (
        <p className="text-xs text-muted-foreground">
          Selected airport code:{" "}
          <span className="font-semibold text-foreground">{iataCode}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Search and select an airport — codes are not guessed from free text.
        </p>
      )}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {searchError ? (
        <p className="text-xs text-destructive" role="alert">
          {searchError}
        </p>
      ) : null}
      {isOpen && (options.length > 0 || isSearching) ? (
        <ul
          id={listId}
          className={cn(
            "scrollbar-thin absolute top-full z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-planner-lg border border-border bg-surface-planner-panel py-1 shadow-lg",
          )}
        >
          {isSearching ? (
            <li className="px-3 py-2 text-xs text-muted-foreground">Searching…</li>
          ) : null}
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-surface-planner-elevated"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                <span className="font-medium text-foreground">{option.label}</span>
                <span className="text-xs capitalize text-muted-foreground">
                  {option.type.replaceAll("_", " ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
