import type {
  GroqPlannerModelOutput,
  PlannerChatRequest,
} from "@/schemas/plannerChatApiSchema";
import {
  tripPlannerFormSchema,
  tripPlannerInputToFormValues,
  type TripPlannerFormValues,
  type TripPlannerInput,
} from "@/schemas/tripPlannerSchema";

export function mergeTripFormFromPatch(
  baseForm: TripPlannerFormValues,
  tripPatch: GroqPlannerModelOutput["tripPatch"],
): TripPlannerFormValues {
  const next = { ...baseForm };

  if (tripPatch.origin !== undefined) next.origin = tripPatch.origin;
  if (tripPatch.destination !== undefined) next.destination = tripPatch.destination;
  if (tripPatch.journeyType !== undefined) next.journeyType = tripPatch.journeyType;
  if (tripPatch.departureDate !== undefined) {
    next.departureDate = tripPatch.departureDate;
  }
  if (tripPatch.returnDate !== undefined) {
    next.returnDate = tripPatch.returnDate ?? "";
  }
  if (tripPatch.passengerCount !== undefined) {
    next.passengerCount = String(tripPatch.passengerCount);
  }
  if (tripPatch.cabinClass !== undefined) next.cabinClass = tripPatch.cabinClass;
  if (tripPatch.dateFlexibility !== undefined) {
    next.dateFlexibility = tripPatch.dateFlexibility;
  }
  if (tripPatch.monthlyPointsEstimate !== undefined) {
    next.monthlyPointsEstimate =
      tripPatch.monthlyPointsEstimate === null
        ? ""
        : String(tripPatch.monthlyPointsEstimate);
  }

  if (next.journeyType === "one_way") {
    next.returnDate = "";
  }

  return next;
}

export function mergeRewardsFromPatches(
  baseForm: TripPlannerFormValues,
  patches: GroqPlannerModelOutput["rewardsPatches"],
): TripPlannerFormValues["rewards"] {
  const rewards = [...baseForm.rewards];

  for (const patch of patches) {
    if (patch.action === "remove") {
      const index = rewards.findIndex((r) => r.programId === patch.programId);
      if (index >= 0) rewards.splice(index, 1);
      continue;
    }

    const index = rewards.findIndex((r) => r.programId === patch.programId);
    const existing = index >= 0 ? rewards[index] : null;
    const status = patch.balanceStatus ?? existing?.balanceStatus ?? "unknown";
    const balanceUnknown = status === "unknown";
    const entry = {
      programId: patch.programId,
      balanceStatus: balanceUnknown ? ("unknown" as const) : ("confirmed" as const),
      balanceUnknown,
      balancePoints: balanceUnknown
        ? ""
        : patch.balancePoints !== null && patch.balancePoints !== undefined
          ? String(patch.balancePoints)
          : (existing?.balancePoints ?? ""),
    };

    if (index >= 0) {
      rewards[index] = entry;
    } else {
      rewards.push(entry);
    }
  }

  return rewards;
}

export function resolveBaseTripForm(
  request: PlannerChatRequest,
): TripPlannerFormValues {
  if (request.validatedTripInput) {
    return tripPlannerInputToFormValues(request.validatedTripInput);
  }
  return request.tripForm as TripPlannerFormValues;
}

export function mergePlannerChatState(
  request: PlannerChatRequest,
  modelOutput: GroqPlannerModelOutput,
): {
  mergedTripForm: TripPlannerFormValues;
  validatedTripInput: TripPlannerInput | null;
} {
  const baseForm = resolveBaseTripForm(request);
  let merged: TripPlannerFormValues = mergeTripFormFromPatch(
    baseForm,
    modelOutput.tripPatch,
  );
  merged = {
    ...merged,
    rewards: mergeRewardsFromPatches(merged, modelOutput.rewardsPatches),
  };

  const noteParts = [
    merged.naturalLanguageNote?.trim(),
    request.message.trim(),
  ].filter(Boolean);
  merged.naturalLanguageNote = noteParts.join("\n\n");

  const parsed = tripPlannerFormSchema.safeParse(merged);
  return {
    mergedTripForm: merged,
    validatedTripInput: parsed.success ? parsed.data : null,
  };
}
