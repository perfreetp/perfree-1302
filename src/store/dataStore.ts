import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Application,
  Permission,
  Ticket,
  TicketReply,
  Message,
  Partner,
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

export interface ApiKeysState {
  items: AppKeyItem[];
  addKey: (key: Omit<AppKeyItem, "id">) => void;
  rotateKey: (keyId: string) => AppKeyItem | null;
  disableKey: (keyId: string) => void;
}

export interface WhitelistState {
  ips: string[];
  addIp: (ip: string) => void;
  removeIp: (ip: string) => void;
}

export interface QuotaAlertState {
  threshold: number;
  notifySite: boolean;
  notifyEmail: boolean;
  notifySms: boolean;
  updateSettings: (s: Partial<QuotaAlertState>) => void;
}

export interface ApiCatalogFilterState {
  category: string;
  search: string;
  version: string;
  setFilter: (f: Partial<ApiCatalogFilterState>) => void;
}

interface DataState {
  applications: Application[];
  permissions: Permission[];
  tickets: Ticket[];
  messages: Message[];
  partners: Partner[];
  apiKeys: AppKeyItem[];
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

  addPermission: (p: Omit<Permission, "id" | "appliedAt" | "status" | "usedQuota">) => void;
  approvePermission: (id: string, quota: number, expiresAt: string) => void;
  rejectPermission: (id: string) => void;
  extendPermission: (id: string, expiresAt: string, quota?: number) => void;

  addTicket: (t: Omit<Ticket, "id" | "status" | "createdAt" | "replies">) => void;
  addTicketReply: (ticketId: string, reply: Omit<TicketReply, "id" | "createdAt" | "authorType">) => void;
  markTicketStatus: (ticketId: string, status: Ticket["status"]) => void;

  markMessageRead: (id: string) => void;
  markAllMessagesRead: () => void;

  approvePartner: (id: string) => void;
  rejectPartner: (id: string) => void;

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
        set((s) => ({ applications: [...s.applications, newApp] }));
      },

      updateApplication: (id, updates) => {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }));
      },

      deleteApplication: (id) => {
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === id ? { ...a, status: "deleted" as const } : a
          ),
        }));
      },

      toggleApplicationStatus: (id) => {
        set((s) => ({
          applications: s.applications.map((a) => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: a.status === "active" ? "inactive" : ("active" as const),
            };
          }),
        }));
      },

      addPermission: (p) => {
        const newPerm: Permission = {
          ...p,
          id: generateId(),
          appliedAt: new Date().toISOString().split("T")[0],
          status: "pending",
          usedQuota: 0,
        };
        set((s) => ({ permissions: [...s.permissions, newPerm] }));
      },

      approvePermission: (id, quota, expiresAt) => {
        set((s) => ({
          permissions: s.permissions.map((p) =>
            p.id === id
              ? { ...p, status: "approved", quota, expiresAt }
              : p
          ),
        }));
      },

      rejectPermission: (id) => {
        set((s) => ({
          permissions: s.permissions.map((p) =>
            p.id === id ? { ...p, status: "rejected" } : p
          ),
        }));
      },

      extendPermission: (id, expiresAt, quota) => {
        set((s) => ({
          permissions: s.permissions.map((p) =>
            p.id === id
              ? { ...p, expiresAt, ...(quota !== undefined ? { quota } : {}) }
              : p
          ),
        }));
      },

      addTicket: (t) => {
        const newTicket: Ticket = {
          ...t,
          id: generateId(),
          status: "open",
          createdAt: new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 16),
          replies: [],
        };
        set((s) => ({ tickets: [newTicket, ...s.tickets] }));
      },

      addTicketReply: (ticketId, reply) => {
        const newReply: TicketReply = {
          ...reply,
          id: generateId(),
          createdAt: new Date()
            .toISOString()
            .replace("T", " ")
            .slice(0, 16),
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
        set((s) => ({
          partners: s.partners.map((p) =>
            p.id === id ? { ...p, status: "approved" } : p
          ),
        }));
      },

      rejectPartner: (id) => {
        set((s) => ({
          partners: s.partners.map((p) =>
            p.id === id ? { ...p, status: "rejected" } : p
          ),
        }));
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
