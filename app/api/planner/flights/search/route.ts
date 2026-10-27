import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { handleFlightSearchPost } from "@/lib/flights/flight-search-handler";

export async function POST(request: Request) {
  return handleFlightSearchPost(request, { getAuthenticatedUser });
}
