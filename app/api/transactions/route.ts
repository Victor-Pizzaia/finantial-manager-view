import {
  getBackendApiUrl,
  getBackendUnavailableMessage,
} from "@/lib/api/backend";

type CreateTransactionRequest = {
  description: string;
  recurrence: "FIXED" | "VARIABLE";
  amount: number;
  installments: number;
  categoryId: string;
};

function isCreateTransactionRequest(
  value: unknown,
): value is CreateTransactionRequest {
  if (typeof value !== "object" || value === null) return false;

  const request = value as Record<string, unknown>;
  return (
    typeof request.description === "string" &&
    request.description.trim().length > 0 &&
    (request.recurrence === "FIXED" || request.recurrence === "VARIABLE") &&
    typeof request.amount === "number" &&
    Number.isFinite(request.amount) &&
    request.amount >= 0 &&
    typeof request.installments === "number" &&
    Number.isInteger(request.installments) &&
    request.installments >= 1 &&
    request.installments <= 32767 &&
    typeof request.categoryId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      request.categoryId,
    )
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isCreateTransactionRequest(body)) {
    return Response.json(
      { message: "Transaction details are missing or invalid." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(new URL("transactions", getBackendApiUrl()), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(errorBody || response.statusText, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("content-type") ?? "text/plain",
        },
      });
    }

    return new Response(null, { status: response.status });
  } catch {
    return Response.json(
      { message: getBackendUnavailableMessage() },
      { status: 502 },
    );
  }
}
