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
