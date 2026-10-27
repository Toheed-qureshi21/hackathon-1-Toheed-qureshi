import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { handleRewardsEvaluationPost } from "@/lib/rewards/rewards-evaluation-handler";

export async function POST(request: Request) {
  return handleRewardsEvaluationPost(request, { getAuthenticatedUser });
}
