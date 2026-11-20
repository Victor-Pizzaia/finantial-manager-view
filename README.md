# Personal Finance Manager

A small personal app for tracking income and expenses instead of using a spreadsheet.

## Project structure

```text
app/                  Routes and shared page layout
app/create/page.tsx   The /create page
components/ui/        Reusable interface components
```

Keep route pages in `app/` and reusable interface pieces in `components/`. Add data or feature folders when the app needs them.

## Run locally

```bash
npm run dev
```

Open http://localhost:3000. Use `npm run lint` to check the code and `npm run build` to verify a production build.

## Backend API

Copy `.env.example` to `.env.local` and set `FINANCE_API_URL` if the Spring API is not at `http://localhost:8080/api/v1`.

The create form loads categories from `GET /categories` and submits transactions to `POST /transactions` with `description`, `recurrence` (`FIXED` or `VARIABLE`), `amount`, `installments`, and `categoryId`. The home screen also calls `GET /transactions?referenceMonth=11&referenceYear=2026&paid=false&page=0&size=20`. It expects a paginated response with `content`, `totalElements`, `totalPages`, `number`, and `size`. Each item needs `id`, `description`, `recurrence`, `amount`, `installments`, `installmentReference`, `categoryName`, `paidAmount`, `paid`, `referenceMonth`, and `referenceYear`.
