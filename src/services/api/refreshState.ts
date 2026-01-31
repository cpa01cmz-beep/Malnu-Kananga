// api/refreshState.ts - Token Refresh State Management

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

export function getIsRefreshing(): boolean {
  return isRefreshing;
}

export function setIsRefreshing(value: boolean): void {
  isRefreshing = value;
}

export function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

export function onTokenRefreshed(token: string | null): void {
  if (token) {
    refreshSubscribers.forEach(callback => callback(token));
  }
  refreshSubscribers = [];
}
