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
  X,
} from "lucide-react";
import { useDataStore } from "@/store/dataStore";
import type { Application } from "@/types";

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

export default function Apps() {
  const { applications, addApplication } = useDataStore();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    organization: "",
    category: "电商",
    environment: "sandbox",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) {
      errors.name = "请填写应用名称";
    }
    if (!formData.organization.trim()) {
      errors.organization = "请填写组织/企业名称";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = () => {
    setFormData({
      name: "",
      organization: "",
      category: "电商",
      environment: "sandbox",
      description: "",
    });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    addApplication({
      name: formData.name.trim(),
      description: formData.description.trim() || "暂无描述",
      status: "pending",
      environment: formData.environment,
      category: formData.category,
      icon: "",
    });
    setShowCreateModal(false);
    alert("应用创建成功！");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FormErrors];
        return next;
      });
    }
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
        <button onClick={handleOpenModal} className="btn-primary gap-2">
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

      {/* Create App Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">创建应用</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">
                  应用名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入应用名称"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`input ${
                    formErrors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : ""
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="label">
                  组织/企业名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入组织/企业名称"
                  value={formData.organization}
                  onChange={(e) => handleInputChange("organization", e.target.value)}
                  className={`input ${
                    formErrors.organization
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : ""
                  }`}
                />
                {formErrors.organization && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.organization}</p>
                )}
              </div>
              <div>
                <label className="label">应用类型/分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
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
                <label className="label">环境选择</label>
                <div className="flex items-center gap-4">
                  <label
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      formData.environment === "sandbox"
                        ? "border-accent-500 bg-accent-500/10 text-accent-400"
                        : "border-dark-700 text-dark-400 hover:border-dark-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="environment"
                      value="sandbox"
                      checked={formData.environment === "sandbox"}
                      onChange={() => handleInputChange("environment", "sandbox")}
                      className="hidden"
                    />
                    <FlaskConical className="w-4 h-4" />
                    <span className="text-sm font-medium">沙箱环境</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                      formData.environment === "production"
                        ? "border-primary-500 bg-primary-500/10 text-primary-400"
                        : "border-dark-700 text-dark-400 hover:border-dark-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="environment"
                      value="production"
                      checked={formData.environment === "production"}
                      onChange={() => handleInputChange("environment", "production")}
                      className="hidden"
                    />
                    <Globe className="w-4 h-4" />
                    <span className="text-sm font-medium">生产环境</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="label">应用描述</label>
                <textarea
                  rows={4}
                  placeholder="请输入应用描述（选填）"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="input resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleCloseModal}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
