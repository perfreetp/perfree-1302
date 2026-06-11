import { useState } from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  ChevronRight,
  BookOpen,
  Code2,
  AlertTriangle,
  History,
  Zap,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react";
import { apis } from "@/mock";
import type { Api } from "@/types";
import { useDataStore } from "@/store/dataStore";

type TabType = "overview" | "params" | "response" | "errors" | "versions";

export default function ApiDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { applications, addPermission } = useDataStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyAppId, setApplyAppId] = useState("");
  const [applyQuota, setApplyQuota] = useState("10000");
  const [applyReason, setApplyReason] = useState("");

  const api = apis.find((a) => a.id === id) || apis[0];

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodColor = (method: Api["method"]) => {
    switch (method) {
      case "GET":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "POST":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "PUT":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "DELETE":
        return "bg-red-500/10 text-red-400 border-red-500/30";
    }
  };

  const paramTabs: { key: TabType; label: string; icon: typeof BookOpen }[] = [
    { key: "overview", label: "接口说明", icon: BookOpen },
    { key: "params", label: "请求参数", icon: Code2 },
    { key: "response", label: "响应示例", icon: Zap },
    { key: "errors", label: "错误码", icon: AlertTriangle },
    { key: "versions", label: "版本说明", icon: History },
  ];

  const versions = [
    {
      version: api.version,
      date: "2024-05-20",
      changelog: ["性能优化，响应时间降低 50%", "新增返回字段扩展", "修复部分参数校验问题"],
      current: true,
    },
    {
      version: "v" + (parseFloat(api.version.slice(1)) - 0.1).toFixed(1),
      date: "2024-03-15",
      changelog: ["新字段支持", "优化参数校验", "文档更新"],
      current: false,
    },
    {
      version: "v" + (parseFloat(api.version.slice(1)) - 0.3).toFixed(1),
      date: "2024-01-10",
      changelog: ["接口首次发布", "基础功能上线"],
      current: false,
    },
  ];

  const handleApplyPermission = () => {
    if (!applyAppId) {
      alert("请先选择应用");
      return;
    }
    const app = applications.find((a) => a.id === applyAppId);
    addPermission({
      apiId: api.id,
      apiName: api.name,
      appId: app!.id,
      appName: app!.name,
      quota: parseInt(applyQuota, 10),
      expiresAt: "",
    });
    setShowApplyModal(false);
    setApplyAppId("");
    setApplyQuota("10000");
    setApplyReason("");
    alert("权限申请已提交！请在密钥与权限页查看审批状态。");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/apis")}
          className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div
              className={`px-3 py-1 rounded font-bold text-sm border ${getMethodColor(
                api.method
              )}`}
            >
              {api.method}
            </div>
            <h1 className="text-2xl font-bold text-white">{api.name}</h1>
            <span className="badge-success badge">已上线</span>
            <span className="text-xs text-dark-500 bg-dark-800 px-2 py-1 rounded">
              {api.version}
            </span>
          </div>
          <div className="flex items-center gap-5 text-sm text-dark-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {api.callCount.toLocaleString()} 次调用
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              平均响应 ~85ms
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              {api.category}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="btn-primary gap-2"
        >
          <Shield className="w-4 h-4" />
          申请权限
        </button>
      </div>

      {/* 调用地址 */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary-400" />
            调用地址
          </h3>
          <button
            onClick={() =>
              copyText(`https://api.example.com${api.path}`, "url")
            }
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
          >
            {copiedId === "url" ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制
              </>
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-2 rounded font-bold text-sm border flex-shrink-0 ${getMethodColor(
              api.method
            )}`}
          >
            {api.method}
          </div>
          <code className="flex-1 bg-dark-950 px-4 py-3 rounded-lg font-mono text-dark-200 border border-dark-800 text-sm">
            https://api.example.com{api.path}
          </code>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex items-center gap-1 px-6 border-b border-dark-800 overflow-x-auto">
          {paramTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "text-primary-400 border-primary-500"
                    : "text-dark-400 hover:text-white border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="font-semibold text-white text-lg mb-3">
                  接口描述
                </h3>
                <p className="text-dark-300 leading-relaxed">
                  {api.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-white text-lg mb-3">
                  接入流程
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { step: 1, title: "申请权限", desc: "提交接口权限申请" },
                    { step: 2, title: "获取密钥", desc: "创建应用获取 AppKey" },
                    { step: 3, title: "构造签名", desc: "按文档生成签名" },
                    { step: 4, title: "发起调用", desc: "发送 HTTP 请求" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="relative p-4 bg-dark-950 rounded-xl border border-dark-800"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold mb-3">
                        {item.step}
                      </div>
                      <h4 className="font-medium text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-dark-400">{item.desc}</p>
                      {i < 3 && (
                        <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 text-dark-600 bg-dark-900 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white text-lg mb-3">
                  使用限制
                </h3>
                <ul className="space-y-2 text-dark-300">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">•</span>
                    默认调用频率限制：100 次/秒，如有特殊需求可联系技术支持申请扩容
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">•</span>
                    所有请求必须携带签名参数，详见签名算法文档
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">•</span>
                    生产环境与沙箱环境使用独立的 AppKey 和数据，互不干扰
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-400 mt-1">•</span>
                    建议配置 IP 白名单以提升接口安全性
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "params" && (
            <div className="space-y-6">
              <h3 className="font-semibold text-white text-lg">
                请求参数 ({api.requestParams.length} 个)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark-950">
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        参数名
                      </th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        类型
                      </th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        位置
                      </th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        必填
                      </th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        说明
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {api.requestParams.map((param) => (
                      <tr
                        key={param.name}
                        className="border-b border-dark-800 last:border-0 hover:bg-dark-900/30"
                      >
                        <td className="px-5 py-4">
                          <code className="font-mono text-sm text-primary-400 bg-dark-800 px-2 py-1 rounded">
                            {param.name}
                          </code>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-dark-300 text-sm">
                            {param.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-2 py-1 rounded bg-dark-800 text-dark-300 uppercase">
                            {param.location}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {param.required ? (
                            <span className="text-warning-400 text-sm">
                              是
                            </span>
                          ) : (
                            <span className="text-dark-400 text-sm">否</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-dark-300 text-sm">
                            {param.description}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card p-5 bg-dark-950">
                <h4 className="font-medium text-white mb-3">请求示例</h4>
                <pre className="font-mono text-sm text-dark-200 bg-dark-900 p-4 rounded-lg overflow-x-auto">
{`curl -X ${api.method} 'https://api.example.com${api.path}${
  api.requestParams.length > 0 && api.requestParams[0].location === "query"
    ? `?${api.requestParams[0].name}=your_value`
    : ""
}' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer your_token' \\
  -H 'X-App-Key: your_app_key' \\
  -H 'X-Timestamp: ${Date.now()}' \\
  -H 'X-Sign: your_signature'`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "response" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white text-lg mb-4">
                  成功响应示例
                </h3>
                <pre className="font-mono text-sm text-dark-200 bg-dark-950 p-5 rounded-xl border border-dark-800 overflow-x-auto">
                  {api.responseExample}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold text-white text-lg mb-4">
                  返回字段说明
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-950">
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          字段
                        </th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          类型
                        </th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          说明
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          field: "code",
                          type: "number",
                          desc: "业务状态码，0 表示成功",
                        },
                        {
                          field: "message",
                          type: "string",
                          desc: "状态描述信息",
                        },
                        {
                          field: "data",
                          type: "object",
                          desc: "响应数据主体",
                        },
                      ].map((f) => (
                        <tr
                          key={f.field}
                          className="border-b border-dark-800 last:border-0"
                        >
                          <td className="px-5 py-4">
                            <code className="font-mono text-sm text-accent-400">
                              {f.field}
                            </code>
                          </td>
                          <td className="px-5 py-4 text-dark-300 text-sm">
                            {f.type}
                          </td>
                          <td className="px-5 py-4 text-dark-300 text-sm">
                            {f.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "errors" && (
            <div className="space-y-6">
              <h3 className="font-semibold text-white text-lg">
                错误码列表
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-dark-950">
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        错误码
                      </th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        错误信息
                      </th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        详细说明
                      </th>
                      <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                        处理建议
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {api.errorCodes.map((err) => (
                      <tr
                        key={err.code}
                        className="border-b border-dark-800 last:border-0 hover:bg-dark-900/30"
                      >
                        <td className="px-5 py-4">
                          <code className="font-mono text-sm text-warning-400 bg-dark-800 px-2 py-1 rounded">
                            {err.code}
                          </code>
                        </td>
                        <td className="px-5 py-4 text-white text-sm">
                          {err.message}
                        </td>
                        <td className="px-5 py-4 text-dark-300 text-sm">
                          {err.description}
                        </td>
                        <td className="px-5 py-4 text-dark-400 text-sm">
                          请检查请求参数是否正确，如问题持续请提交工单
                        </td>
                      </tr>
                    ))}
                    <tr className="hover:bg-dark-900/30">
                      <td className="px-5 py-4">
                        <code className="font-mono text-sm text-warning-400 bg-dark-800 px-2 py-1 rounded">
                          50000
                        </code>
                      </td>
                      <td className="px-5 py-4 text-white text-sm">
                        系统内部错误
                      </td>
                      <td className="px-5 py-4 text-dark-300 text-sm">
                        服务器内部异常
                      </td>
                      <td className="px-5 py-4 text-dark-400 text-sm">
                        稍后重试，如持续出现请联系技术支持
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "versions" && (
            <div className="space-y-4 max-w-4xl">
              <h3 className="font-semibold text-white text-lg">
                版本历史
              </h3>
              <div className="relative pl-8">
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-dark-800" />
                {versions.map((v, i) => (
                  <div key={v.version} className="relative pb-8 last:pb-0">
                    <div
                      className={`absolute -left-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        v.current
                          ? "bg-primary-500 text-white"
                          : "bg-dark-800 text-dark-400"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="card p-5 ml-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-lg font-bold ${
                              v.current ? "text-white" : "text-dark-400"
                            }`}
                          >
                            {v.version}
                          </span>
                          {v.current && (
                            <span className="badge-success badge">
                              当前版本
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-dark-500">
                          {v.date} 发布
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {v.changelog.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-dark-300 text-sm"
                          >
                            <ChevronRight className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 申请权限弹窗 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-md p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-6">申请接口权限</h3>
            <div className="space-y-4">
              <div>
                <label className="label">申请接口</label>
                <div className="input bg-dark-800/50 text-dark-400 cursor-not-allowed">
                  {api.name} ({api.method})
                </div>
              </div>
              <div>
                <label className="label">
                  关联应用 <span className="text-warning-400">*</span>
                </label>
                <select
                  value={applyAppId}
                  onChange={(e) => setApplyAppId(e.target.value)}
                  className="input"
                >
                  <option value="">请选择应用</option>
                  {applications
                    .filter((app) => app.status !== "deleted")
                    .map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="label">
                  每日调用额度 <span className="text-warning-400">*</span>
                </label>
                <input
                  type="number"
                  value={applyQuota}
                  onChange={(e) => setApplyQuota(e.target.value)}
                  placeholder="请输入每日调用次数额度"
                  className="input"
                />
              </div>
              <div>
                <label className="label">申请说明</label>
                <textarea
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  rows={3}
                  placeholder="请描述使用场景和业务需求（选填）"
                  className="input resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowApplyModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleApplyPermission}
                disabled={!applyAppId || !applyQuota}
                className="btn-primary"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
