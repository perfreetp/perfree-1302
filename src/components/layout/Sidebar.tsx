import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  AppWindow,
  BookOpen,
  Terminal,
  Key,
  BarChart3,
  MessageSquare,
  Settings,
  Shield,
  FileText,
  Users,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

const developerNav = [
  { path: "/", label: "开发者门户", icon: Home },
  { path: "/apps", label: "应用管理", icon: AppWindow },
  { path: "/apis", label: "接口目录", icon: BookOpen },
  { path: "/debugger", label: "在线调试", icon: Terminal },
  { path: "/keys", label: "密钥与权限", icon: Key },
  { path: "/monitor", label: "调用监控", icon: BarChart3 },
  { path: "/tickets", label: "工单消息", icon: MessageSquare },
];

const adminNav = [
  { path: "/admin", label: "控制台", icon: Shield },
  { path: "/admin/audit", label: "入驻审核", icon: Users },
  { path: "/admin/apis", label: "接口管理", icon: Layers },
  { path: "/admin/permissions", label: "权限管理", icon: Key },
  { path: "/admin/monitor", label: "异常监控", icon: AlertTriangle },
  { path: "/admin/reports", label: "报表导出", icon: Download },
];

export default function Sidebar() {
  const { isAdmin, sidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();
  const navItems = isAdmin ? adminNav : developerNav;

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-dark-900 border-r border-dark-800 flex flex-col transition-all duration-300 z-40",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white whitespace-nowrap">
                API 开放平台
              </h1>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {isAdmin && (
          <div className="mb-4">
            {!sidebarCollapsed && (
              <p className="px-4 mb-2 text-xs font-medium text-dark-500 uppercase tracking-wider">
                管理后台
              </p>
            )}
          </div>
        )}

        {!isAdmin && (
          <div className="mb-4">
            {!sidebarCollapsed && (
              <p className="px-4 mb-2 text-xs font-medium text-dark-500 uppercase tracking-wider">
                开发者中心
              </p>
            )}
          </div>
        )}

        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "sidebar-link group",
                    active && "sidebar-link-active",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      active
                        ? "text-primary-400"
                        : "text-dark-400 group-hover:text-white"
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-dark-800">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-dark-400 hover:bg-dark-800 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
