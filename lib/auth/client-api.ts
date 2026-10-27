type AuthSuccessResponse = {
  ok: true;
  status: string;
  redirectTo?: string;
  message?: string;
};

type AuthErrorResponse = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string | undefined>;
};

export type AuthApiResult =
  | AuthSuccessResponse
  | AuthErrorResponse;

export async function postAuthJson(
  path: string,
  body: Record<string, unknown>,
): Promise<{ response: Response; data: AuthApiResult }> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as AuthApiResult;
  return { response, data };
}
