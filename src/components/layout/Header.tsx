import { Bell, User, ChevronDown, FlaskConical, Globe, Settings, LogOut, Shield, UserCircle, CheckCheck } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { environment, isAdmin, toggleEnvironment, toggleAdmin } = useAppStore();
  const { messages, markMessageRead, markAllMessagesRead } = useDataStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-dark-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleEnvironment}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              environment === "sandbox"
                ? "bg-accent-500/10 text-accent-400 border border-accent-500/30"
                : "bg-primary-500/10 text-primary-400 border border-primary-500/30"
            }`}
          >
            {environment === "sandbox" ? (
              <FlaskConical className="w-4 h-4" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            {environment === "sandbox" ? "沙箱环境" : "生产环境"}
          </button>
        </div>

        <button
          onClick={toggleAdmin}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isAdmin
              ? "bg-warning-500/10 text-warning-400 border border-warning-500/30"
              : "bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-600"
          }`}
        >
          {isAdmin ? <Shield className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
          {isAdmin ? "管理员模式" : "开发者模式"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-warning-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-dark-800 rounded-xl border border-dark-700 shadow-lg overflow-hidden animate-slide-in-right">
              <div className="p-4 border-b border-dark-700">
                <h3 className="font-semibold text-white">消息通知</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {messages.slice(0, 5).map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 border-b border-dark-700 last:border-b-0 hover:bg-dark-700/50 cursor-pointer transition-colors ${
                      !msg.read ? "bg-primary-500/5" : ""
                    }`}
                    onClick={() => {
                      if (msg.link) {
                        navigate(msg.link);
                      } else {
                        navigate("/tickets");
                      }
                      markMessageRead(msg.id);
                      setShowNotifications(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          msg.type === "approval"
                            ? "bg-green-500"
                            : msg.type === "system"
                            ? "bg-warning-500"
                            : "bg-primary-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{msg.title}</p>
                        <p className="text-xs text-dark-400 mt-1 line-clamp-2">
                          {msg.content}
                        </p>
                        <p className="text-xs text-dark-500 mt-2">{msg.createdAt}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-dark-700 space-y-2">
                <button
                  onClick={() => {
                    markAllMessagesRead();
                  }}
                  className="w-full text-sm text-dark-300 hover:text-white hover:bg-dark-700/50 font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  全部标记已读
                </button>
                <button
                  onClick={() => {
                    navigate("/tickets");
                    setShowNotifications(false);
                  }}
                  className="w-full text-sm text-primary-400 hover:text-primary-300 font-medium"
                >
                  查看全部消息
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white">开发者账号</p>
              <p className="text-xs text-dark-400">企业开发者</p>
            </div>
            <ChevronDown className="w-4 h-4 text-dark-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-dark-800 rounded-xl border border-dark-700 shadow-lg overflow-hidden animate-slide-in-right">
              <div className="p-4 border-b border-dark-700">
                <p className="font-medium text-white">开发者账号</p>
                <p className="text-sm text-dark-400 mt-0.5">developer@example.com</p>
              </div>
              <div className="py-2">
                <button className="w-full px-4 py-2.5 text-left text-sm text-dark-200 hover:bg-dark-700 flex items-center gap-3 transition-colors">
                  <Settings className="w-4 h-4" />
                  账号设置
                </button>
                <button className="w-full px-4 py-2.5 text-left text-sm text-dark-200 hover:bg-dark-700 flex items-center gap-3 transition-colors">
                  <Shield className="w-4 h-4" />
                  安全中心
                </button>
                <div className="my-1 border-t border-dark-700" />
                <button className="w-full px-4 py-2.5 text-left text-sm text-warning-400 hover:bg-dark-700 flex items-center gap-3 transition-colors">
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
