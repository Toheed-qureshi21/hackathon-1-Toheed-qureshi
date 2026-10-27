import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { handlePlannerChatPost } from "@/lib/planner/planner-chat-handler";

export async function POST(request: Request) {
  return handlePlannerChatPost(request, { getAuthenticatedUser });
}
