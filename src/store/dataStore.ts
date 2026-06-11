import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Application,
  Permission,
  Ticket,
  TicketReply,
  Message,
  Partner,
  OperationLog,
  ApprovalRecord,
} from "@/types";
import {
  applications as mockApplications,
  permissions as mockPermissions,
  tickets as mockTickets,
  messages as mockMessages,
  partners as mockPartners,
} from "@/mock";

export interface AppKeyItem {
  id: string;
  appId: string;
  appKey: string;
  appSecret: string;
  status: "active" | "disabled" | "rotated";
  createdAt: string;
  expiresAt: string;
}

interface DataState {
  applications: Application[];
  permissions: Permission[];
  tickets: Ticket[];
  messages: Message[];
  partners: Partner[];
  apiKeys: AppKeyItem[];
  operationLogs: OperationLog[];
  whitelist: string[];
  quotaAlert: {
    threshold: number;
    notifySite: boolean;
    notifyEmail: boolean;
    notifySms: boolean;
  };
  catalogFilter: {
    category: string;
    search: string;
    version: string;
  };

  addApplication: (app: Omit<Application, "id" | "appKey" | "appSecret" | "createdAt">) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  toggleApplicationStatus: (id: string) => void;
  restoreApplication: (id: string) => void;

  addPermission: (p: Omit<Permission, "id" | "appliedAt" | "status" | "usedQuota">) => void;
  approvePermission: (id: string, quota: number, expiresAt: string) => void;
  rejectPermission: (id: string, reason: string) => void;
  extendPermission: (id: string, expiresAt: string, quota?: number) => void;
  batchApprovePermissions: (ids: string[], quota: number, expiresAt: string) => void;
  batchRejectPermissions: (ids: string[], reason: string) => void;

  addTicket: (t: Omit<Ticket, "id" | "status" | "createdAt" | "replies">) => void;
  addTicketReply: (ticketId: string, reply: Omit<TicketReply, "id" | "createdAt" | "authorType">) => void;
  markTicketStatus: (ticketId: string, status: Ticket["status"]) => void;

  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;

  approvePartner: (id: string) => void;
  rejectPartner: (id: string) => void;
  batchApprovePartners: (ids: string[]) => void;
  batchRejectPartners: (ids: string[]) => void;

  rotateAppKey: (keyId: string) => AppKeyItem | null;
  addAppKey: (key: Omit<AppKeyItem, "id">) => void;
  disableAppKey: (keyId: string) => void;

  addWhitelistIp: (ip: string) => void;
  removeWhitelistIp: (ip: string) => void;

  updateQuotaAlert: (s: Partial<DataState["quotaAlert"]>) => void;

  setCatalogFilter: (f: Partial<DataState["catalogFilter"]>) => void;
}

const generateId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const generateAppKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "AK";
  for (let i = 0; i < 15; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

const generateAppSecret = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "SK_";
  for (let i = 0; i < 28; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

const nowStr = () => new Date().toISOString().replace("T", " ").slice(0, 16);

const addLog = (
  set: (fn: (s: DataState) => Partial<DataState>) => void,
  targetId: string,
  targetType: OperationLog["targetType"],
  action: OperationLog["action"],
  detail: string,
  impact: string
) => {
  const log: OperationLog = {
    id: generateId(),
    targetId,
    targetType,
    action,
    operator: "管理员",
    detail,
    impact,
    createdAt: nowStr(),
  };
  set((s) => ({ operationLogs: [log, ...s.operationLogs] }));
};

const addMsg = (
  set: (fn: (s: DataState) => Partial<DataState>) => void,
  title: string,
  content: string,
  type: Message["type"] = "approval",
  link?: string
) => {
  const msg: Message = {
    id: generateId(),
    title,
    content,
    type,
    read: false,
    createdAt: nowStr(),
    ...(link ? { link } : {}),
  };
  set((s) => ({ messages: [msg, ...s.messages] }));
};

const pushHistory = (perm: Permission, record: ApprovalRecord): Permission => {
  const history = perm.approvalHistory ?? [];
  return {
    ...perm,
    approvalHistory: [...history, record],
  };
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      applications: mockApplications,
      permissions: mockPermissions,
      tickets: mockTickets,
      messages: mockMessages,
      partners: mockPartners,
      apiKeys: mockApplications.flatMap((app) => [
        {
          id: generateId(),
          appId: app.id,
          appKey: app.appKey,
          appSecret: app.appSecret,
          status: "active" as const,
          createdAt: new Date().toISOString().split("T")[0] + " 10:00",
          expiresAt: "2025-12-31 23:59",
        },
      ]),
      operationLogs: [],
      whitelist: ["192.168.1.1", "10.0.0.0/24", "172.16.0.0/16"],
      quotaAlert: {
        threshold: 80,
        notifySite: true,
        notifyEmail: true,
        notifySms: false,
      },
      catalogFilter: {
        category: "all",
        search: "",
        version: "all",
      },

      addApplication: (app) => {
        const newApp: Application = {
          ...app,
          id: generateId(),
          appKey: generateAppKey(),
          appSecret: generateAppSecret(),
          createdAt: new Date().toISOString().split("T")[0],
        };
        const newKey: AppKeyItem = {
          id: generateId(),
          appId: newApp.id,
          appKey: newApp.appKey,
          appSecret: newApp.appSecret,
          status: "active",
          createdAt: nowStr(),
          expiresAt: "2026-12-31 23:59",
        };
        set((s) => ({
          applications: [...s.applications, newApp],
          apiKeys: [...s.apiKeys, newKey],
        }));
        addLog(set, newApp.id, "application", "create", `创建应用「${newApp.name}」`, "自动生成 AppKey/AppSecret");
      },

      updateApplication: (id, updates) => {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteApplication: (id) => {
        const app = get().applications.find((a) => a.id === id);
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status: "deleted" as const } : a
          ),
          apiKeys: s.apiKeys.map((k) =>
            k.appId === id ? { ...k, status: "disabled" as const } : k
          ),
        }));
        if (app) {
          addLog(set, id, "application", "delete", `删除应用「${app.name}」`, "关联密钥已禁用，权限已归档，监控数据保留");
        }
      },

      toggleApplicationStatus: (id) => {
        const app = get().applications.find((a) => a.id === id);
        set((s) => ({
          applications: s.applications.map((a) => {
            if (a.id !== id) return a;
            const next = a.status === "active" ? "inactive" : ("active" as const);
            return { ...a, status: next };
          }),
        }));
        if (app) {
          const isActive = app.status === "active";
          addLog(
            set, id, "application", "toggle_status",
            isActive ? `停用应用「${app.name}」` : `恢复应用「${app.name}」`,
            isActive ? "所有接口调用将被拒绝，密钥暂时失效" : "密钥恢复生效，接口调用恢复正常"
          );
        }
      },

      restoreApplication: (id) => {
        const app = get().applications.find((a) => a.id === id);
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status: "active" as const } : a
          ),
          apiKeys: s.apiKeys.map((k) =>
            k.appId === id && k.status === "disabled" ? { ...k, status: "active" as const } : k
          ),
        }));
        if (app) {
          addLog(set, id, "application", "restore", `恢复已删除应用「${app.name}」`, "密钥重新激活，权限恢复可见，下拉选择恢复显示");
        }
      },

      addPermission: (p) => {
        const newPerm: Permission = {
          ...p,
          id: generateId(),
          appliedAt: new Date().toISOString().split("T")[0],
          status: "pending",
          usedQuota: 0,
          approvalHistory: [
            {
              id: generateId(),
              action: "apply",
              operator: "我",
              operatorType: "user",
              detail: "提交接口权限申请",
              quota: p.quota,
              createdAt: nowStr(),
            },
          ],
        };
        set((s) => ({ permissions: [...s.permissions, newPerm] }));
      },

      approvePermission: (id, quota, expiresAt) => {
        const perm = get().permissions.find((p) => p.id === id);
        const now = nowStr();
        set((s) => ({
          permissions: s.permissions.map((p) =>
            p.id === id
              ? pushHistory(
                  { ...p, status: "approved", quota, expiresAt, approvedAt: now },
                  {
                    id: generateId(),
                    action: "approve",
                    operator: "管理员",
                    operatorType: "admin",
                    detail: "审批通过",
                    quota,
                    expiresAt,
                    createdAt: now,
                  }
                )
              : p
          ),
        }));
        if (perm) {
          addMsg(
            set,
            "权限申请已通过",
            `您申请的「${perm.apiName}」接口权限已通过审批，额度 ${quota.toLocaleString()} 次/天，有效期至 ${expiresAt}`,
            "approval",
            `/apps/${perm.appId}`
          );
          addLog(set, id, "permission", "approve", `通过「${perm.appName}」的「${perm.apiName}」权限申请`, `额度 ${quota.toLocaleString()} 次/天，有效期至 ${expiresAt}`);
        }
      },

      rejectPermission: (id, reason) => {
        const perm = get().permissions.find((p) => p.id === id);
        const now = nowStr();
        set((s) => ({
          permissions: s.permissions.map((p) =>
            p.id === id
              ? pushHistory(
                  { ...p, status: "rejected", rejectReason: reason, approvedAt: now },
                  {
                    id: generateId(),
                    action: "reject",
                    operator: "管理员",
                    operatorType: "admin",
                    detail: "审批拒绝",
                    reason,
                    createdAt: now,
                  }
                )
              : p
          ),
        }));
        if (perm) {
          addMsg(
            set,
            "权限申请已拒绝",
            `您申请的「${perm.apiName}」接口权限未通过审批，原因：${reason || "无"}`,
            "approval",
            `/apps/${perm.appId}`
          );
          addLog(set, id, "permission", "reject", `拒绝「${perm.appName}」的「${perm.apiName}」权限申请`, reason ? `拒绝原因：${reason}` : "未填写拒绝原因");
        }
      },

      extendPermission: (id, expiresAt, quota) => {
        const perm = get().permissions.find((p) => p.id === id);
        const now = nowStr();
        set((s) => ({
          permissions: s.permissions.map((p) =>
            p.id === id
              ? pushHistory(
                  { ...p, expiresAt, ...(quota !== undefined ? { quota } : {}) },
                  {
                    id: generateId(),
                    action: "extend",
                    operator: "管理员",
                    operatorType: "admin",
                    detail: "权限延期",
                    expiresAt,
                    quota,
                    createdAt: now,
                  }
                )
              : p
          ),
        }));
        if (perm) {
          addLog(set, id, "permission", "extend", `延期「${perm.apiName}」权限至 ${expiresAt}`, quota ? `新额度：${quota.toLocaleString()} 次/天` : "额度不变");
        }
      },

      batchApprovePermissions: (ids, quota, expiresAt) => {
        const now = nowStr();
        const perms = get().permissions.filter((p) => ids.includes(p.id));
        set((s) => ({
          permissions: s.permissions.map((p) =>
            ids.includes(p.id)
              ? pushHistory(
                  { ...p, status: "approved", quota, expiresAt, approvedAt: now },
                  {
                    id: generateId(),
                    action: "approve",
                    operator: "管理员",
                    operatorType: "admin",
                    detail: "批量审批通过",
                    quota,
                    expiresAt,
                    createdAt: now,
                  }
                )
              : p
          ),
        }));
        perms.forEach((perm) => {
          addMsg(
            set,
            "权限申请已通过",
            `您申请的「${perm.apiName}」接口权限已通过审批`,
            "approval",
            `/apps/${perm.appId}`
          );
        });
        addLog(set, ids.join(","), "permission", "approve", `批量通过 ${ids.length} 条权限申请`, `统一额度 ${quota.toLocaleString()} 次/天，有效期至 ${expiresAt}`);
      },

      batchRejectPermissions: (ids, reason) => {
        const now = nowStr();
        const perms = get().permissions.filter((p) => ids.includes(p.id));
        set((s) => ({
          permissions: s.permissions.map((p) =>
            ids.includes(p.id)
              ? pushHistory(
                  { ...p, status: "rejected", rejectReason: reason, approvedAt: now },
                  {
                    id: generateId(),
                    action: "reject",
                    operator: "管理员",
                    operatorType: "admin",
                    detail: "批量审批拒绝",
                    reason,
                    createdAt: now,
                  }
                )
              : p
          ),
        }));
        perms.forEach((perm) => {
          addMsg(
            set,
            "权限申请已拒绝",
            `您申请的「${perm.apiName}」接口权限未通过审批${reason ? `，原因：${reason}` : ""}`,
            "approval",
            `/apps/${perm.appId}`
          );
        });
        addLog(set, ids.join(","), "permission", "reject", `批量拒绝 ${ids.length} 条权限申请`, reason ? `拒绝原因：${reason}` : "");
      },

      addTicket: (t) => {
        const newTicket: Ticket = {
          ...t,
          id: generateId(),
          status: "open",
          createdAt: nowStr(),
          replies: [],
        };
        set((s) => ({ tickets: [newTicket, ...s.tickets] }));
      },

      addTicketReply: (ticketId, reply) => {
        const newReply: TicketReply = {
          ...reply,
          id: generateId(),
          createdAt: nowStr(),
          authorType: reply.author === "我" ? "user" : "admin",
        };
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status: t.status === "open" ? "processing" : t.status,
                  replies: [...t.replies, newReply],
                }
              : t
          ),
        }));
      },

      markTicketStatus: (ticketId, status) => {
        set((s) => ({
          tickets: s.tickets.map((t) =>
            t.id === ticketId ? { ...t, status } : t
          ),
        }));
      },

      markMessageRead: (id) => {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, read: true } : m
          ),
        }));
      },

      markAllMessagesRead: () => {
        set((s) => ({
          messages: s.messages.map((m) => ({ ...m, read: true })),
        }));
      },

      approvePartner: (id) => {
        const partner = get().partners.find((p) => p.id === id);
        set((s) => ({
          partners: s.partners.map((p) =>
            p.id === id ? { ...p, status: "approved" } : p
          ),
        }));
        if (partner) {
          addMsg(set, "入驻申请已通过", `合作方「${partner.name}」的入驻申请已通过审批`);
          addLog(set, id, "partner", "approve", `通过合作方「${partner.name}」入驻申请`, "合作方可正常创建应用和申请接口");
        }
      },

      rejectPartner: (id) => {
        const partner = get().partners.find((p) => p.id === id);
        set((s) => ({
          partners: s.partners.map((p) =>
            p.id === id ? { ...p, status: "rejected" } : p
          ),
        }));
        if (partner) {
          addMsg(set, "入驻申请已拒绝", `合作方「${partner.name}」的入驻申请未通过审批`);
          addLog(set, id, "partner", "reject", `拒绝合作方「${partner.name}」入驻申请`, "合作方无法创建应用");
        }
      },

      batchApprovePartners: (ids) => {
        set((s) => ({
          partners: s.partners.map((p) =>
            ids.includes(p.id) ? { ...p, status: "approved" } : p
          ),
        }));
        ids.forEach((pid) => {
          const partner = get().partners.find((p) => p.id === pid);
          if (partner) {
            addMsg(set, "入驻申请已通过", `合作方「${partner.name}」的入驻申请已通过审批`);
          }
        });
        addLog(set, ids.join(","), "partner", "approve", `批量通过 ${ids.length} 条入驻申请`, "合作方可正常创建应用和申请接口");
      },

      batchRejectPartners: (ids) => {
        set((s) => ({
          partners: s.partners.map((p) =>
            ids.includes(p.id) ? { ...p, status: "rejected" } : p
          ),
        }));
        addLog(set, ids.join(","), "partner", "reject", `批量拒绝 ${ids.length} 条入驻申请`, "");
      },

      rotateAppKey: (keyId) => {
        const key = get().apiKeys.find((k) => k.id === keyId);
        if (!key) return null;
        const newSecret = generateAppSecret();
        const newKey: AppKeyItem = {
          ...key,
          appSecret: newSecret,
        };
        set((s) => ({
          apiKeys: s.apiKeys.map((k) =>
            k.id === keyId ? newKey : k
          ),
        }));
        addLog(set, keyId, "key", "rotate", `轮换密钥 ${key.appKey}`, "旧 Secret 立即失效，请及时更新调用配置");
        return newKey;
      },

      addAppKey: (key) => {
        set((s) => ({
          apiKeys: [...s.apiKeys, { ...key, id: generateId() }],
        }));
      },

      disableAppKey: (keyId) => {
        set((s) => ({
          apiKeys: s.apiKeys.map((k) =>
            k.id === keyId ? { ...k, status: "disabled" } : k
          ),
        }));
      },

      addWhitelistIp: (ip) => {
        set((s) => ({
          whitelist: s.whitelist.includes(ip)
            ? s.whitelist
            : [...s.whitelist, ip],
        }));
      },

      removeWhitelistIp: (ip) => {
        set((s) => ({
          whitelist: s.whitelist.filter((i) => i !== ip),
        }));
      },

      updateQuotaAlert: (settings) => {
        set((s) => ({
          quotaAlert: { ...s.quotaAlert, ...settings },
        }));
      },

      setCatalogFilter: (filter) => {
        set((s) => ({
          catalogFilter: { ...s.catalogFilter, ...filter },
        }));
      },
    }),
    {
      name: "api-platform-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        applications: state.applications,
        permissions: state.permissions,
        tickets: state.tickets,
        messages: state.messages,
        partners: state.partners,
        apiKeys: state.apiKeys,
        operationLogs: state.operationLogs,
        whitelist: state.whitelist,
        quotaAlert: state.quotaAlert,
        catalogFilter: state.catalogFilter,
      }),
    }
  )
);

export const exportToCSV = (
  data: Record<string, any>[],
  filename: string
) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "");
          return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(",")
    ),
  ];
  const blob = new Blob(["\uFEFF" + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
