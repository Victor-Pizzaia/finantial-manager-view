import { Suspense } from "react";
import Link from "next/link";
import { io } from "next/cache";
import {
  getOpenTransactions,
  type TransactionPage,
} from "@/lib/api/transactions";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Início">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-700 text-sm font-semibold text-white">
              F
            </span>
            <span>
              <span className="block text-sm font-semibold">Finanças</span>
              <span className="block text-xs text-stone-500">Controle pessoal</span>
            </span>
          </Link>
          <Link
            href="/create"
            className="text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700"
          >
            Novo lançamento
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <p className="mx-auto max-w-6xl px-5 py-10 text-sm text-stone-600 sm:px-8">
            Carregando lançamentos...
          </p>
        }
      >
        <MonthlyFinances searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function MonthlyFinances({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await io();
  const { page: requestedPage } = await searchParams;
  const today = new Date();
  const currentDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    month: "numeric",
    year: "numeric",
  }).formatToParts(today);
  const month = Number(currentDate.find((part) => part.type === "month")?.value);
  const year = Number(currentDate.find((part) => part.type === "year")?.value);
  const requestedPageNumber = Number(requestedPage);
  const page =
    Number.isInteger(requestedPageNumber) && requestedPageNumber > 0
      ? requestedPageNumber - 1
      : 0;
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(today);

  let transactions: TransactionPage | undefined;
  let loadError: string | null = null;
  try {
    transactions = await getOpenTransactions(month, year, page);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar os lançamentos.";
  }
  const currentPage = transactions?.number ?? page;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-stone-500">
            {monthLabel} de {year}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Em aberto
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Lançamentos não pagos deste mês.
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          Adicionar lançamento
        </Link>
      </div>

      <section aria-label="Resumo do mês" className="mt-8 border-y border-stone-200 py-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-sm text-stone-600">
            {transactions
              ? `${transactions.totalElements} ${
                  transactions.totalElements === 1 ? "lançamento" : "lançamentos"
                } em aberto`
              : "Lançamentos em aberto"}
          </p>
        </div>
      </section>

      {loadError ? (
        <section
          role="alert"
          className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-5"
        >
          <h2 className="font-medium text-red-950">
            Não foi possível carregar os lançamentos
          </h2>
          <p className="mt-1 text-sm text-red-900">{loadError}</p>
          <p className="mt-2 text-sm text-red-900">
            Configure <code>FINANCE_API_URL</code> e confirme que o endpoint GET
            está disponível.
          </p>
        </section>
      ) : transactions && transactions.content.length === 0 ? (
        <section className="mt-8 rounded-xl border border-dashed border-stone-300 px-5 py-10 text-center">
          <h2 className="font-medium">Tudo certo por aqui</h2>
          <p className="mt-1 text-sm text-stone-600">
            Não há lançamentos em aberto para este mês.
          </p>
        </section>
      ) : (
        <section aria-label="Lançamentos em aberto" className="mt-8">
          <ul className="divide-y divide-stone-200">
            {transactions?.content.map((finance) => (
              <li
                key={finance.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{finance.description}</h2>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900">
                      Pendente
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-600">
                    {finance.categoryName} · {finance.recurrence === "FIXED" ? "Fixo" : "Variável"} ·
                    {" "}Parcela {finance.installmentReference} de {finance.installments}
                  </p>
                </div>
                <p className="text-base font-semibold tabular-nums">
                  {money.format(finance.amount - finance.paidAmount)}
                </p>
              </li>
            ))}
          </ul>
          {transactions && transactions.totalPages > 1 && (
            <nav
              aria-label="Paginação dos lançamentos"
              className="mt-5 flex items-center justify-between border-t border-stone-200 pt-4"
            >
              {currentPage > 0 ? (
                <Link
                  href={`/?page=${currentPage}`}
                  className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  Anterior
                </Link>
              ) : (
                <span className="px-3 py-2 text-sm text-stone-400">Anterior</span>
              )}
              <span className="text-sm text-stone-600">
                Página {currentPage + 1} de {transactions.totalPages}
              </span>
              {currentPage + 1 < transactions.totalPages ? (
                <Link
                  href={`/?page=${currentPage + 2}`}
                  className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  Próxima
                </Link>
              ) : (
                <span className="px-3 py-2 text-sm text-stone-400">Próxima</span>
              )}
            </nav>
          )}
        </section>
      )}

      <p className="mt-8 text-xs text-stone-500">
        Exibindo até 20 lançamentos por página.
      </p>
    </div>
  );
}
