// Cross-island reactive state, using Svelte 5 stores (writable). Could be runes-in-module
// but writable() composes more nicely with .svelte and .astro consumers.
import { writable } from "svelte/store";
import type { WorkspaceId } from "./data";

export type Theme = "amber" | "matrix" | "red-team";

export const workspace = writable<WorkspaceId>("hero");
export const theme = writable<Theme>("amber");

// Overlays
export const matrixOpen = writable(false);
export const snakeOpen = writable(false);

// Toasts
export type Toast = { id: string; ttl: string; body: string };
export const toasts = writable<Toast[]>([]);
export const pushToast = (ttl: string, body: string) => {
  const id = Math.random().toString(36).slice(2);
  toasts.update((t) => [...t, { id, ttl, body }]);
  setTimeout(() => toasts.update((t) => t.filter((x) => x.id !== id)), 4200);
};

// Cross-island command dispatch: terminal calls these to nav, toggle theme, open overlays.
export const cmdBus = {
  nav: (id: WorkspaceId) => workspace.set(id),
  setTheme: (t: Theme) => theme.set(t),
  openMatrix: () => matrixOpen.set(true),
  closeMatrix: () => matrixOpen.set(false),
  openSnake: () => snakeOpen.set(true),
  closeSnake: () => snakeOpen.set(false),
  toast: pushToast,
};

// Apply theme as a body class so global CSS picks it up.
if (typeof document !== "undefined") {
  theme.subscribe((t) => {
    document.body.classList.remove("red-team", "matrix-mode");
    if (t === "red-team") document.body.classList.add("red-team");
    if (t === "matrix") document.body.classList.add("matrix-mode");
  });
}
