import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { handlePlacesSearchGet } from "@/lib/flights/places-search-handler";

export async function GET(request: Request) {
  return handlePlacesSearchGet(request, { getAuthenticatedUser });
}
