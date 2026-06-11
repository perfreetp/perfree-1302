import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Download,
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { callStats, callLogs, applications } from "@/mock";

export default function Monitor() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedApp, setSelectedApp] = useState("all");

  const stats = {
    totalCalls: callStats.reduce((sum, s) => sum + s.count, 0),
    successRate: Math.round(
      (callStats.reduce((sum, s) => sum + s.successCount, 0) /
        callStats.reduce((sum, s) => sum + s.count, 0)) *
        100
    ),
    avgResponseTime: Math.round(
      callStats.reduce((sum, s) => sum + s.avgResponseTime, 0) / callStats.length
    ),
    errorCount: callStats.reduce((sum, s) => sum + s.errorCount, 0),
  };

  const chartData = callStats.map((s) => ({
    date: s.date.slice(5),
    调用量: s.count,
    成功数: s.successCount,
    错误数: s.errorCount,
    响应时间: s.avgResponseTime,
  }));

  const timeRanges = [
    { value: "1d", label: "今日" },
    { value: "7d", label: "近7天" },
    { value: "30d", label: "近30天" },
    { value: "90d", label: "近90天" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">调用监控</h1>
          <p className="text-dark-400 mt-1">实时监控 API 调用情况和性能指标</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary btn-sm gap-2">
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      {/* Time Range & Filter */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  timeRange === range.value
                    ? "bg-primary-500/20 text-primary-400 font-medium"
                    : "text-dark-400 hover:text-white hover:bg-dark-800"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="input w-48 py-2 text-sm"
            >
              <option value="all">全部应用</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
            <button className="btn-secondary btn-sm gap-2">
              <Filter className="w-4 h-4" />
              筛选
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          {
            label: "总调用量",
            value: stats.totalCalls.toLocaleString(),
            change: "+12.5%",
            trend: "up",
            icon: BarChart3,
            color: "primary",
          },
          {
            label: "调用成功率",
            value: `${stats.successRate}%`,
            change: "+0.8%",
            trend: "up",
            icon: CheckCircle2,
            color: "green",
          },
          {
            label: "平均响应时间",
            value: `${stats.avgResponseTime}ms`,
            change: "-5ms",
            trend: "down",
            icon: Clock,
            color: "accent",
          },
          {
            label: "错误调用数",
            value: stats.errorCount.toLocaleString(),
            change: "+2.3%",
            trend: "up",
            icon: AlertTriangle,
            color: "warning",
          },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.color === "primary"
                      ? "bg-primary-500/20"
                      : item.color === "green"
                      ? "bg-green-500/20"
                      : item.color === "accent"
                      ? "bg-accent-500/20"
                      : "bg-warning-500/20"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      item.color === "primary"
                        ? "text-primary-400"
                        : item.color === "green"
                        ? "text-green-400"
                        : item.color === "accent"
                        ? "text-accent-400"
                        : "text-warning-400"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-medium flex items-center gap-1 ${
                    item.trend === "up" && item.color !== "warning"
                      ? "text-green-400"
                      : item.trend === "down" && item.color === "warning"
                      ? "text-green-400"
                      : "text-warning-400"
                  }`}
                >
                  {item.trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {item.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{item.value}</p>
              <p className="text-sm text-dark-400">{item.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-400" />
              调用量趋势
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F52BA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F52BA" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#343A40" />
                <XAxis dataKey="date" stroke="#6C757D" fontSize={12} />
                <YAxis stroke="#6C757D" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#212529",
                    border: "1px solid #343A40",
                    borderRadius: "8px",
                    color: "#F8F9FA",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="调用量"
                  stroke="#0F52BA"
                  fillOpacity={1}
                  fill="url(#colorCalls)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent-400" />
              成功/失败分布
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#343A40" />
                <XAxis dataKey="date" stroke="#6C757D" fontSize={12} />
                <YAxis stroke="#6C757D" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#212529",
                    border: "1px solid #343A40",
                    borderRadius: "8px",
                    color: "#F8F9FA",
                  }}
                />
                <Legend />
                <Bar dataKey="成功数" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="错误数" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning-400" />
            响应时间趋势
          </h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#343A40" />
              <XAxis dataKey="date" stroke="#6C757D" fontSize={12} />
              <YAxis stroke="#6C757D" fontSize={12} unit="ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#212529",
                  border: "1px solid #343A40",
                  borderRadius: "8px",
                  color: "#F8F9FA",
                }}
              />
              <Line
                type="monotone"
                dataKey="响应时间"
                stroke="#00B4D8"
                strokeWidth={2}
                dot={{ fill: "#00B4D8", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Call Logs */}
      <div className="card">
        <div className="p-6 border-b border-dark-800 flex items-center justify-between">
          <h3 className="font-semibold text-white">调用日志</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
              <input
                type="text"
                placeholder="搜索请求ID、接口名..."
                className="input pl-10 w-64 py-2 text-sm"
              />
            </div>
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
                  接口名称
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                  方法
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                  状态码
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                  响应时间
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                  应用
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">
                  请求ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {callLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-dark-900/50">
                  <td className="px-6 py-4">
                    <span className="text-sm text-dark-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">
                      {log.apiName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded ${
                        log.method === "GET"
                          ? "bg-green-500/10 text-green-400"
                          : log.method === "POST"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        log.statusCode === 200
                          ? "text-green-400"
                          : "text-warning-400"
                      }`}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-dark-300">
                      {log.responseTime}ms
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-dark-300">{log.appName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs font-mono text-dark-400">
                      {log.requestId.slice(0, 16)}...
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-dark-800 flex items-center justify-between">
          <span className="text-sm text-dark-400">
            显示 1-10 条，共 {callLogs.length} 条
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
              上一页
            </button>
            <button className="px-3 py-1.5 text-sm bg-primary-500/20 text-primary-400 rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-sm text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-sm text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
              3
            </button>
            <button className="px-3 py-1.5 text-sm text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors">
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
