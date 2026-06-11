import { create } from "zustand";

interface AppState {
  environment: "sandbox" | "production";
  isAdmin: boolean;
  sidebarCollapsed: boolean;
  toggleEnvironment: () => void;
  toggleAdmin: () => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  environment: "sandbox",
  isAdmin: false,
  sidebarCollapsed: false,
  toggleEnvironment: () =>
    set((state) => ({
      environment: state.environment === "sandbox" ? "production" : "sandbox",
    })),
  toggleAdmin: () => set((state) => ({ isAdmin: !state.isAdmin })),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
