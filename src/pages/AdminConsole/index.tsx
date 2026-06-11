import { useState } from "react";
import {
  Shield,
  Users,
  Layers,
  Key,
  AlertTriangle,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Check,
  X,
  Eye,
  FileText,
  Settings,
  Plus,
  Calendar,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { partners, apis, callStats, permissions } from "@/mock";

type AdminTab = "dashboard" | "audit" | "apis" | "permissions" | "monitor" | "reports";

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchText, setSearchText] = useState("");

  const pendingPartners = partners.filter((p) => p.status === "pending");
  const pendingPermissions = permissions.filter((p) => p.status === "pending");

  const stats = [
    { label: "合作方总数", value: partners.length, change: "+3", trend: "up", icon: Users },
    { label: "开放接口", value: apis.length, change: "+5", trend: "up", icon: Layers },
    { label: "今日调用量", value: "128,560", change: "+12%", trend: "up", icon: BarChart3 },
    { label: "待审核", value: pendingPartners.length + pendingPermissions.length, change: "+2", trend: "up", icon: AlertTriangle },
  ];

  const categoryData = [
    { name: "用户服务", value: 35, color: "#0F52BA" },
    { name: "订单服务", value: 25, color: "#00B4D8" },
    { name: "商品服务", value: 20, color: "#10B981" },
    { name: "支付服务", value: 12, color: "#FF6B35" },
    { name: "物流服务", value: 8, color: "#8B5CF6" },
  ];

  const topPartners = partners
    .filter((p) => p.status === "approved")
    .sort((a, b) => b.totalCalls - a.totalCalls)
    .slice(0, 5);

  const tabs: { key: AdminTab; label: string; icon: typeof Shield }[] = [
    { key: "dashboard", label: "仪表盘", icon: BarChart3 },
    { key: "audit", label: "入驻审核", icon: Users },
    { key: "apis", label: "接口管理", icon: Layers },
    { key: "permissions", label: "权限管理", icon: Key },
    { key: "monitor", label: "异常监控", icon: AlertTriangle },
    { key: "reports", label: "报表导出", icon: Download },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-warning-400" />
            管理员控制台
          </h1>
          <p className="text-dark-400 mt-1">
            平台管理、审核和数据统计
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-dark-900 rounded-xl p-1.5 border border-dark-800 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-primary-500/20 text-primary-400 shadow-sm"
                  : "text-dark-400 hover:text-white hover:bg-dark-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <span
                      className={`text-sm font-medium flex items-center gap-1 ${
                        stat.trend === "up"
                          ? "text-green-400"
                          : "text-warning-400"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-dark-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-6">
            <div className="card p-6 col-span-2">
              <h3 className="font-semibold text-white mb-6">调用量趋势</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callStats.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#343A40" />
                    <XAxis
                      dataKey="date"
                      stroke="#6C757D"
                      fontSize={12}
                      tickFormatter={(v) => v.slice(5)}
                    />
                    <YAxis stroke="#6C757D" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#212529",
                        border: "1px solid #343A40",
                        borderRadius: "8px",
                        color: "#F8F9FA",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#0F52BA"
                      radius={[4, 4, 0, 0]}
                      name="调用量"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">接口分类占比</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#212529",
                        border: "1px solid #343A40",
                        borderRadius: "8px",
                        color: "#F8F9FA",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-dark-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Partners */}
          <div className="card">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">合作方调用排行</h3>
              <button className="text-sm text-primary-400 hover:text-primary-300">
                查看全部
              </button>
            </div>
            <div className="divide-y divide-dark-800">
              {topPartners.map((partner, index) => (
                <div
                  key={partner.id}
                  className="p-4 flex items-center justify-between hover:bg-dark-800/30"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? "bg-yellow-500/20 text-yellow-400"
                          : index === 1
                          ? "bg-gray-400/20 text-gray-400"
                          : index === 2
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-dark-700 text-dark-400"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{partner.name}</p>
                      <p className="text-xs text-dark-400">
                        {partner.appCount} 个应用
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {partner.totalCalls.toLocaleString()}
                    </p>
                    <p className="text-xs text-dark-400">累计调用</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">待审核入驻</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  placeholder="搜索合作方..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="input pl-10 w-64 py-2 text-sm"
                />
              </div>
            </div>
            <div className="divide-y divide-dark-800">
              {pendingPartners.length > 0 ? (
                pendingPartners.map((partner) => (
                  <div key={partner.id} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-white text-lg">
                          {partner.name}
                        </h4>
                        <p className="text-sm text-dark-400 mt-1">
                          申请时间：{partner.appliedAt}
                        </p>
                      </div>
                      <span className="badge-warning badge">待审核</span>
                    </div>
                    <div className="grid grid-cols-4 gap-6 mb-4">
                      <div>
                        <p className="text-xs text-dark-500 mb-1">联系人</p>
                        <p className="text-sm text-dark-200">
                          {partner.contact}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-500 mb-1">邮箱</p>
                        <p className="text-sm text-dark-200">
                          {partner.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-dark-500 mb-1">电话</p>
                        <p className="text-sm text-dark-200">
                          {partner.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="btn-primary btn-sm gap-2">
                        <Check className="w-4 h-4" />
                        通过审核
                      </button>
                      <button className="btn-secondary btn-sm gap-2">
                        <X className="w-4 h-4" />
                        拒绝
                      </button>
                      <button className="btn-secondary btn-sm gap-2 ml-auto">
                        <Eye className="w-4 h-4" />
                        查看详情
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-dark-500">
                  <Check className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                  <p>暂无待审核的入驻申请</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-6 border-b border-dark-800">
              <h3 className="font-semibold text-white">已通过审核</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-950">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      合作方名称
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      联系人
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      应用数
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      累计调用
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      入驻时间
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {partners
                    .filter((p) => p.status === "approved")
                    .map((partner) => (
                      <tr key={partner.id} className="hover:bg-dark-900/50">
                        <td className="px-6 py-4">
                          <span className="font-medium text-white">
                            {partner.name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-dark-300">
                            {partner.contact}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-dark-300">
                            {partner.appCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-dark-300">
                            {partner.totalCalls.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-dark-300 text-sm">
                            {partner.appliedAt}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-primary-400 hover:text-primary-300 text-sm">
                            详情
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "apis" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  placeholder="搜索接口..."
                  className="input pl-10 w-72"
                />
              </div>
              <select className="input w-40">
                <option>全部分类</option>
                <option>用户服务</option>
                <option>订单服务</option>
                <option>商品服务</option>
              </select>
            </div>
            <button className="btn-primary gap-2">
              <Plus className="w-5 h-5" />
              新增接口
            </button>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-950">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                    接口名称
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                    方法
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                    分类
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                    版本
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                    状态
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                    调用量
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                    可见范围
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {apis.map((api) => (
                  <tr key={api.id} className="hover:bg-dark-900/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{api.name}</p>
                      <p className="text-xs text-dark-500 font-mono mt-0.5">
                        {api.path}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          api.method === "GET"
                            ? "bg-green-500/10 text-green-400"
                            : api.method === "POST"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {api.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-dark-300">{api.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-dark-300">{api.version}</span>
                    </td>
                    <td className="px-6 py-4">
                      {api.status === "online" ? (
                        <span className="badge-success badge">已上线</span>
                      ) : api.status === "beta" ? (
                        <span className="badge-warning badge">测试中</span>
                      ) : (
                        <span className="badge-default badge">已下线</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-dark-300">
                        {api.callCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-dark-300 text-sm">全部可见</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="space-y-6">
          <div className="card">
            <div className="p-6 border-b border-dark-800">
              <h3 className="font-semibold text-white">待审批权限申请</h3>
            </div>
            {pendingPermissions.length > 0 ? (
              <div className="divide-y divide-dark-800">
                {pendingPermissions.map((perm) => (
                  <div key={perm.id} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-white">
                          {perm.apiName}
                        </h4>
                        <p className="text-sm text-dark-400">
                          申请应用：{perm.appName}
                        </p>
                      </div>
                      <span className="badge-warning badge">待审批</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm mb-4">
                      <div>
                        <span className="text-dark-500">申请时间：</span>
                        <span className="text-dark-300">{perm.appliedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="btn-primary btn-sm gap-2">
                        <Check className="w-4 h-4" />
                        通过
                      </button>
                      <button className="btn-secondary btn-sm gap-2">
                        <X className="w-4 h-4" />
                        拒绝
                      </button>
                      <button className="btn-secondary btn-sm gap-2 ml-auto">
                        <Eye className="w-4 h-4" />
                        查看详情
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-dark-500">
                <Check className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                <p>暂无待审批的权限申请</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="p-6 border-b border-dark-800">
              <h3 className="font-semibold text-white">全部权限</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-950">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      接口名称
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      应用
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      状态
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      额度
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      有效期
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {permissions.map((perm) => (
                    <tr key={perm.id} className="hover:bg-dark-900/50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">
                          {perm.apiName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-dark-300">{perm.appName}</span>
                      </td>
                      <td className="px-6 py-4">
                        {perm.status === "approved" ? (
                          <span className="badge-success badge">已授权</span>
                        ) : perm.status === "pending" ? (
                          <span className="badge-warning badge">审批中</span>
                        ) : (
                          <span className="badge-error badge">已拒绝</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-dark-300">
                          {perm.quota > 0
                            ? `${perm.quota.toLocaleString()} 次/天`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-dark-300 text-sm">
                          {perm.expiresAt || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary-400 hover:text-primary-300 text-sm mr-3">
                          延期
                        </button>
                        <button className="text-primary-400 hover:text-primary-300 text-sm">
                          调整额度
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "monitor" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "异常调用数", value: "23", color: "warning" },
              { label: "错误率", value: "1.2%", color: "warning" },
              { label: "超时请求", value: "8", color: "warning" },
              { label: "已处理", value: "15", color: "green" },
            ].map((item, index) => (
              <div key={index} className="card p-5">
                <p className="text-sm text-dark-400 mb-2">{item.label}</p>
                <p
                  className={`text-2xl font-bold ${
                    item.color === "warning"
                      ? "text-warning-400"
                      : "text-green-400"
                  }`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">异常调用列表</h3>
              <div className="flex items-center gap-3">
                <select className="input w-36 py-2 text-sm">
                  <option>全部类型</option>
                  <option>频率超限</option>
                  <option>参数错误</option>
                  <option>权限不足</option>
                  <option>系统错误</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-950">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      时间
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      接口
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      应用
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      错误类型
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      错误码
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      状态
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {[
                    {
                      time: "2024-06-12 14:32:15",
                      api: "创建订单",
                      app: "电商合作伙伴系统",
                      type: "频率超限",
                      code: "429",
                      status: "pending",
                    },
                    {
                      time: "2024-06-12 13:45:02",
                      api: "获取用户信息",
                      app: "金融风控应用",
                      type: "参数错误",
                      code: "40001",
                      status: "resolved",
                    },
                    {
                      time: "2024-06-12 12:20:33",
                      api: "发送短信",
                      app: "电商合作伙伴系统",
                      type: "系统错误",
                      code: "50001",
                      status: "pending",
                    },
                    {
                      time: "2024-06-12 11:10:08",
                      api: "支付下单",
                      app: "电商合作伙伴系统",
                      type: "权限不足",
                      code: "40301",
                      status: "resolved",
                    },
                  ].map((item, index) => (
                    <tr key={index} className="hover:bg-dark-900/50">
                      <td className="px-6 py-4">
                        <span className="text-dark-300 text-sm">
                          {item.time}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">
                          {item.api}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-dark-300 text-sm">
                          {item.app}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-warning-400 text-sm">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-mono text-dark-400 bg-dark-800 px-2 py-1 rounded">
                          {item.code}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === "pending" ? (
                          <span className="badge-warning badge">待处理</span>
                        ) : (
                          <span className="badge-success badge">已处理</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary-400 hover:text-primary-300 text-sm">
                          详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-400" />
              生成报表
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="label">报表类型</label>
                <select className="input">
                  <option>合作方用量报表</option>
                  <option>接口调用报表</option>
                  <option>错误统计报表</option>
                  <option>综合统计报表</option>
                </select>
              </div>
              <div>
                <label className="label">时间范围</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type="date"
                      className="input pl-10 text-sm"
                    />
                  </div>
                  <span className="text-dark-500">至</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type="date"
                      className="input pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">合作方</label>
                <select className="input">
                  <option>全部合作方</option>
                  <option>上海电商科技有限公司</option>
                  <option>深圳金融服务集团</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button className="btn-secondary">预览</button>
              <button className="btn-primary gap-2">
                <Download className="w-4 h-4" />
                导出 Excel
              </button>
            </div>
          </div>

          <div className="card">
            <div className="p-6 border-b border-dark-800">
              <h3 className="font-semibold text-white">历史报表</h3>
            </div>
            <div className="divide-y divide-dark-800">
              {[
                {
                  name: "2024年5月合作方用量报表.xlsx",
                  type: "合作方用量",
                  size: "2.3MB",
                  time: "2024-06-01 10:30",
                },
                {
                  name: "2024年Q2接口调用统计.xlsx",
                  type: "接口调用",
                  size: "5.1MB",
                  time: "2024-05-15 14:20",
                },
                {
                  name: "2024年4月错误统计报表.xlsx",
                  type: "错误统计",
                  size: "1.8MB",
                  time: "2024-05-05 09:00",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 flex items-center justify-between hover:bg-dark-800/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-xs text-dark-500 mt-0.5">
                        {item.type} · {item.size} · {item.time}
                      </p>
                    </div>
                  </div>
                  <button className="btn-secondary btn-sm gap-2">
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
