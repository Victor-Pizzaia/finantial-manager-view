export function getBackendApiUrl() {
  const baseUrl = process.env.FINANCE_API_URL ?? "http://localhost:8080/api/v1";
  return new URL(`${baseUrl.replace(/\/+$/, "")}/`);
}

export function getBackendUnavailableMessage() {
  const baseUrl = process.env.FINANCE_API_URL ?? "http://localhost:8080/api/v1";
  return `Não foi possível conectar ao backend em ${baseUrl}. Confirme se o Spring está em execução e se FINANCE_API_URL está correto.`;
}
