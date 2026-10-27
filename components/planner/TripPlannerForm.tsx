"use client";

import { RewardsEntriesEditor } from "@/components/planner/RewardsEntriesEditor";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { LocationCombobox } from "@/components/planner/LocationCombobox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { DISPLAY_DATE_HINT } from "@/lib/planner/dateDisplay";
import { plannerSectionLabelClassName } from "@/lib/plannerFieldStyles";
import {
  CABIN_CLASS_LABELS,
  DATE_FLEXIBILITY_LABELS,
  JOURNEY_TYPE_LABELS,
  type TripPlannerFormValues,
} from "@/schemas/tripPlannerSchema";
import { cn } from "@/lib/utils";

type TripPlannerFormProps = {
  values: TripPlannerFormValues;
  fieldErrors: Record<string, string | undefined>;
  formError: string | null;
  isSubmitting: boolean;
  submitLabel?: string;
  onChange: (values: TripPlannerFormValues) => void;
  onSubmit: () => void;
};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-xs text-destructive" role="alert">
      {message}
    </p>
  );
}

export function TripPlannerForm({
  values,
  fieldErrors,
  formError,
  isSubmitting,
  submitLabel = "Save trip details",
  onChange,
  onSubmit,
}: TripPlannerFormProps) {
  function patch(patch: Partial<TripPlannerFormValues>) {
    onChange({ ...values, ...patch });
  }

  return (
    <form
      className="space-y-8"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Trip requirements
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Required fields are marked with an asterisk (*). Natural-language
            notes are optional. Chat may help fill fields; cash search uses Duffel.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="trip-nl-note">Trip request in your own words (optional)</Label>
          <textarea
            id="trip-nl-note"
            rows={3}
            disabled={isSubmitting}
            value={values.naturalLanguageNote ?? ""}
            onChange={(e) => patch({ naturalLanguageNote: e.target.value })}
            placeholder="e.g. I want to fly from Mumbai to London in December for two adults, preferably business class…"
            className="scrollbar-thin max-h-40 w-full overflow-y-auto rounded-input border border-input bg-input-background px-3.5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25"
          />
          <p className="text-xs text-muted-foreground">
            This note is stored with your trip. Structured fields below are what
            we validate for search. Pick airports from suggestions for Duffel.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LocationCombobox
            id="trip-origin"
            label={
              <>
                Origin airport <span className="text-primary">*</span>
              </>
            }
            disabled={isSubmitting}
            value={values.origin}
            iataCode={values.originIataCode}
            error={fieldErrors.origin ?? fieldErrors.originIataCode}
            placeholder="Search Mumbai, BOM, Heathrow…"
            onChange={({ label, iataCode }) =>
              patch({ origin: label, originIataCode: iataCode })
            }
          />
          <LocationCombobox
            id="trip-destination"
            label={
              <>
                Destination airport <span className="text-primary">*</span>
              </>
            }
            disabled={isSubmitting}
            value={values.destination}
            iataCode={values.destinationIataCode}
            error={fieldErrors.destination ?? fieldErrors.destinationIataCode}
            placeholder="Search London, LHR, JFK…"
            onChange={({ label, iataCode }) =>
              patch({ destination: label, destinationIataCode: iataCode })
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="trip-journey">
              Journey type <span className="text-primary">*</span>
            </Label>
            <Select
              id="trip-journey"
              disabled={isSubmitting}
              value={values.journeyType}
              onChange={(e) =>
                patch({
                  journeyType: e.target.value as TripPlannerFormValues["journeyType"],
                  returnDate:
                    e.target.value === "one_way" ? "" : values.returnDate,
                })
              }
            >
              {Object.entries(JOURNEY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="trip-passengers">
              Passengers (adults) <span className="text-primary">*</span>
            </Label>
            <Input
              id="trip-passengers"
              inputMode="numeric"
              disabled={isSubmitting}
              hasError={Boolean(fieldErrors.passengerCount)}
              value={values.passengerCount}
              onChange={(e) =>
                patch({ passengerCount: e.target.value.replace(/\D/g, "") })
              }
              aria-describedby={
                fieldErrors.passengerCount ? "trip-passengers-error" : undefined
              }
            />
            <FieldError
              id="trip-passengers-error"
              message={fieldErrors.passengerCount}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="trip-departure">
              Departure date <span className="text-primary">*</span>
            </Label>
            <Input
              id="trip-departure"
              type="text"
              inputMode="numeric"
              disabled={isSubmitting}
              hasError={Boolean(fieldErrors.departureDate)}
              value={values.departureDate}
              placeholder={DISPLAY_DATE_HINT}
              onChange={(e) => patch({ departureDate: e.target.value })}
              aria-describedby={
                fieldErrors.departureDate ? "trip-departure-error" : undefined
              }
            />
            <FieldError
              id="trip-departure-error"
              message={fieldErrors.departureDate}
            />
          </div>
          {values.journeyType === "return" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="trip-return">
                Return date <span className="text-primary">*</span>
              </Label>
              <Input
                id="trip-return"
                type="text"
                inputMode="numeric"
                disabled={isSubmitting}
                hasError={Boolean(fieldErrors.returnDate)}
                value={values.returnDate ?? ""}
                placeholder={DISPLAY_DATE_HINT}
                onChange={(e) => patch({ returnDate: e.target.value })}
                aria-describedby={
                  fieldErrors.returnDate ? "trip-return-error" : undefined
                }
              />
              <FieldError
                id="trip-return-error"
                message={fieldErrors.returnDate}
              />
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="trip-cabin">
              Cabin class <span className="text-primary">*</span>
            </Label>
            <Select
              id="trip-cabin"
              disabled={isSubmitting}
              hasError={Boolean(fieldErrors.cabinClass)}
              value={values.cabinClass}
              onChange={(e) =>
                patch({
                  cabinClass: e.target.value as TripPlannerFormValues["cabinClass"],
                })
              }
            >
              {Object.entries(CABIN_CLASS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <FieldError id="trip-cabin-error" message={fieldErrors.cabinClass} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="trip-flex">
              Date flexibility <span className="text-primary">*</span>
            </Label>
            <Select
              id="trip-flex"
              disabled={isSubmitting}
              hasError={Boolean(fieldErrors.dateFlexibility)}
              value={values.dateFlexibility}
              onChange={(e) =>
                patch({
                  dateFlexibility: e.target
                    .value as TripPlannerFormValues["dateFlexibility"],
                })
              }
            >
              {Object.entries(DATE_FLEXIBILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <FieldError
              id="trip-flex-error"
              message={fieldErrors.dateFlexibility}
            />
          </div>
        </div>
      </section>

      <section className="border-t border-border pt-6">
        <RewardsEntriesEditor
          rewards={values.rewards}
          fieldErrors={fieldErrors}
          disabled={isSubmitting}
          onChange={(rewards) => patch({ rewards })}
        />
      </section>

      <section className="space-y-3 border-t border-border pt-6">
        <div className="grid gap-1.5">
          <Label htmlFor="trip-monthly-estimate">
            Estimated monthly points earned (optional)
          </Label>
          <Input
            id="trip-monthly-estimate"
            inputMode="numeric"
            disabled={isSubmitting}
            hasError={Boolean(fieldErrors.monthlyPointsEstimate)}
            value={values.monthlyPointsEstimate ?? ""}
            onChange={(e) =>
              patch({
                monthlyPointsEstimate: e.target.value.replace(/\D/g, ""),
              })
            }
            placeholder="Your estimate across relevant programs"
            aria-describedby={
              fieldErrors.monthlyPointsEstimate
                ? "trip-monthly-estimate-error"
                : undefined
            }
          />
          <FieldError
            id="trip-monthly-estimate-error"
            message={fieldErrors.monthlyPointsEstimate}
          />
          <p className="text-xs text-muted-foreground">
            User-provided estimate only — not calculated from card names or
            spending. Used later for points-shortfall forecasts.
          </p>
        </div>
      </section>

      {formError ? (
        <FormMessage variant="error">{formError}</FormMessage>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        className={cn(plannerSectionLabelClassName, "normal-case tracking-normal")}
      >
        {submitLabel}
      </Button>
    </form>
  );
}
