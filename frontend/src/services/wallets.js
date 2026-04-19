import { apiFetch } from "./api";

export function getWallets() {
  return apiFetch("/api/wallets");
}

export function createWallet(payload) {
  return apiFetch("/api/wallets", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
