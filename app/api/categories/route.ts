import {
  getBackendApiUrl,
  getBackendUnavailableMessage,
} from "@/lib/api/backend";

type Category = {
  id: string;
  name: string;
};

function isCategory(value: unknown): value is Category {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string"
  );
}

export async function GET() {
  try {
    const response = await fetch(new URL("categories", getBackendApiUrl()), {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return Response.json(
        { message: `Backend returned ${response.status} ${response.statusText}.` },
        { status: response.status },
      );
    }

    const body: unknown = await response.json();
    if (!Array.isArray(body) || !body.every(isCategory)) {
      return Response.json(
        { message: "Backend returned an unexpected categories response." },
        { status: 502 },
      );
    }

    return Response.json(body);
  } catch {
    return Response.json(
      {
        message: getBackendUnavailableMessage(),
      },
      { status: 502 },
    );
  }
}
