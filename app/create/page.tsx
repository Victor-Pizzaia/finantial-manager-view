"use client";

import { useState, useSyncExternalStore, type SubmitEvent } from "react";
import Button from "@/components/ui/button";

type Transaction = {
  id: string;
  name: string;
  type: string;
  inclusionDate: string;
  month: string;
  year: string;
  category: string;
  installments: number;
  installmentReference: number;
  value: number;
  total: number;
  paidAmount: number;
  remaining: number;
  endDate: string;
  paid: boolean;
};

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function subscribeToMonthChange() {
  return () => {};
}

function getCurrentMonth() {
  return months[new Date().getMonth()] ?? months[0];
}

function getServerMonth() {
  return "";
}

const categories = [
  "Alimentação",
  "Transporte",
  "Lazer",
  "Educação",
  "Moradia",
  "Saúde",
  "Pessoal",
  "Investimentos",
  "Emergência",
  "Taxas",
  "Mercado"
]

const inputClassName =
  "mt-1.5 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Create() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const currentMonth = useSyncExternalStore(
    subscribeToMonthChange,
    getCurrentMonth,
    getServerMonth,
  );
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const referenceMonth = selectedMonth ?? currentMonth;
  const currentMonthIndex = months.indexOf(currentMonth);
  const referenceMonths =
    currentMonthIndex < 0
      ? months
      : [...months.slice(currentMonthIndex), ...months.slice(0, currentMonthIndex)];
  const [value, setValue] = useState("");
  const [installments, setInstallments] = useState("1");
  const [paidAmount, setPaidAmount] = useState("0");

  const total = (Number(value) || 0) * (Number(installments) || 0);
  const remaining = total - (Number(paidAmount) || 0);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      name: String(data.get("name")),
      type: String(data.get("type")),
      inclusionDate: String(data.get("inclusionDate")),
      month: String(data.get("month")),
      year: String(data.get("year")),
      category: String(data.get("category")),
      installments: Number(data.get("installments")),
      installmentReference: Number(data.get("installmentReference")),
      value: Number(data.get("value")),
      total,
      paidAmount: Number(data.get("paidAmount")),
      remaining,
      endDate: String(data.get("endDate")),
      paid: data.get("paid") === "on",
    };

    setTransactions((current) => [transaction, ...current]);
    form.reset();
    setValue("");
    setInstallments("1");
    setPaidAmount("0");
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
    {/* Temporary header, we'll change this in the future */}
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/create" className="flex items-center gap-3" aria-label="Início">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-700 text-sm font-semibold text-white">
              F
            </span>
            <span>
              <span className="block text-sm font-semibold">Finanças</span>
              <span className="block text-xs text-stone-500">Controle pessoal</span>
            </span>
          </a>
          <span className="text-sm font-medium text-stone-600">Lançamentos</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-7">
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Novo lançamento
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Registre uma nova despesa ou receita.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <section aria-labelledby="details-heading">
            <h2 id="details-heading" className="text-base font-semibold">
              Informações do lançamento
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium sm:col-span-2">
                Lançamento
                <input
                  className={inputClassName}
                  name="name"
                  placeholder="Ex.: Conta de luz"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Tipo
                <select className={inputClassName} name="type" defaultValue="Recorrente">
                  <option>Fixo</option>
                  <option>Variável</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Inclusão
                <input className={inputClassName} name="inclusionDate" type="date" required />
              </label>
              <label className="text-sm font-medium">
                Mês referência
                <select
                  className={inputClassName}
                  name="month"
                  value={referenceMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  required
                >
                  {referenceMonth === "" && (
                    <option value="" disabled>
                      Carregando mês...
                    </option>
                  )}
                  {referenceMonths.map((month) => (
                    <option key={month}>{month}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Ano referência
                <input
                  className={inputClassName}
                  name="year"
                  type="number"
                  min="2000"
                  max="2100"
                  defaultValue="2026"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Categoria
                <select className={inputClassName} name="category" defaultValue="Moradia">
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section aria-labelledby="installments-heading" className="mt-8 border-t border-stone-200 pt-7">
            <h2 id="installments-heading" className="text-base font-semibold">
              Valores e parcelas
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium">
                Valor da parcela (R$)
                <input
                  className={inputClassName}
                  name="value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Parcelas
                <input
                  className={inputClassName}
                  name="installments"
                  type="number"
                  min="1"
                  step="1"
                  value={installments}
                  onChange={(event) => setInstallments(event.target.value)}
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Parcela referência
                <input
                  className={inputClassName}
                  name="installmentReference"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue="1"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Valor pago (R$)
                <input
                  className={inputClassName}
                  name="paidAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paidAmount}
                  onChange={(event) => setPaidAmount(event.target.value)}
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Data final
                <input className={inputClassName} name="endDate" type="date" />
              </label>
            </div>

            <div className="mt-6 grid gap-3 rounded-xl bg-stone-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-stone-500">Valor total</p>
                <p className="mt-1 text-lg font-semibold">{money.format(total)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500">Restante</p>
                <p className="mt-1 text-lg font-semibold">{money.format(remaining)}</p>
              </div>
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-5 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex w-fit items-center gap-3 text-sm font-medium">
              <input
                className="size-4 rounded border-stone-300 accent-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                name="paid"
                type="checkbox"
              />
              Lançamento pago
            </label>
            <Button type="submit" className="w-full sm:w-auto">
              Adicionar lançamento
            </Button>
          </div>
        </form>

        <section aria-labelledby="recent-heading" className="mt-10">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="recent-heading" className="text-lg font-semibold">
              Lançamentos adicionados
            </h2>
            <span className="text-sm text-stone-500">{transactions.length}</span>
          </div>
          {transactions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 px-5 py-8 text-center text-sm text-stone-500">
              Seus lançamentos adicionados aparecerão aqui.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-stone-100 text-xs text-stone-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Lançamento</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Referência</th>
                    <th className="px-4 py-3 font-medium">Categoria</th>
                    <th className="px-4 py-3 font-medium">Valor total</th>
                    <th className="px-4 py-3 font-medium">Restante</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 font-medium">{transaction.name}</td>
                      <td className="px-4 py-3">{transaction.type}</td>
                      <td className="px-4 py-3">
                        {transaction.month} {transaction.year}
                      </td>
                      <td className="px-4 py-3">{transaction.category}</td>
                      <td className="px-4 py-3">{money.format(transaction.total)}</td>
                      <td className="px-4 py-3">{money.format(transaction.remaining)}</td>
                      <td className="px-4 py-3">
                        {transaction.paid ? "Pago" : "Em aberto"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 text-xs text-stone-500">
            Por enquanto, os lançamentos ficam nesta tela e não são salvos após recarregar.
          </p>
        </section>
      </div>
    </main>
  );
}
