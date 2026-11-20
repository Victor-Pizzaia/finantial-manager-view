export type OpenTransaction = {
  id: string;
  description: string;
  recurrence: "FIXED" | "VARIABLE";
  amount: number;
  installments: number;
  installmentReference: number;
  categoryName: string;
  paidAmount: number;
  paid: boolean;
  referenceMonth: number;
  referenceYear: number;
};

export type TransactionPage = {
  content: OpenTransaction[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

const pageSize = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOpenTransaction(value: unknown): value is OpenTransaction {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.description === "string" &&
    (value.recurrence === "FIXED" || value.recurrence === "VARIABLE") &&
    isNumber(value.amount) &&
    isNumber(value.installments) &&
    isNumber(value.installmentReference) &&
    typeof value.categoryName === "string" &&
    isNumber(value.paidAmount) &&
    typeof value.paid === "boolean" &&
    isNumber(value.referenceMonth) &&
    isNumber(value.referenceYear)
  );
}

function isTransactionPage(value: unknown): value is TransactionPage {
  return (
    isRecord(value) &&
    Array.isArray(value.content) &&
    value.content.every(isOpenTransaction) &&
    isNumber(value.totalElements) &&
    isNumber(value.totalPages) &&
    isNumber(value.number) &&
    isNumber(value.size)
  );
}

export async function getOpenTransactions(
  referenceMonth: number,
  referenceYear: number,
  page: number,
): Promise<TransactionPage> {
  const apiBaseUrl =
    process.env.FINANCE_API_URL ?? "http://localhost:8080/api/v1";
  const url = new URL("transactions", `${apiBaseUrl.replace(/\/+$/, "")}/`);

  url.searchParams.set("referenceMonth", String(referenceMonth));
  url.searchParams.set("referenceYear", String(referenceYear));
  url.searchParams.set("paid", "false");
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(pageSize));

  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error(`Cannot connect to the finance API at ${apiBaseUrl}.`);
  }

  if (!response.ok) {
    throw new Error(`Finance API returned ${response.status} ${response.statusText}.`);
  }

  const body: unknown = await response.json();
  if (!isTransactionPage(body)) {
    throw new Error("Finance API returned an unexpected transactions response.");
  }

  return body;
}
