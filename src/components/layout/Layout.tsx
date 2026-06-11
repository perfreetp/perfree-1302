import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export default function Layout() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      <div
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
