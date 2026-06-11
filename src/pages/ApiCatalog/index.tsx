import {
  Search,
  ChevronRight,
  TrendingUp,
  Clock,
  BookOpen,
  Lock,
  Tag,
  Filter,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  Truck,
  Bell,
  Layers,
} from "lucide-react";
import { apis, apiCategories } from "@/mock";
import type { Api } from "@/types";
import { useNavigate } from "react-router-dom";
import { useDataStore } from "@/store/dataStore";

export default function ApiCatalog() {
  const navigate = useNavigate();
  const { catalogFilter, setCatalogFilter } = useDataStore();

  const selectedCategory = catalogFilter.category;
  const searchText = catalogFilter.search;
  const selectedVersion = catalogFilter.version;

  const categoryIcons: Record<string, typeof Users> = {
    "用户服务": Users,
    "订单服务": ShoppingCart,
    "商品服务": Package,
    "支付服务": CreditCard,
    "物流服务": Truck,
    "消息通知": Bell,
  };

  const filteredApis = apis.filter((api) => {
    const matchesCategory =
      selectedCategory === "all" || api.category === selectedCategory;
    const matchesSearch =
      searchText.trim() === "" ||
      api.name.toLowerCase().includes(searchText.toLowerCase()) ||
      api.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesVersion =
      selectedVersion === "all" || api.version === selectedVersion;
    return matchesCategory && matchesSearch && matchesVersion;
  });

  const getMethodColor = (method: Api["method"]) => {
    switch (method) {
      case "GET":
        return "bg-green-500/10 text-green-400";
      case "POST":
        return "bg-blue-500/10 text-blue-400";
      case "PUT":
        return "bg-yellow-500/10 text-yellow-400";
      case "DELETE":
        return "bg-red-500/10 text-red-400";
    }
  };

  const getStatusBadge = (status: Api["status"]) => {
    switch (status) {
      case "online":
        return <span className="badge-success badge">已上线</span>;
      case "beta":
        return <span className="badge-warning badge">测试中</span>;
      case "offline":
        return <span className="badge-default badge">已下线</span>;
    }
  };

  const allVersions = Array.from(new Set(apis.map((a) => a.version))).sort(
    (a, b) => parseFloat(b.slice(1)) - parseFloat(a.slice(1))
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-128px)] animate-fade-in">
      <div className="w-64 flex-shrink-0">
        <div className="card p-4 sticky top-24">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary-400" />
            接口分类
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setCatalogFilter({ category: "all" })}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-dark-300 hover:bg-dark-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  全部接口
                </span>
                <span className="text-xs text-dark-500">{apis.length}</span>
              </button>
            </li>
            {apiCategories.map((cat) => {
              const Icon = categoryIcons[cat.name] || Layers;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => setCatalogFilter({ category: cat.name })}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-colors ${
                      selectedCategory === cat.name
                        ? "bg-primary-500/10 text-primary-400"
                        : "text-dark-300 hover:bg-dark-800 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </span>
                    <span className="text-xs text-dark-500">{cat.apiCount}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">接口目录</h1>
            <p className="text-dark-400 mt-1">
              {selectedCategory === "all"
                ? "浏览所有开放接口"
                : `${selectedCategory} - 共 ${filteredApis.length} 个接口`}
            </p>
          </div>
        </div>

        <div className="card p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                placeholder="搜索接口名称、描述..."
                value={searchText}
                onChange={(e) => setCatalogFilter({ search: e.target.value })}
                className="input pl-10 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-dark-400" />
              <select
                value={selectedVersion}
                onChange={(e) => setCatalogFilter({ version: e.target.value })}
                className="input w-32 py-2"
              >
                <option value="all">全部版本</option>
                {allVersions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-dark-400 ml-auto">
              共{" "}
              <span className="text-white font-medium">
                {filteredApis.length}
              </span>{" "}
              个接口
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {filteredApis.map((api, index) => (
            <div
              key={api.id}
              onClick={() => navigate(`/apis/${api.id}`)}
              className="card card-hover p-5 cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${getMethodColor(
                      api.method
                    )}`}
                  >
                    {api.method}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {api.name}
                  </h3>
                  {getStatusBadge(api.status)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dark-400 bg-dark-800 px-2 py-1 rounded">
                    {api.version}
                  </span>
                  <ChevronRight className="w-5 h-5 text-dark-500" />
                </div>
              </div>

              <p className="text-dark-400 text-sm mb-4">{api.description}</p>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-dark-500" />
                  <span className="text-sm text-dark-400">{api.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-dark-500" />
                  <span className="text-sm text-dark-400">
                    {api.callCount.toLocaleString()} 次调用
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-dark-500" />
                  <span className="text-sm text-dark-400">响应时间 ~85ms</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Lock className="w-4 h-4 text-warning-400" />
                  <span className="text-xs text-warning-400">需申请权限</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-800">
                <code className="text-sm font-mono text-dark-300 bg-dark-950 px-3 py-1.5 rounded-lg">
                  {api.method} {api.path}
                </code>
              </div>
            </div>
          ))}

          {filteredApis.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-dark-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                未找到相关接口
              </h3>
              <p className="text-dark-400">试试其他关键词或分类吧</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
