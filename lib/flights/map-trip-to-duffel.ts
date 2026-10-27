import type { FlightSearchRequest } from "@/schemas/flightSearchSchema";
import type { cabinClassSchema } from "@/schemas/tripPlannerSchema";
import type { z } from "zod";

type AppCabinClass = z.infer<typeof cabinClassSchema>;

export type DuffelOfferRequestPayload = {
  slices: Array<{
    origin: string;
    destination: string;
    departure_date: string;
  }>;
  passengers: Array<{ type: "adult" }>;
  cabin_class: AppCabinClass;
};

export function mapTripToDuffelOfferRequest(
  request: FlightSearchRequest,
): DuffelOfferRequestPayload {
  const { trip, originIataCode, destinationIataCode } = request;

  const slices: DuffelOfferRequestPayload["slices"] = [
    {
      origin: originIataCode,
      destination: destinationIataCode,
      departure_date: trip.departureDate,
    },
  ];

  if (trip.journeyType === "return") {
    if (!trip.returnDate) {
      throw new Error("Return date is required for return journeys");
    }
    slices.push({
      origin: destinationIataCode,
      destination: originIataCode,
      departure_date: trip.returnDate,
    });
  }

  const passengers = Array.from({ length: trip.passengerCount }, () => ({
    type: "adult" as const,
  }));

  return {
    slices,
    passengers,
    cabin_class: trip.cabinClass,
  };
}
