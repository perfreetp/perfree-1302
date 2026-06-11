import { useState } from "react";
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Shield,
  Clock,
  AlertTriangle,
  Settings,
  FlaskConical,
  Globe,
} from "lucide-react";
import { permissions, applications } from "@/mock";
import { useAppStore } from "@/store/appStore";

export default function KeysPermissions() {
  const { environment } = useAppStore();
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [whitelist, setWhitelist] = useState([
    "192.168.1.1",
    "10.0.0.0/24",
    "172.16.0.0/16",
  ]);
  const [newIp, setNewIp] = useState("");
  const [selectedApp, setSelectedApp] = useState(applications[0]);

  const appKeys = [
    {
      id: "1",
      appKey: "AK20240612001",
      appSecret: "SK_abc123def456ghi789jkl012mno345",
      status: "active",
      createdAt: "2024-01-15 10:30",
      expiresAt: "2025-01-15 10:30",
    },
    {
      id: "2",
      appKey: "AK20240612002",
      appSecret: "SK_xyz789uvw012rst345opq678",
      status: "active",
      createdAt: "2024-03-20 14:00",
      expiresAt: "2025-03-20 14:00",
    },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleSecret = (id: string) => {
    setShowSecret((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addIp = () => {
    if (newIp && !whitelist.includes(newIp)) {
      setWhitelist([...whitelist, newIp]);
      setNewIp("");
    }
  };

  const removeIp = (ip: string) => {
    setWhitelist(whitelist.filter((item) => item !== ip));
  };

  const getPermissionStatus = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="badge-success badge">已授权</span>;
      case "pending":
        return <span className="badge-warning badge">审批中</span>;
      case "rejected":
        return <span className="badge-error badge">已拒绝</span>;
      default:
        return <span className="badge-default badge">未知</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">密钥与权限</h1>
          <p className="text-dark-400 mt-1">
            管理您的 API 密钥、白名单和接口权限
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedApp.id}
            onChange={(e) => {
              const app = applications.find((a) => a.id === e.target.value);
              if (app) setSelectedApp(app);
            }}
            className="input w-56"
          >
            {applications.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Environment Banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border ${
          environment === "sandbox"
            ? "bg-accent-500/10 border-accent-500/30"
            : "bg-primary-500/10 border-primary-500/30"
        }`}
      >
        {environment === "sandbox" ? (
          <FlaskConical className="w-5 h-5 text-accent-400" />
        ) : (
          <Globe className="w-5 h-5 text-primary-400" />
        )}
        <div>
          <p className="font-medium text-white">
            当前环境：{environment === "sandbox" ? "沙箱环境" : "生产环境"}
          </p>
          <p className="text-sm text-dark-400">
            {environment === "sandbox"
              ? "沙箱环境用于开发测试，调用数据不影响生产"
              : "生产环境为正式环境，请妥善保管密钥"}
          </p>
        </div>
      </div>

      {/* API Keys */}
      <div className="card">
        <div className="p-6 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">API 密钥</h2>
              <p className="text-sm text-dark-400">
                用于接口调用身份验证，请妥善保管
              </p>
            </div>
          </div>
          <button className="btn-primary btn-sm gap-2">
            <Plus className="w-4 h-4" />
            创建密钥
          </button>
        </div>

        <div className="p-6 space-y-4">
          {appKeys.map((key) => (
            <div
              key={key.id}
              className="bg-dark-950 rounded-xl p-5 border border-dark-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="badge-success badge">生效中</span>
                  <span className="text-sm text-dark-500">
                    创建于 {key.createdAt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSecret(key.id)}
                    className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
                    title={showSecret[key.id] ? "隐藏" : "显示"}
                  >
                    {showSecret[key.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-warning-400 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-500 font-medium">
                      AppKey
                    </span>
                    <button
                      onClick={() => copyToClipboard(key.appKey, `key-${key.id}`)}
                      className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                      {copiedKey === `key-${key.id}` ? (
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
                  <code className="block bg-dark-900 px-4 py-2.5 rounded-lg font-mono text-sm text-dark-200 border border-dark-700">
                    {key.appKey}
                  </code>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-dark-500 font-medium">
                      AppSecret
                    </span>
                    <button
                      onClick={() => copyToClipboard(key.appSecret, `secret-${key.id}`)}
                      className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                    >
                      {copiedKey === `secret-${key.id}` ? (
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
                  <code className="block bg-dark-900 px-4 py-2.5 rounded-lg font-mono text-sm text-dark-200 border border-dark-700">
                    {showSecret[key.id]
                      ? key.appSecret
                      : "•".repeat(key.appSecret.length)}
                  </code>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-dark-400">
                  <Clock className="w-4 h-4" />
                  有效期至：{key.expiresAt}
                </div>
                <button className="text-warning-400 hover:text-warning-300 text-xs font-medium flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  轮换密钥
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* IP Whitelist */}
        <div className="card">
          <div className="p-6 border-b border-dark-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">IP 白名单</h2>
              <p className="text-sm text-dark-400">
                设置允许调用 API 的 IP 地址
              </p>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addIp()}
                placeholder="输入 IP 地址或 IP 段"
                className="input flex-1 text-sm"
              />
              <button onClick={addIp} className="btn-secondary btn-sm gap-1">
                <Plus className="w-4 h-4" />
                添加
              </button>
            </div>

            <div className="space-y-2">
              {whitelist.map((ip) => (
                <div
                  key={ip}
                  className="flex items-center justify-between bg-dark-950 px-4 py-2.5 rounded-lg border border-dark-800"
                >
                  <code className="font-mono text-sm text-dark-200">{ip}</code>
                  <button
                    onClick={() => removeIp(ip)}
                    className="p-1.5 rounded hover:bg-dark-800 text-dark-500 hover:text-warning-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {whitelist.length === 0 && (
              <div className="text-center py-8 text-dark-500">
                <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无白名单 IP</p>
              </div>
            )}
          </div>
        </div>

        {/* Quota Alert */}
        <div className="card">
          <div className="p-6 border-b border-dark-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">额度预警</h2>
              <p className="text-sm text-dark-400">
                设置调用额度预警阈值
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="label">预警阈值</label>
              <select className="input">
                <option value="80">80% - 使用率达到 80% 时提醒</option>
                <option value="70">70% - 使用率达到 70% 时提醒</option>
                <option value="90">90% - 使用率达到 90% 时提醒</option>
                <option value="50">50% - 使用率达到 50% 时提醒</option>
              </select>
            </div>
            <div>
              <label className="label">通知方式</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-300">站内消息通知</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-300">邮件通知</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-dark-300">短信通知</span>
                </label>
              </div>
            </div>
            <button className="btn-primary w-full mt-2">保存设置</button>
          </div>
        </div>
      </div>

      {/* Permission List */}
      <div className="card">
        <div className="p-6 border-b border-dark-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">接口权限</h2>
              <p className="text-sm text-dark-400">
                已申请的接口权限及调用额度
              </p>
            </div>
          </div>
          <button className="btn-outline btn-sm gap-2">
            <Plus className="w-4 h-4" />
            申请权限
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-950">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  接口名称
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  状态
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  调用额度
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  已使用
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  有效期
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-dark-900/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{perm.apiName}</p>
                  </td>
                  <td className="px-6 py-4">{getPermissionStatus(perm.status)}</td>
                  <td className="px-6 py-4">
                    <span className="text-dark-200">
                      {perm.quota > 0 ? `${perm.quota.toLocaleString()} 次/天` : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {perm.quota > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-dark-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (perm.usedQuota / perm.quota) * 100 > 80
                                ? "bg-warning-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${(perm.usedQuota / perm.quota) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-dark-400">
                          {Math.round((perm.usedQuota / perm.quota) * 100)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-dark-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-dark-300 text-sm">
                      {perm.expiresAt || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
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
  );
}
