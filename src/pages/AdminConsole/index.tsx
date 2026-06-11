import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Filter,
  CheckSquare,
  Square,
  Trash2,
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
import { apis, callStats } from "@/mock";
import { useDataStore, exportToCSV } from "@/store/dataStore";

type AdminTab = "dashboard" | "audit" | "apis" | "permissions" | "monitor" | "reports";

const defaultExpireDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
};

const statusLabel = (s: string) =>
  s === "approved" ? "已通过" : s === "pending" ? "待审核" : "已拒绝";

const statusBadge = (s: string) => {
  if (s === "approved") return <span className="badge-success badge">已通过</span>;
  if (s === "pending") return <span className="badge-warning badge">待审核</span>;
  return <span className="badge-error badge">已拒绝</span>;
};

export default function AdminConsole() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo<AdminTab>(() => {
    const path = location.pathname;
    if (path === "/admin" || path === "/admin/dashboard") return "dashboard";
    if (path === "/admin/audit") return "audit";
    if (path === "/admin/apis") return "apis";
    if (path === "/admin/permissions") return "permissions";
    if (path === "/admin/monitor") return "monitor";
    if (path === "/admin/reports") return "reports";
    return "dashboard";
  }, [location.pathname]);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<string | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [extendQuota, setExtendQuota] = useState("");

  const [approvePermModal, setApprovePermModal] = useState<{ id: string; apiName: string; appName: string } | null>(null);
  const [approvePermQuota, setApprovePermQuota] = useState("10000");
  const [approvePermExpires, setApprovePermExpires] = useState(defaultExpireDate);

  const [rejectPermModal, setRejectPermModal] = useState<{ id: string; apiName: string; appName: string } | null>(null);
  const [rejectPermReason, setRejectPermReason] = useState("");

  const [rejectPartnerModal, setRejectPartnerModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectPartnerReason, setRejectPartnerReason] = useState("");

  const [batchApprovePermModal, setBatchApprovePermModal] = useState(false);
  const [batchApprovePermQuota, setBatchApprovePermQuota] = useState("10000");
  const [batchApprovePermExpires, setBatchApprovePermExpires] = useState(defaultExpireDate);
  const [batchRejectPermModal, setBatchRejectPermModal] = useState(false);
  const [batchRejectPermReason, setBatchRejectPermReason] = useState("");

  const [batchRejectPartnerModal, setBatchRejectPartnerModal] = useState(false);
  const [batchRejectPartnerReason, setBatchRejectPartnerReason] = useState("");

  const auditFilter = useState({ search: "", status: "all", dateFrom: "", dateTo: "" });
  const permFilter = useState({ search: "", app: "all", status: "all", dateFrom: "", dateTo: "" });
  const reportFilter = useState({ partner: "all", dateFrom: "", dateTo: "" });

  const [selectedPartners, setSelectedPartners] = useState<Set<string>>(new Set());
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const {
    partners,
    permissions,
    applications,
    approvePartner,
    rejectPartner,
    approvePermission,
    rejectPermission,
    extendPermission,
    batchApprovePartners,
    batchRejectPartners,
    batchApprovePermissions,
    batchRejectPermissions,
  } = useDataStore();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

  const filteredAuditPartners = useMemo(() => {
    const f = auditFilter[0];
    return partners.filter((p) => {
      if (f.search && !p.name.toLowerCase().includes(f.search.toLowerCase())) return false;
      if (f.status !== "all" && p.status !== f.status) return false;
      if (f.dateFrom && p.appliedAt < f.dateFrom) return false;
      if (f.dateTo && p.appliedAt > f.dateTo) return false;
      return true;
    });
  }, [partners, auditFilter[0]]);

  const filteredPermissions = useMemo(() => {
    const f = permFilter[0];
    return permissions.filter((p) => {
      if (f.search && !p.apiName.toLowerCase().includes(f.search.toLowerCase()) && !p.appName.toLowerCase().includes(f.search.toLowerCase())) return false;
      if (f.app !== "all" && p.appId !== f.app) return false;
      if (f.status !== "all" && p.status !== f.status) return false;
      if (f.dateFrom && p.appliedAt < f.dateFrom) return false;
      if (f.dateTo && p.appliedAt > f.dateTo) return false;
      return true;
    });
  }, [permissions, permFilter[0]]);

  const togglePartnerSelect = (id: string) => {
    setSelectedPartners((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllPartners = () => {
    const selectable = filteredAuditPartners.map((p) => p.id);
    if (selectedPartners.size === selectable.length && selectable.length > 0) {
      setSelectedPartners(new Set());
    } else {
      setSelectedPartners(new Set(selectable));
    }
  };

  const togglePermSelect = (id: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllPerms = () => {
    const selectable = filteredPermissions.map((p) => p.id);
    if (selectedPerms.size === selectable.length && selectable.length > 0) {
      setSelectedPerms(new Set());
    } else {
      setSelectedPerms(new Set(selectable));
    }
  };

  const handleApprovePartner = (id: string) => {
    approvePartner(id);
    showToast("合作方审核已通过");
  };

  const handleRejectPartner = (id: string, reason: string) => {
    rejectPartner(id);
    showToast("合作方申请已拒绝");
  };

  const handleApprovePermission = (id: string, quota: number, expiresAt: string) => {
    approvePermission(id, quota, expiresAt);
    showToast("权限申请已通过");
  };

  const handleRejectPermission = (id: string, reason: string) => {
    rejectPermission(id, reason);
    showToast("权限申请已拒绝");
  };

  const handleOpenExtendModal = (permId: string, currentExpiresAt: string, currentQuota: number) => {
    setCurrentPermission(permId);
    setExtendDate(currentExpiresAt || defaultExpireDate());
    setExtendQuota(String(currentQuota || 10000));
    setExtendModalOpen(true);
  };

  const handleConfirmExtend = () => {
    if (!currentPermission || !extendDate) {
      showToast("请填写完整的延期信息", "error");
      return;
    }
    const quotaNum = parseInt(extendQuota, 10);
    if (isNaN(quotaNum) || quotaNum <= 0) {
      showToast("请输入有效的额度值", "error");
      return;
    }
    extendPermission(currentPermission, extendDate, quotaNum);
    setExtendModalOpen(false);
    setCurrentPermission(null);
    showToast("权限延期成功");
  };

  const handleBatchApprovePartners = () => {
    const ids = Array.from(selectedPartners);
    if (ids.length === 0) return;
    batchApprovePartners(ids);
    setSelectedPartners(new Set());
    showToast(`已批量通过 ${ids.length} 条入驻申请`);
  };

  const handleBatchRejectPartners = (reason: string) => {
    const ids = Array.from(selectedPartners);
    if (ids.length === 0) return;
    batchRejectPartners(ids);
    setSelectedPartners(new Set());
    showToast(`已批量拒绝 ${ids.length} 条入驻申请`);
  };

  const handleBatchApprovePerms = (quota: number, expiresAt: string) => {
    const ids = Array.from(selectedPerms);
    if (ids.length === 0) return;
    batchApprovePermissions(ids, quota, expiresAt);
    setSelectedPerms(new Set());
    showToast(`已批量通过 ${ids.length} 条权限申请`);
  };

  const handleBatchRejectPerms = (reason: string) => {
    const ids = Array.from(selectedPerms);
    if (ids.length === 0) return;
    batchRejectPermissions(ids, reason);
    setSelectedPerms(new Set());
    showToast(`已批量拒绝 ${ids.length} 条权限申请`);
  };

  const handleExportAuditCSV = () => {
    const data = filteredAuditPartners.map((p) => ({
      合作方名称: p.name,
      联系人: p.contact,
      邮箱: p.email,
      状态: statusLabel(p.status),
      申请时间: p.appliedAt,
      处理时间: p.status !== "pending" ? p.appliedAt : "",
    }));
    const now = new Date();
    exportToCSV(data, `入驻审核结果_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.csv`);
    showToast("审核结果导出成功");
  };

  const handleExportPermCSV = () => {
    const data = filteredPermissions.map((p) => ({
      接口名称: p.apiName,
      应用: p.appName,
      状态: statusLabel(p.status),
      额度: p.quota > 0 ? `${p.quota.toLocaleString()} 次/天` : "—",
      有效期: p.expiresAt || "—",
      申请时间: p.appliedAt,
      处理时间: p.approvedAt || "",
    }));
    const now = new Date();
    exportToCSV(data, `权限审批结果_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}.csv`);
    showToast("审批结果导出成功");
  };

  const handleExportReport = () => {
    const f = reportFilter[0];
    const data = partners
      .filter((p) => {
        if (f.partner !== "all" && p.id !== f.partner) return false;
        if (f.dateFrom && p.appliedAt < f.dateFrom) return false;
        if (f.dateTo && p.appliedAt > f.dateTo) return false;
        return true;
      })
      .map((p) => ({
        name: p.name,
        contact: p.contact,
        email: p.email,
        appCount: p.appCount,
        totalCalls: p.totalCalls,
        status: statusLabel(p.status),
        appliedAt: p.appliedAt,
      }));
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    exportToCSV(data, `合作方用量报表_${yyyy}${mm}${dd}.csv`);
    showToast("报表导出成功");
  };

  const renderModalOverlay = (open: boolean, onClose: () => void, children: React.ReactNode) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-dark-900 rounded-2xl border border-dark-700 p-6 w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg border flex items-center gap-2 animate-fade-in ${
            toast.type === "success"
              ? "bg-green-500/20 border-green-500/50 text-green-400"
              : "bg-red-500/20 border-red-500/50 text-red-400"
          }`}
        >
          {toast.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {renderModalOverlay(extendModalOpen, () => { setExtendModalOpen(false); setCurrentPermission(null); }, (
        <>
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-400" />
            权限延期
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">延期至日期</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">新额度（次/天）</label>
              <input type="number" value={extendQuota} onChange={(e) => setExtendQuota(e.target.value)} placeholder="请输入额度" min="1" className="input" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="btn-secondary" onClick={() => { setExtendModalOpen(false); setCurrentPermission(null); }}>取消</button>
            <button className="btn-primary gap-2" onClick={handleConfirmExtend}><Check className="w-4 h-4" />确认延期</button>
          </div>
        </>
      ))}

      {renderModalOverlay(!!approvePermModal, () => setApprovePermModal(null), (
        <>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            通过权限申请
          </h3>
          {approvePermModal && (
            <div className="space-y-4">
              <div className="bg-dark-800 rounded-lg p-4 space-y-2">
                <p className="text-sm"><span className="text-dark-400">应用名：</span><span className="text-white">{approvePermModal.appName}</span></p>
                <p className="text-sm"><span className="text-dark-400">接口名：</span><span className="text-white">{approvePermModal.apiName}</span></p>
              </div>
              <div>
                <label className="label">额度（次/天）</label>
                <input type="number" value={approvePermQuota} onChange={(e) => setApprovePermQuota(e.target.value)} min="1" className="input" />
              </div>
              <div>
                <label className="label">有效期至</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input type="date" value={approvePermExpires} onChange={(e) => setApprovePermExpires(e.target.value)} className="input pl-10" />
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setApprovePermModal(null)}>取消</button>
            <button
              className="btn-primary gap-2"
              onClick={() => {
                if (!approvePermModal) return;
                const q = parseInt(approvePermQuota, 10);
                if (isNaN(q) || q <= 0) { showToast("请输入有效额度", "error"); return; }
                if (!approvePermExpires) { showToast("请选择有效期", "error"); return; }
                handleApprovePermission(approvePermModal.id, q, approvePermExpires);
                setApprovePermModal(null);
              }}
            >
              <Check className="w-4 h-4" />确认通过
            </button>
          </div>
        </>
      ))}

      {renderModalOverlay(!!rejectPermModal, () => setRejectPermModal(null), (
        <>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-red-400" />
            拒绝权限申请
          </h3>
          {rejectPermModal && (
            <div className="space-y-4">
              <div className="bg-dark-800 rounded-lg p-4 space-y-2">
                <p className="text-sm"><span className="text-dark-400">应用名：</span><span className="text-white">{rejectPermModal.appName}</span></p>
                <p className="text-sm"><span className="text-dark-400">接口名：</span><span className="text-white">{rejectPermModal.apiName}</span></p>
              </div>
              <div>
                <label className="label">拒绝原因 <span className="text-red-400">*</span></label>
                <textarea
                  value={rejectPermReason}
                  onChange={(e) => setRejectPermReason(e.target.value)}
                  placeholder="请输入拒绝原因..."
                  rows={3}
                  className="input resize-none"
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setRejectPermModal(null)}>取消</button>
            <button
              className="btn-danger gap-2"
              onClick={() => {
                if (!rejectPermModal) return;
                if (!rejectPermReason.trim()) { showToast("请填写拒绝原因", "error"); return; }
                handleRejectPermission(rejectPermModal.id, rejectPermReason.trim());
                setRejectPermModal(null);
                setRejectPermReason("");
              }}
            >
              <X className="w-4 h-4" />确认拒绝
            </button>
          </div>
        </>
      ))}

      {renderModalOverlay(!!rejectPartnerModal, () => setRejectPartnerModal(null), (
        <>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-red-400" />
            拒绝入驻申请
          </h3>
          {rejectPartnerModal && (
            <div className="space-y-4">
              <div className="bg-dark-800 rounded-lg p-4">
                <p className="text-sm"><span className="text-dark-400">合作方：</span><span className="text-white">{rejectPartnerModal.name}</span></p>
              </div>
              <div>
                <label className="label">拒绝原因 <span className="text-red-400">*</span></label>
                <textarea
                  value={rejectPartnerReason}
                  onChange={(e) => setRejectPartnerReason(e.target.value)}
                  placeholder="请输入拒绝原因..."
                  rows={3}
                  className="input resize-none"
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setRejectPartnerModal(null)}>取消</button>
            <button
              className="btn-danger gap-2"
              onClick={() => {
                if (!rejectPartnerModal) return;
                if (!rejectPartnerReason.trim()) { showToast("请填写拒绝原因", "error"); return; }
                handleRejectPartner(rejectPartnerModal.id, rejectPartnerReason.trim());
                setRejectPartnerModal(null);
                setRejectPartnerReason("");
              }}
            >
              <X className="w-4 h-4" />确认拒绝
            </button>
          </div>
        </>
      ))}

      {renderModalOverlay(batchApprovePermModal, () => setBatchApprovePermModal(false), (
        <>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            批量通过权限申请（{selectedPerms.size} 条）
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">统一额度（次/天）</label>
              <input type="number" value={batchApprovePermQuota} onChange={(e) => setBatchApprovePermQuota(e.target.value)} min="1" className="input" />
            </div>
            <div>
              <label className="label">统一有效期至</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="date" value={batchApprovePermExpires} onChange={(e) => setBatchApprovePermExpires(e.target.value)} className="input pl-10" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setBatchApprovePermModal(false)}>取消</button>
            <button
              className="btn-primary gap-2"
              onClick={() => {
                const q = parseInt(batchApprovePermQuota, 10);
                if (isNaN(q) || q <= 0) { showToast("请输入有效额度", "error"); return; }
                if (!batchApprovePermExpires) { showToast("请选择有效期", "error"); return; }
                handleBatchApprovePerms(q, batchApprovePermExpires);
                setBatchApprovePermModal(false);
              }}
            >
              <Check className="w-4 h-4" />确认通过
            </button>
          </div>
        </>
      ))}

      {renderModalOverlay(batchRejectPermModal, () => setBatchRejectPermModal(false), (
        <>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-red-400" />
            批量拒绝权限申请（{selectedPerms.size} 条）
          </h3>
          <div>
            <label className="label">拒绝原因 <span className="text-red-400">*</span></label>
            <textarea
              value={batchRejectPermReason}
              onChange={(e) => setBatchRejectPermReason(e.target.value)}
              placeholder="请输入拒绝原因..."
              rows={3}
              className="input resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setBatchRejectPermModal(false)}>取消</button>
            <button
              className="btn-danger gap-2"
              onClick={() => {
                if (!batchRejectPermReason.trim()) { showToast("请填写拒绝原因", "error"); return; }
                handleBatchRejectPerms(batchRejectPermReason.trim());
                setBatchRejectPermModal(false);
                setBatchRejectPermReason("");
              }}
            >
              <X className="w-4 h-4" />确认拒绝
            </button>
          </div>
        </>
      ))}

      {renderModalOverlay(batchRejectPartnerModal, () => setBatchRejectPartnerModal(false), (
        <>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <X className="w-5 h-5 text-red-400" />
            批量拒绝入驻申请（{selectedPartners.size} 条）
          </h3>
          <div>
            <label className="label">拒绝原因 <span className="text-red-400">*</span></label>
            <textarea
              value={batchRejectPartnerReason}
              onChange={(e) => setBatchRejectPartnerReason(e.target.value)}
              placeholder="请输入拒绝原因..."
              rows={3}
              className="input resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button className="btn-secondary" onClick={() => setBatchRejectPartnerModal(false)}>取消</button>
            <button
              className="btn-danger gap-2"
              onClick={() => {
                if (!batchRejectPartnerReason.trim()) { showToast("请填写拒绝原因", "error"); return; }
                handleBatchRejectPartners(batchRejectPartnerReason.trim());
                setBatchRejectPartnerModal(false);
                setBatchRejectPartnerReason("");
              }}
            >
              <X className="w-4 h-4" />确认拒绝
            </button>
          </div>
        </>
      ))}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-warning-400" />
            管理员控制台
          </h1>
          <p className="text-dark-400 mt-1">平台管理、审核和数据统计</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-dark-900 rounded-xl p-1.5 border border-dark-800 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(`/admin/${tab.key === "dashboard" ? "" : tab.key}`)}
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

      {/* ==================== Dashboard ==================== */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <span className={`text-sm font-medium flex items-center gap-1 ${stat.trend === "up" ? "text-green-400" : "text-warning-400"}`}>
                      {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-dark-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="card p-6 col-span-2">
              <h3 className="font-semibold text-white mb-6">调用量趋势</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callStats.slice(0, 7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#343A40" />
                    <XAxis dataKey="date" stroke="#6C757D" fontSize={12} tickFormatter={(v) => v.slice(5)} />
                    <YAxis stroke="#6C757D" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "#212529", border: "1px solid #343A40", borderRadius: "8px", color: "#F8F9FA" }} />
                    <Bar dataKey="count" fill="#0F52BA" radius={[4, 4, 0, 0]} name="调用量" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-white mb-4">接口分类占比</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#212529", border: "1px solid #343A40", borderRadius: "8px", color: "#F8F9FA" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-dark-300">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">合作方调用排行</h3>
              <button className="text-sm text-primary-400 hover:text-primary-300">查看全部</button>
            </div>
            <div className="divide-y divide-dark-800">
              {topPartners.map((partner, index) => (
                <div key={partner.id} className="p-4 flex items-center justify-between hover:bg-dark-800/30">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-yellow-500/20 text-yellow-400" : index === 1 ? "bg-gray-400/20 text-gray-400" : index === 2 ? "bg-orange-500/20 text-orange-400" : "bg-dark-700 text-dark-400"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{partner.name}</p>
                      <p className="text-xs text-dark-400">{partner.appCount} 个应用</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{partner.totalCalls.toLocaleString()}</p>
                    <p className="text-xs text-dark-400">累计调用</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== Audit ==================== */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="card p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Filter className="w-4 h-4" />
                筛选
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  placeholder="搜索合作方名称..."
                  value={auditFilter[0].search}
                  onChange={(e) => auditFilter[1]({ ...auditFilter[0], search: e.target.value })}
                  className="input pl-10 w-56 py-2 text-sm"
                />
              </div>
              <select
                value={auditFilter[0].status}
                onChange={(e) => auditFilter[1]({ ...auditFilter[0], status: e.target.value })}
                className="input w-36 py-2 text-sm"
              >
                <option value="all">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="date"
                    value={auditFilter[0].dateFrom}
                    onChange={(e) => auditFilter[1]({ ...auditFilter[0], dateFrom: e.target.value })}
                    className="input pl-10 py-2 text-sm"
                  />
                </div>
                <span className="text-dark-500 text-sm">至</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="date"
                    value={auditFilter[0].dateTo}
                    onChange={(e) => auditFilter[1]({ ...auditFilter[0], dateTo: e.target.value })}
                    className="input pl-10 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Partner Table with checkboxes */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">入驻审核列表</h3>
              <span className="text-sm text-dark-400">共 {filteredAuditPartners.length} 条</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-950">
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <button onClick={toggleAllPartners} className="text-dark-400 hover:text-white transition-colors">
                        {selectedPartners.size === filteredAuditPartners.length && filteredAuditPartners.length > 0
                          ? <CheckSquare className="w-5 h-5 text-primary-400" />
                          : <Square className="w-5 h-5" />}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">合作方名称</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">联系人</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">邮箱</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">状态</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">申请时间</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {filteredAuditPartners.length > 0 ? filteredAuditPartners.map((partner) => (
                    <tr key={partner.id} className={`hover:bg-dark-900/50 ${selectedPartners.has(partner.id) ? "bg-primary-500/5" : ""}`}>
                      <td className="px-4 py-4">
                        <button onClick={() => togglePartnerSelect(partner.id)} className="text-dark-400 hover:text-white transition-colors">
                          {selectedPartners.has(partner.id)
                            ? <CheckSquare className="w-5 h-5 text-primary-400" />
                            : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-4 py-4"><span className="font-medium text-white">{partner.name}</span></td>
                      <td className="px-4 py-4"><span className="text-dark-300">{partner.contact}</span></td>
                      <td className="px-4 py-4"><span className="text-dark-300 text-sm">{partner.email}</span></td>
                      <td className="px-4 py-4">{statusBadge(partner.status)}</td>
                      <td className="px-4 py-4"><span className="text-dark-300 text-sm">{partner.appliedAt}</span></td>
                      <td className="px-4 py-4">
                        {partner.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button className="btn-primary btn-sm gap-1" onClick={() => handleApprovePartner(partner.id)}>
                              <Check className="w-3.5 h-3.5" />通过
                            </button>
                            <button className="btn-danger btn-sm gap-1" onClick={() => setRejectPartnerModal({ id: partner.id, name: partner.name })}>
                              <X className="w-3.5 h-3.5" />拒绝
                            </button>
                          </div>
                        ) : (
                          <span className="text-dark-500 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-dark-500">
                        <Check className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                        <p>暂无匹配的入驻申请</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Batch action bar + Export */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedPartners.size > 0 && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <span className="text-sm text-dark-300">已选择 {selectedPartners.size} 项</span>
                  <button className="btn-primary btn-sm gap-1" onClick={handleBatchApprovePartners}>
                    <Check className="w-3.5 h-3.5" />批量通过
                  </button>
                  <button className="btn-danger btn-sm gap-1" onClick={() => setBatchRejectPartnerModal(true)}>
                    <X className="w-3.5 h-3.5" />批量拒绝
                  </button>
                </div>
              )}
            </div>
            <button className="btn-secondary gap-2" onClick={handleExportAuditCSV}>
              <Download className="w-4 h-4" />导出审核结果
            </button>
          </div>
        </div>
      )}

      {/* ==================== APIs ==================== */}
      {activeTab === "apis" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input type="text" placeholder="搜索接口..." className="input pl-10 w-72" />
              </div>
              <select className="input w-40">
                <option>全部分类</option>
                <option>用户服务</option>
                <option>订单服务</option>
                <option>商品服务</option>
              </select>
            </div>
            <button className="btn-primary gap-2"><Plus className="w-5 h-5" />新增接口</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-dark-950">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">接口名称</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">方法</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">分类</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">版本</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">调用量</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">可见范围</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-dark-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {apis.map((api) => (
                  <tr key={api.id} className="hover:bg-dark-900/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{api.name}</p>
                      <p className="text-xs text-dark-500 font-mono mt-0.5">{api.path}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        api.method === "GET" ? "bg-green-500/10 text-green-400" : api.method === "POST" ? "bg-blue-500/10 text-blue-400" : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {api.method}
                      </span>
                    </td>
                    <td className="px-6 py-4"><span className="text-dark-300">{api.category}</span></td>
                    <td className="px-6 py-4"><span className="text-dark-300">{api.version}</span></td>
                    <td className="px-6 py-4">
                      {api.status === "online" ? <span className="badge-success badge">已上线</span> : api.status === "beta" ? <span className="badge-warning badge">测试中</span> : <span className="badge-default badge">已下线</span>}
                    </td>
                    <td className="px-6 py-4"><span className="text-dark-300">{api.callCount.toLocaleString()}</span></td>
                    <td className="px-6 py-4"><span className="text-dark-300 text-sm">全部可见</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-dark-800 text-dark-400 hover:text-white transition-colors"><Eye className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== Permissions ==================== */}
      {activeTab === "permissions" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="card p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Filter className="w-4 h-4" />
                筛选
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  type="text"
                  placeholder="搜索接口或应用..."
                  value={permFilter[0].search}
                  onChange={(e) => permFilter[1]({ ...permFilter[0], search: e.target.value })}
                  className="input pl-10 w-56 py-2 text-sm"
                />
              </div>
              <select
                value={permFilter[0].app}
                onChange={(e) => permFilter[1]({ ...permFilter[0], app: e.target.value })}
                className="input w-48 py-2 text-sm"
              >
                <option value="all">全部应用</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>{app.name}</option>
                ))}
              </select>
              <select
                value={permFilter[0].status}
                onChange={(e) => permFilter[1]({ ...permFilter[0], status: e.target.value })}
                className="input w-36 py-2 text-sm"
              >
                <option value="all">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
              </select>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="date"
                    value={permFilter[0].dateFrom}
                    onChange={(e) => permFilter[1]({ ...permFilter[0], dateFrom: e.target.value })}
                    className="input pl-10 py-2 text-sm"
                  />
                </div>
                <span className="text-dark-500 text-sm">至</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    type="date"
                    value={permFilter[0].dateTo}
                    onChange={(e) => permFilter[1]({ ...permFilter[0], dateTo: e.target.value })}
                    className="input pl-10 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Table with checkboxes */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-dark-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">权限申请列表</h3>
              <span className="text-sm text-dark-400">共 {filteredPermissions.length} 条</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-950">
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <button onClick={toggleAllPerms} className="text-dark-400 hover:text-white transition-colors">
                        {selectedPerms.size === filteredPermissions.length && filteredPermissions.length > 0
                          ? <CheckSquare className="w-5 h-5 text-primary-400" />
                          : <Square className="w-5 h-5" />}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">接口名称</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">应用</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">状态</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">额度</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">有效期</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">申请时间</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-dark-400">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {filteredPermissions.length > 0 ? filteredPermissions.map((perm) => (
                    <tr key={perm.id} className={`hover:bg-dark-900/50 ${selectedPerms.has(perm.id) ? "bg-primary-500/5" : ""}`}>
                      <td className="px-4 py-4">
                        <button onClick={() => togglePermSelect(perm.id)} className="text-dark-400 hover:text-white transition-colors">
                          {selectedPerms.has(perm.id)
                            ? <CheckSquare className="w-5 h-5 text-primary-400" />
                            : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-4 py-4"><span className="font-medium text-white">{perm.apiName}</span></td>
                      <td className="px-4 py-4"><span className="text-dark-300">{perm.appName}</span></td>
                      <td className="px-4 py-4">{statusBadge(perm.status)}</td>
                      <td className="px-4 py-4"><span className="text-dark-300">{perm.quota > 0 ? `${perm.quota.toLocaleString()} 次/天` : "—"}</span></td>
                      <td className="px-4 py-4"><span className="text-dark-300 text-sm">{perm.expiresAt || "—"}</span></td>
                      <td className="px-4 py-4"><span className="text-dark-300 text-sm">{perm.appliedAt}</span></td>
                      <td className="px-4 py-4">
                        {perm.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              className="btn-primary btn-sm gap-1"
                              onClick={() => setApprovePermModal({ id: perm.id, apiName: perm.apiName, appName: perm.appName })}
                            >
                              <Check className="w-3.5 h-3.5" />通过
                            </button>
                            <button
                              className="btn-danger btn-sm gap-1"
                              onClick={() => setRejectPermModal({ id: perm.id, apiName: perm.apiName, appName: perm.appName })}
                            >
                              <X className="w-3.5 h-3.5" />拒绝
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button className="text-primary-400 hover:text-primary-300 text-sm" onClick={() => handleOpenExtendModal(perm.id, perm.expiresAt, perm.quota)}>
                              延期
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-dark-500">
                        <Check className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
                        <p>暂无匹配的权限申请</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Batch action bar + Export */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedPerms.size > 0 && (
                <div className="flex items-center gap-3 animate-fade-in">
                  <span className="text-sm text-dark-300">已选择 {selectedPerms.size} 项</span>
                  <button className="btn-primary btn-sm gap-1" onClick={() => setBatchApprovePermModal(true)}>
                    <Check className="w-3.5 h-3.5" />批量通过
                  </button>
                  <button className="btn-danger btn-sm gap-1" onClick={() => setBatchRejectPermModal(true)}>
                    <X className="w-3.5 h-3.5" />批量拒绝
                  </button>
                </div>
              )}
            </div>
            <button className="btn-secondary gap-2" onClick={handleExportPermCSV}>
              <Download className="w-4 h-4" />导出审批结果
            </button>
          </div>
        </div>
      )}

      {/* ==================== Monitor ==================== */}
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
                <p className={`text-2xl font-bold ${item.color === "warning" ? "text-warning-400" : "text-green-400"}`}>{item.value}</p>
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
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">时间</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">接口</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">应用</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">错误类型</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">错误码</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">状态</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-dark-400">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {[
                    { time: "2024-06-12 14:32:15", api: "创建订单", app: "电商合作伙伴系统", type: "频率超限", code: "429", status: "pending" },
                    { time: "2024-06-12 13:45:02", api: "获取用户信息", app: "金融风控应用", type: "参数错误", code: "40001", status: "resolved" },
                    { time: "2024-06-12 12:20:33", api: "发送短信", app: "电商合作伙伴系统", type: "系统错误", code: "50001", status: "pending" },
                    { time: "2024-06-12 11:10:08", api: "支付下单", app: "电商合作伙伴系统", type: "权限不足", code: "40301", status: "resolved" },
                  ].map((item, index) => (
                    <tr key={index} className="hover:bg-dark-900/50">
                      <td className="px-6 py-4"><span className="text-dark-300 text-sm">{item.time}</span></td>
                      <td className="px-6 py-4"><span className="font-medium text-white">{item.api}</span></td>
                      <td className="px-6 py-4"><span className="text-dark-300 text-sm">{item.app}</span></td>
                      <td className="px-6 py-4"><span className="text-warning-400 text-sm">{item.type}</span></td>
                      <td className="px-6 py-4"><code className="text-xs font-mono text-dark-400 bg-dark-800 px-2 py-1 rounded">{item.code}</code></td>
                      <td className="px-6 py-4">
                        {item.status === "pending" ? <span className="badge-warning badge">待处理</span> : <span className="badge-success badge">已处理</span>}
                      </td>
                      <td className="px-6 py-4"><button className="text-primary-400 hover:text-primary-300 text-sm">详情</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Reports ==================== */}
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
                      value={reportFilter[0].dateFrom}
                      onChange={(e) => reportFilter[1]({ ...reportFilter[0], dateFrom: e.target.value })}
                      className="input pl-10 text-sm"
                    />
                  </div>
                  <span className="text-dark-500">至</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type="date"
                      value={reportFilter[0].dateTo}
                      onChange={(e) => reportFilter[1]({ ...reportFilter[0], dateTo: e.target.value })}
                      className="input pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">合作方</label>
                <select
                  value={reportFilter[0].partner}
                  onChange={(e) => reportFilter[1]({ ...reportFilter[0], partner: e.target.value })}
                  className="input"
                >
                  <option value="all">全部合作方</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button className="btn-secondary">预览</button>
              <button className="btn-primary gap-2" onClick={handleExportReport}>
                <Download className="w-4 h-4" />导出 Excel
              </button>
            </div>
          </div>

          <div className="card">
            <div className="p-6 border-b border-dark-800">
              <h3 className="font-semibold text-white">历史报表</h3>
            </div>
            <div className="divide-y divide-dark-800">
              {[
                { name: "2024年5月合作方用量报表.xlsx", type: "合作方用量", size: "2.3MB", time: "2024-06-01 10:30" },
                { name: "2024年Q2接口调用统计.xlsx", type: "接口调用", size: "5.1MB", time: "2024-05-15 14:20" },
                { name: "2024年4月错误统计报表.xlsx", type: "错误统计", size: "1.8MB", time: "2024-05-05 09:00" },
              ].map((item, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-dark-800/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-xs text-dark-500 mt-0.5">{item.type} · {item.size} · {item.time}</p>
                    </div>
                  </div>
                  <button className="btn-secondary btn-sm gap-2">
                    <Download className="w-4 h-4" />下载
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
