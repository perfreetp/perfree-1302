import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Settings,
  Trash2,
  FlaskConical,
  Globe,
  Copy,
  Check,
  AppWindow,
  Clock,
  Layers,
} from "lucide-react";
import { applications } from "@/mock";
import type { Application } from "@/types";

export default function Apps() {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchText.toLowerCase()) ||
      app.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: Application["status"]) => {
    switch (status) {
      case "active":
        return <span className="badge-success badge">运行中</span>;
      case "inactive":
        return <span className="badge-default badge">已停用</span>;
      case "pending":
        return <span className="badge-warning badge">待审核</span>;
    }
  };

  const getEnvBadge = (env: Application["environment"]) => {
    if (env === "sandbox") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-500/10 text-accent-400">
          <FlaskConical className="w-3 h-3" />
          沙箱环境
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400">
        <Globe className="w-3 h-3" />
        生产环境
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">应用管理</h1>
          <p className="text-dark-400 mt-1">
            管理您的应用，查看凭证和配置
          </p>
        </div>
        <button className="btn-primary gap-2">
          <Plus className="w-5 h-5" />
          创建应用
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                placeholder="搜索应用..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input pl-10 w-72"
              />
            </div>
            <div className="flex items-center gap-1">
              {[
                { value: "all", label: "全部" },
                { value: "active", label: "运行中" },
                { value: "pending", label: "待审核" },
                { value: "inactive", label: "已停用" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setFilterStatus(item.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterStatus === item.value
                      ? "bg-primary-500/20 text-primary-400"
                      : "text-dark-400 hover:text-white hover:bg-dark-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="text-sm text-dark-400">
            共 <span className="text-white font-medium">{filteredApps.length}</span> 个应用
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredApps.map((app, index) => (
          <div
            key={app.id}
            className="card card-hover overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <AppWindow className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {app.name}
                    </h3>
                    <p className="text-sm text-dark-400 mt-0.5">
                      {app.category}
                    </p>
                  </div>
                </div>
                <div className="relative group">
                  <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-36 bg-dark-800 rounded-lg border border-dark-700 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button className="w-full px-3 py-2 text-left text-sm text-dark-200 hover:bg-dark-700 flex items-center gap-2 rounded-t-lg">
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-dark-200 hover:bg-dark-700 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      应用设置
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-warning-400 hover:bg-dark-700 flex items-center gap-2 rounded-b-lg">
                      <Trash2 className="w-4 h-4" />
                      删除应用
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-dark-400 mb-4 line-clamp-2">
                {app.description}
              </p>

              <div className="flex items-center gap-3 mb-4">
                {getStatusBadge(app.status)}
                {getEnvBadge(app.environment)}
              </div>

              {/* App Keys */}
              <div className="space-y-3 bg-dark-950 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-500">AppKey</span>
                  <button
                    onClick={() => copyToClipboard(app.appKey, `key-${app.id}`)}
                    className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    {copiedId === `key-${app.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        复制
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-sm text-dark-300 truncate">
                  {app.appKey}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-dark-800">
                  <span className="text-xs text-dark-500">AppSecret</span>
                  <button
                    onClick={() => copyToClipboard(app.appSecret, `secret-${app.id}`)}
                    className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  >
                    {copiedId === `secret-${app.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        复制
                      </>
                    )}
                  </button>
                </div>
                <p className="font-mono text-sm text-dark-300 truncate">
                  {'•'.repeat(app.appSecret.length)}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-dark-950/50 border-t border-dark-800 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-dark-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  创建于 {app.createdAt}
                </span>
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  3 个接口权限
                </span>
              </div>
              <button className="btn-secondary btn-sm">查看详情</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
