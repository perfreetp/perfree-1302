import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  Shield,
  Key,
  Info,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  FlaskConical,
  Globe,
  Plus,
  Building2,
  Tag,
  Calendar,
  FileText,
  TrendingUp,
  Zap,
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
  Legend,
} from "recharts";
import { callStats, apis } from "@/mock";
import { useDataStore } from "@/store/dataStore";
import type { Application, ApprovalRecord } from "@/types";

type TabType = "info" | "keys" | "permissions" | "overview" | "logs";

interface FormData {
  name: string;
  organization: string;
  category: string;
  environment: "sandbox" | "production";
  description: string;
}

interface FormErrors {
  name?: string;
  organization?: string;
}

const categoryOptions = [
  { value: "电商", label: "电商" },
  { value: "金融", label: "金融" },
  { value: "物流", label: "物流" },
  { value: "营销", label: "营销" },
  { value: "其他", label: "其他" },
];

const environmentOptions = [
  { value: "sandbox", label: "沙箱环境" },
  { value: "production", label: "生产环境" },
];

export default function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    applications,
    permissions,
    apiKeys,
    updateApplication,
    deleteApplication,
    toggleApplicationStatus,
    restoreApplication,
    rotateAppKey,
    addPermission,
    operationLogs,
  } = useDataStore();

  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showApprovalTimeline, setShowApprovalTimeline] = useState(false);
  const [selectedApprovalHistory, setSelectedApprovalHistory] = useState<ApprovalRecord[]>([]);
  const [selectedApprovalApiName, setSelectedApprovalApiName] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    organization: "",
    category: "电商",
    environment: "sandbox",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [applyApiId, setApplyApiId] = useState("");
  const [applyQuota, setApplyQuota] = useState("10000");
  const [applyReason, setApplyReason] = useState("");

  const app = useMemo(() => applications.find((a) => a.id === id), [applications, id]);
  const appPermissions = useMemo(() => permissions.filter((p) => p.appId === id), [permissions, id]);
  const appApiKeys = useMemo(() => apiKeys.filter((k) => k.appId === id), [apiKeys, id]);
  const appOperationLogs = useMemo(
    () => operationLogs.filter((log) => log.targetId === id && log.targetType === "application"),
    [operationLogs, id]
  );

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: Application["status"]) => {
    switch (status) {
      case "active":
        return <span className="badge-success badge"><span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5" />运行中</span>;
      case "inactive":
        return <span className="badge-default badge"><span className="w-1.5 h-1.5 rounded-full bg-dark-400 mr-1.5" />已停用</span>;
      case "pending":
        return <span className="badge-warning badge"><span className="w-1.5 h-1.5 rounded-full bg-warning-400 mr-1.5" />待审核</span>;
      case "deleted":
        return <span className="badge-error badge"><span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />已归档</span>;
    }
  };

  const getEnvBadge = (env: Application["environment"]) => {
    if (env === "sandbox") {
      return <span className="badge-info badge"><FlaskConical className="w-3 h-3 mr-1" />沙箱</span>;
    }
    return <span className="badge badge-success"><Globe className="w-3 h-3 mr-1" />生产</span>;
  };

  const getPermissionStatusBadge = (status: "pending" | "approved" | "rejected") => {
    switch (status) {
      case "approved":
        return <span className="badge badge-success">已通过</span>;
      case "pending":
        return <span className="badge badge-warning">待审批</span>;
      case "rejected":
        return <span className="badge badge-error">已拒绝</span>;
    }
  };

  const openEditModal = () => {
    if (!app) return;
    setFormData({
      name: app.name,
      organization: app.organization,
      category: app.category,
      environment: app.environment,
      description: app.description,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = "请输入应用名称";
    if (!formData.organization.trim()) errors.organization = "请输入组织名称";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = () => {
    if (!validateForm() || !app) return;
    updateApplication(app.id, { ...formData });
    setShowEditModal(false);
    showToast("应用信息已更新");
  };

  const handleDelete = () => {
    if (!app) return;
    deleteApplication(app.id);
    setShowDeleteModal(false);
    showToast("应用已归档删除");
  };

  const handleToggleStatus = () => {
    if (!app) return;
    toggleApplicationStatus(app.id);
    setShowToggleModal(false);
    showToast(app.status === "active" ? "应用已停用" : "应用已恢复运行");
  };

  const handleRestore = () => {
    if (!app) return;
    restoreApplication(app.id);
    setShowRestoreModal(false);
    showToast("应用已恢复，密钥已重新激活");
  };

  const handleRotateKey = (keyId: string) => {
    const result = rotateAppKey(keyId);
    if (result) {
      showToast("密钥已轮换，请妥善保存新的 AppSecret");
    }
  };

  const handleApplyPermission = () => {
    if (!app || !applyApiId || !applyQuota) return;
    const selectedApi = apis.find((a) => a.id === applyApiId);
    if (!selectedApi) return;
    addPermission({
      apiId: applyApiId,
      apiName: selectedApi.name,
      appId: app.id,
      appName: app.name,
      quota: parseInt(applyQuota) || 0,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setShowApplyModal(false);
    setApplyApiId("");
    setApplyQuota("10000");
    setApplyReason("");
    showToast("权限申请已提交，请等待管理员审批");
  };

  const overviewStats = useMemo(() => {
    const today = callStats[callStats.length - 1] || { count: 0, successCount: 0, errorCount: 0, avgResponseTime: 0 };
    return {
      todayCalls: today.count,
      successCount: today.successCount,
      errorCount: today.errorCount,
      avgResponseTime: today.avgResponseTime,
    };
  }, []);

  const chartData = useMemo(() =>
    callStats.map((s) => ({
      date: s.date.slice(5),
      调用量: s.count,
      成功数: s.successCount,
      失败数: s.errorCount,
    })),
  []);

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="card p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-warning-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-warning-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">应用不存在</h2>
          <p className="text-dark-400 mb-6">您访问的应用不存在或已被删除</p>
          <button onClick={() => navigate("/apps")} className="btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回应用列表
          </button>
        </div>
      </div>
    );
  }

  const isArchived = app.status === "deleted";
  const isInactive = app.status === "inactive";

  const tabs: { key: TabType; label: string; icon: typeof Info }[] = [
    { key: "info", label: "应用信息", icon: Info },
    { key: "keys", label: "密钥管理", icon: Key },
    { key: "permissions", label: "接口权限", icon: Shield },
    { key: "overview", label: "调用概览", icon: BarChart3 },
    { key: "logs", label: "操作记录", icon: Clock },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg border flex items-center gap-2 animate-slide-up ${
            toast.type === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {isArchived && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">
              此应用已归档删除，密钥已禁用，权限已冻结。如需恢复请点击右侧按钮。
            </span>
          </div>
          <button
            onClick={() => setShowRestoreModal(true)}
            className="btn-sm gap-2 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 flex-shrink-0"
          >
            <PlayCircle className="w-4 h-4" />
            恢复应用
          </button>
        </div>
      )}

      {isInactive && (
        <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <PauseCircle className="w-5 h-5 text-warning-400 flex-shrink-0" />
            <span className="text-warning-300 text-sm">
              此应用已停用，所有接口调用将被拒绝。
            </span>
          </div>
          <button
            onClick={() => setShowToggleModal(true)}
            className="btn-sm gap-2 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 flex-shrink-0"
          >
            <PlayCircle className="w-4 h-4" />
            恢复应用
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => navigate("/apps")}
          className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-white truncate">{app.name}</h1>
            {getEnvBadge(app.environment)}
            {getStatusBadge(app.status)}
          </div>
          <div className="flex items-center gap-5 text-sm text-dark-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {app.organization}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              {app.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              创建于 {app.createdAt}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!isArchived && (
            <>
              <button onClick={openEditModal} className="btn-secondary btn-sm gap-2">
                <Edit3 className="w-4 h-4" />
                编辑应用
              </button>
              {app.status !== "pending" && (
                <button
                  onClick={() => setShowToggleModal(true)}
                  className={`btn-sm gap-2 ${
                    app.status === "active" ? "btn-secondary" : "btn-outline"
                  }`}
                >
                  {app.status === "active" ? (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      停用
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      恢复
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger btn-sm gap-2"
              >
                <Trash2 className="w-4 h-4" />
                删除应用
              </button>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-1 px-6 border-b border-dark-800 overflow-x-auto">
          {tabs.map((tab) => {
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
          {activeTab === "info" && (
            <div className="max-w-3xl space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-400" />
                    </div>
                    <h3 className="font-semibold text-white">基本信息</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-dark-500 mb-1">应用名称</div>
                      <div className="text-white font-medium">{app.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-dark-500 mb-1">所属组织</div>
                      <div className="text-dark-200">{app.organization}</div>
                    </div>
                    <div>
                      <div className="text-xs text-dark-500 mb-1">应用分类</div>
                      <div className="text-dark-200">{app.category}</div>
                    </div>
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent-400" />
                    </div>
                    <h3 className="font-semibold text-white">环境与状态</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-dark-500 mb-1">运行环境</div>
                      <div className="flex items-center gap-2">
                        {getEnvBadge(app.environment)}
                        <span className="text-dark-300 text-sm">
                          {app.environment === "sandbox" ? "用于开发测试" : "正式生产环境"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-dark-500 mb-1">当前状态</div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-dark-500 mb-1">创建时间</div>
                      <div className="text-dark-200">{app.createdAt}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-warning-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-warning-400" />
                  </div>
                  <h3 className="font-semibold text-white">应用描述</h3>
                </div>
                <p className="text-dark-300 leading-relaxed whitespace-pre-wrap">
                  {app.description || "暂无描述信息"}
                </p>
              </div>
            </div>
          )}

          {activeTab === "keys" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-lg">应用密钥</h3>
                  <p className="text-sm text-dark-400 mt-1">
                    AppKey 和 AppSecret 用于接口调用签名认证，请妥善保管
                  </p>
                </div>
              </div>

              {appApiKeys.length === 0 ? (
                <div className="card p-10 text-center">
                  <Key className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400">暂无密钥数据</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appApiKeys.map((keyItem) => (
                    <div key={keyItem.id} className="relative card p-5">
                      {isArchived && (
                        <div className="absolute inset-0 bg-dark-950/60 rounded-xl z-10 flex items-center justify-center pointer-events-none">
                          <span className="badge-error badge text-base">已禁用</span>
                        </div>
                      )}
                      <div className={`flex items-center justify-between mb-4 flex-wrap gap-3 ${isInactive ? "border border-warning-500/30 rounded-lg p-3 -m-3" : ""}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isInactive ? "bg-warning-500/20" : "bg-primary-500/20"}`}>
                            <Key className={`w-5 h-5 ${isInactive ? "text-warning-400" : "text-primary-400"}`} />
                          </div>
                          <div>
                            <div className="font-medium text-white">密钥凭证</div>
                            <div className="text-xs text-dark-500">
                              创建于 {keyItem.createdAt} · 到期 {keyItem.expiresAt}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isArchived ? (
                            <span className="badge badge-default">已禁用</span>
                          ) : (
                            <>
                              {keyItem.status === "active" && !isInactive && (
                                <span className="badge badge-success">生效中</span>
                              )}
                              {(keyItem.status === "disabled" || isInactive) && (
                                <span className="badge badge-warning">已停用</span>
                              )}
                              {keyItem.status === "rotated" && (
                                <span className="badge badge-warning">已轮换</span>
                              )}
                              {keyItem.status === "active" && !isInactive && (
                                <button
                                  onClick={() => handleRotateKey(keyItem.id)}
                                  className="btn-secondary btn-sm gap-1.5"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  轮换密钥
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-dark-400">AppKey</label>
                            {isArchived ? (
                              <span className="text-xs text-dark-500 flex items-center gap-1">
                                <Copy className="w-3 h-3" />
                                已禁用
                              </span>
                            ) : (
                              <button
                                onClick={() => copyText(keyItem.appKey, `key-${keyItem.id}`)}
                                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                              >
                                {copiedId === `key-${keyItem.id}` ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    已复制
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    复制
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="bg-dark-950 border border-dark-800 rounded-lg px-4 py-3 font-mono text-sm text-dark-200">
                            {keyItem.appKey}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-dark-400">AppSecret</label>
                            {isArchived ? (
                              <span className="text-xs text-dark-500 flex items-center gap-1">
                                <Copy className="w-3 h-3" />
                                已禁用
                              </span>
                            ) : (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    setShowSecret((prev) => ({
                                      ...prev,
                                      [keyItem.id]: !prev[keyItem.id],
                                    }))
                                  }
                                  className="text-xs text-dark-400 hover:text-white flex items-center gap-1"
                                >
                                  {showSecret[keyItem.id] ? (
                                    <>
                                      <EyeOff className="w-3 h-3" />
                                      隐藏
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3 h-3" />
                                      显示
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => copyText(keyItem.appSecret, `secret-${keyItem.id}`)}
                                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                                >
                                  {copiedId === `secret-${keyItem.id}` ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      已复制
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      复制
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="bg-dark-950 border border-dark-800 rounded-lg px-4 py-3 font-mono text-sm text-dark-200">
                            {showSecret[keyItem.id]
                              ? keyItem.appSecret
                              : "•".repeat(Math.min(keyItem.appSecret.length, 32))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="card p-5 bg-warning-500/5 border-warning-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-warning-400 mb-1">安全提示</div>
                    <ul className="text-dark-300 space-y-1 list-disc list-inside">
                      <li>AppSecret 是调用接口的关键凭证，请勿在客户端代码或公开仓库中暴露</li>
                      <li>建议定期轮换密钥，轮换后旧密钥将立即失效</li>
                      <li>如发现密钥泄露，请立即停用或轮换密钥</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-white text-lg">接口权限列表</h3>
                  <p className="text-sm text-dark-400 mt-1">
                    共 {appPermissions.length} 条权限记录
                  </p>
                </div>
                {!isArchived && (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="btn-primary btn-sm gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    申请权限
                  </button>
                )}
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-dark-950">
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          接口名称
                        </th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          调用额度
                        </th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          已用额度
                        </th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          有效期至
                        </th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          状态
                        </th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-dark-400 border-b border-dark-800">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appPermissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center">
                            <Shield className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                            <p className="text-dark-400">暂无权限记录，点击右上角申请接口权限</p>
                          </td>
                        </tr>
                      ) : (
                        appPermissions.map((p) => {
                          const usagePercent =
                            p.quota > 0 ? Math.min((p.usedQuota / p.quota) * 100, 100) : 0;
                          return (
                            <tr
                              key={p.id}
                              className="border-b border-dark-800 last:border-0 hover:bg-dark-900/30"
                            >
                              <td className="px-5 py-4">
                                <div className="font-medium text-white">{p.apiName}</div>
                                <div className="text-xs text-dark-500 mt-0.5">
                                  申请于 {p.appliedAt}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-dark-200">
                                {p.status === "approved" || isArchived
                                  ? `${p.quota.toLocaleString()} 次/天`
                                  : "-"}
                              </td>
                              <td className="px-5 py-4">
                                {p.status === "approved" && !isArchived ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          usagePercent >= 90
                                            ? "bg-warning-500"
                                            : usagePercent >= 70
                                            ? "bg-accent-500"
                                            : "bg-green-500"
                                        }`}
                                        style={{ width: `${usagePercent}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-dark-300 whitespace-nowrap">
                                      {p.usedQuota.toLocaleString()} ({usagePercent.toFixed(0)}%)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-dark-500">-</span>
                                )}
                              </td>
                              <td className="px-5 py-4 text-dark-300">
                                {p.expiresAt || "-"}
                              </td>
                              <td className="px-5 py-4">
                                <div>
                                  {isArchived ? (
                                    <span className="badge badge-default">已归档</span>
                                  ) : (
                                    getPermissionStatusBadge(p.status)
                                  )}
                                </div>
                                {!isArchived && p.status === "rejected" && p.rejectReason && (
                                  <p className="text-xs text-red-400 mt-1">
                                    拒绝原因：{p.rejectReason}
                                  </p>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <button
                                  onClick={() => {
                                    setSelectedApprovalHistory(p.approvalHistory || []);
                                    setSelectedApprovalApiName(p.apiName);
                                    setShowApprovalTimeline(true);
                                  }}
                                  disabled={isArchived}
                                  className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-primary-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                  title="审批详情"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6 animate-fade-in relative">
              {isArchived && (
                <div className="absolute inset-0 bg-dark-950/60 z-10 rounded-xl flex items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-dark-400/60 select-none">数据已归档</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +12.5%
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {overviewStats.todayCalls.toLocaleString()}
                  </p>
                  <p className="text-sm text-dark-400">今日调用量</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-green-400">
                      {overviewStats.todayCalls > 0
                        ? ((overviewStats.successCount / overviewStats.todayCalls) * 100).toFixed(1) + "%"
                        : "0%"}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {overviewStats.successCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-dark-400">成功调用数</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-warning-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-warning-400" />
                    </div>
                    <span className="text-sm font-medium text-warning-400">
                      {overviewStats.todayCalls > 0
                        ? ((overviewStats.errorCount / overviewStats.todayCalls) * 100).toFixed(1) + "%"
                        : "0%"}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {overviewStats.errorCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-dark-400">失败调用数</p>
                </div>

                <div className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-accent-400" />
                    </div>
                    <span className="text-sm font-medium text-green-400">-5ms</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {overviewStats.avgResponseTime}
                    <span className="text-lg font-normal text-dark-400 ml-1">ms</span>
                  </p>
                  <p className="text-sm text-dark-400">平均响应时间</p>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">近14天调用趋势</h3>
                    <p className="text-sm text-dark-400 mt-1">展示调用量、成功数、失败数的变化趋势</p>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0F52BA" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0F52BA" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#212529" />
                      <XAxis
                        dataKey="date"
                        stroke="#6C757D"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#6C757D"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) =>
                          v >= 1000 ? (v / 1000).toFixed(0) + "k" : String(v)
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1A1A2E",
                          border: "1px solid #212529",
                          borderRadius: "8px",
                          color: "#E9ECEF",
                        }}
                        itemStyle={{ color: "#E9ECEF" }}
                        labelStyle={{ color: "#ADB5BD" }}
                      />
                      <Legend
                        wrapperStyle={{ color: "#ADB5BD" }}
                        iconType="circle"
                      />
                      <Area
                        type="monotone"
                        dataKey="调用量"
                        stroke="#0F52BA"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCalls)"
                      />
                      <Area
                        type="monotone"
                        dataKey="成功数"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSuccess)"
                      />
                      <Area
                        type="monotone"
                        dataKey="失败数"
                        stroke="#FF6B35"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorError)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-white text-lg">调用量与响应时间对比</h3>
                    <p className="text-sm text-dark-400 mt-1">双轴折线图展示趋势关联</p>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={callStats.map((s) => ({
                        date: s.date.slice(5),
                        调用量: s.count,
                        响应时间: s.avgResponseTime,
                      }))}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#212529" />
                      <XAxis
                        dataKey="date"
                        stroke="#6C757D"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#6C757D"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) =>
                          v >= 1000 ? (v / 1000).toFixed(0) + "k" : String(v)
                        }
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#6C757D"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${v}ms`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1A1A2E",
                          border: "1px solid #212529",
                          borderRadius: "8px",
                          color: "#E9ECEF",
                        }}
                        itemStyle={{ color: "#E9ECEF" }}
                        labelStyle={{ color: "#ADB5BD" }}
                      />
                      <Legend wrapperStyle={{ color: "#ADB5BD" }} iconType="circle" />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="调用量"
                        stroke="#0F52BA"
                        strokeWidth={2.5}
                        dot={{ fill: "#0F52BA", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="响应时间"
                        stroke="#00B4D8"
                        strokeWidth={2.5}
                        dot={{ fill: "#00B4D8", r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="space-y-4 max-w-4xl animate-fade-in">
              <h3 className="font-semibold text-white text-lg">操作记录</h3>
              {appOperationLogs.length === 0 ? (
                <div className="card p-10 text-center">
                  <Clock className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400">暂无操作记录</p>
                </div>
              ) : (
                <div className="relative pl-8">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-dark-800" />
                  {appOperationLogs.map((log) => {
                    const actionConfig: Record<string, { label: string; color: string; icon: typeof Info }> = {
                      create: { label: "创建", color: "bg-green-500", icon: CheckCircle2 },
                      delete: { label: "删除", color: "bg-red-500", icon: Trash2 },
                      toggle_status: { label: "停用/恢复", color: "bg-warning-500", icon: PauseCircle },
                      restore: { label: "恢复", color: "bg-green-500", icon: PlayCircle },
                      approve: { label: "审批", color: "bg-primary-500", icon: CheckCircle2 },
                      reject: { label: "拒绝", color: "bg-red-500", icon: X },
                      extend: { label: "延期", color: "bg-accent-500", icon: Clock },
                      rotate: { label: "轮换", color: "bg-warning-500", icon: RefreshCw },
                    };
                    const config = actionConfig[log.action] || { label: log.action, color: "bg-dark-500", icon: Info };
                    const ActionIcon = config.icon;
                    return (
                      <div key={log.id} className="relative pb-8 last:pb-0">
                        <div className={`absolute -left-1 w-8 h-8 rounded-full flex items-center justify-center ${config.color} text-white`}>
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <div className="card p-5 ml-4">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-base font-semibold text-white">{config.label}</span>
                              <span className="text-sm text-dark-500">{log.operator}</span>
                            </div>
                            <span className="text-sm text-dark-500">{log.createdAt}</span>
                          </div>
                          <p className="text-sm text-dark-300 mb-2">{log.detail}</p>
                          {log.impact && (
                            <div className="text-xs text-dark-500 bg-dark-950 rounded-lg px-3 py-2 inline-flex items-center gap-1.5">
                              <Zap className="w-3 h-3" />
                              影响范围：{log.impact}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">编辑应用</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">
                  应用名称 <span className="text-warning-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入应用名称"
                  className="input"
                />
                {formErrors.name && (
                  <p className="text-xs text-warning-400 mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="label">
                  所属组织 <span className="text-warning-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) =>
                    setFormData({ ...formData, organization: e.target.value })
                  }
                  placeholder="请输入组织名称"
                  className="input"
                />
                {formErrors.organization && (
                  <p className="text-xs text-warning-400 mt-1">
                    {formErrors.organization}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">应用分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="input"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">运行环境</label>
                  <select
                    value={formData.environment}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        environment: e.target.value as "sandbox" | "production",
                      })
                    }
                    className="input"
                  >
                    {environmentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">应用描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="请描述应用的用途和业务场景（选填）"
                  className="input resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleEditSubmit} className="btn-primary">
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">确认删除应用</h3>
                <p className="text-sm text-dark-400">此操作将影响相关密钥和权限</p>
              </div>
            </div>
            <div className="bg-dark-950 rounded-lg p-4 mb-6 border border-dark-800">
              <p className="text-sm text-dark-300 leading-relaxed">
                确定要删除应用 <span className="text-white font-medium">「{app.name}」</span> 吗？
                此操作不可恢复，删除后：
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-dark-400 list-disc list-inside">
                <li>所有关联的 AppKey / AppSecret 将立即失效</li>
                <li>已申请的接口权限将被撤销</li>
                <li>调用统计数据将保留但无法继续查看</li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleDelete} className="btn-danger">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {showToggleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center gap-4 mb-5">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  app.status === "active"
                    ? "bg-warning-500/10"
                    : "bg-green-500/10"
                }`}
              >
                {app.status === "active" ? (
                  <PauseCircle className="w-6 h-6 text-warning-400" />
                ) : (
                  <PlayCircle className="w-6 h-6 text-green-400" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {app.status === "active" ? "确认停用应用" : "确认恢复应用"}
                </h3>
                <p className="text-sm text-dark-400">
                  {app.status === "active"
                    ? "停用后接口将无法调用"
                    : "恢复后应用可正常提供服务"}
                </p>
              </div>
            </div>
            <div className="bg-dark-950 rounded-lg p-4 mb-6 border border-dark-800">
              <p className="text-sm text-dark-300 leading-relaxed">
                {app.status === "active" ? (
                  <>
                    确定要停用应用 <span className="text-white font-medium">「{app.name}」</span> 吗？
                    停用后所有使用该应用密钥的接口调用将返回 403 错误。
                  </>
                ) : (
                  <>
                    确定要恢复应用 <span className="text-white font-medium">「{app.name}」</span> 吗？
                    恢复后接口调用将立即恢复正常。
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowToggleModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleToggleStatus}
                className={app.status === "active" ? "btn-secondary" : "btn-primary"}
              >
                {app.status === "active" ? "确认停用" : "确认恢复"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">申请接口权限</h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">
                  目标应用
                </label>
                <div className="input bg-dark-800/50 text-dark-300 cursor-not-allowed">
                  {app.name}
                </div>
              </div>
              <div>
                <label className="label">
                  申请接口 <span className="text-warning-400">*</span>
                </label>
                <select
                  value={applyApiId}
                  onChange={(e) => setApplyApiId(e.target.value)}
                  className="input"
                >
                  <option value="">请选择要申请的接口</option>
                  {apis.map((api) => (
                    <option key={api.id} value={api.id}>
                      {api.name} ({api.method})
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
                disabled={!applyApiId || !applyQuota}
                className="btn-primary"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <PlayCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">确认恢复应用</h3>
                <p className="text-sm text-dark-400">恢复后密钥和权限将重新激活</p>
              </div>
            </div>
            <div className="bg-dark-950 rounded-lg p-4 mb-6 border border-dark-800">
              <p className="text-sm text-dark-300 leading-relaxed">
                确定恢复此应用 <span className="text-white font-medium">「{app.name}」</span> 吗？恢复后密钥将重新激活，下拉选择将恢复显示。
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleRestore} className="btn-primary">
                确认恢复
              </button>
            </div>
          </div>
        </div>
      )}

      {showApprovalTimeline && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-2xl max-h-[85vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-dark-800 flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">审批时间线</h3>
                <p className="text-sm text-dark-400 mt-1">{selectedApprovalApiName}</p>
              </div>
              <button
                onClick={() => setShowApprovalTimeline(false)}
                className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {selectedApprovalHistory.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-400">暂无审批记录</p>
                </div>
              ) : (
                <div className="relative pl-8">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-dark-800" />
                  {selectedApprovalHistory.map((record, index) => {
                    const actionConfig: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
                      apply: { label: "提交申请", dotClass: "bg-primary-500", badgeClass: "bg-primary-500/20 text-primary-400 border-primary-500/30" },
                      approve: { label: "审批通过", dotClass: "bg-green-500", badgeClass: "bg-green-500/20 text-green-400 border-green-500/30" },
                      reject: { label: "审批拒绝", dotClass: "bg-red-500", badgeClass: "bg-red-500/20 text-red-400 border-red-500/30" },
                      extend: { label: "权限延期", dotClass: "bg-warning-500", badgeClass: "bg-warning-500/20 text-warning-400 border-warning-500/30" },
                      resubmit: { label: "重新提交", dotClass: "bg-primary-500", badgeClass: "bg-primary-500/20 text-primary-400 border-primary-500/30" },
                    };
                    const config = actionConfig[record.action] || { label: record.action, dotClass: "bg-dark-500", badgeClass: "bg-dark-500/20 text-dark-300 border-dark-500/30" };
                    const isLast = index === selectedApprovalHistory.length - 1;
                    return (
                      <div key={record.id} className={`relative ${isLast ? "" : "pb-8"}`}>
                        <div className={`absolute -left-1 top-2 w-8 h-8 rounded-full flex items-center justify-center ${config.dotClass} text-white shadow-lg`}>
                          <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
                        </div>
                        <div className="card p-5 ml-4">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-lg border ${config.badgeClass}`}>
                                {config.label}
                              </span>
                              <span className="text-sm text-dark-500">
                                {record.operatorType === "admin" ? "管理员" : "我"}：{record.operator}
                              </span>
                            </div>
                            <span className="text-sm text-dark-500">{record.createdAt}</span>
                          </div>
                          <p className="text-sm text-dark-300 mb-2">{record.detail}</p>
                          {record.quota !== undefined && (
                            <div className="text-xs text-dark-400 mb-1">
                              额度：{record.quota.toLocaleString()}次/天
                            </div>
                          )}
                          {record.expiresAt && (
                            <div className="text-xs text-dark-400 mb-1">
                              有效期至：{record.expiresAt}
                            </div>
                          )}
                          {record.reason && (
                            <div className="text-xs text-red-400 mt-2 bg-red-500/10 rounded-lg px-3 py-2">
                              原因：{record.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
