export interface Application {
  id: string;
  name: string;
  organization: string;
  description: string;
  status: "active" | "inactive" | "pending" | "deleted";
  appKey: string;
  appSecret: string;
  createdAt: string;
  environment: "sandbox" | "production";
  category: string;
  icon: string;
}

export interface ApiParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
  location: "query" | "body" | "header" | "path";
}

export interface ErrorCode {
  code: string;
  message: string;
  description: string;
}

export interface Api {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  status: "online" | "offline" | "beta";
  requestParams: ApiParam[];
  responseExample: string;
  errorCodes: ErrorCode[];
  callCount: number;
}

export interface CallStat {
  date: string;
  count: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
}

export interface ApiKey {
  id: string;
  appId: string;
  appKey: string;
  appSecret: string;
  status: "active" | "disabled" | "rotated";
  createdAt: string;
  expiresAt: string;
}

export interface Permission {
  id: string;
  apiId: string;
  apiName: string;
  appId: string;
  appName: string;
  status: "pending" | "approved" | "rejected";
  quota: number;
  usedQuota: number;
  expiresAt: string;
  appliedAt: string;
  rejectReason?: string;
  approvedAt?: string;
  approvalHistory?: ApprovalRecord[];
}

export interface ApprovalRecord {
  id: string;
  action: "apply" | "approve" | "reject" | "extend" | "resubmit";
  operator: string;
  operatorType: "user" | "admin";
  detail: string;
  quota?: number;
  expiresAt?: string;
  reason?: string;
  createdAt: string;
}

export interface TicketReply {
  id: string;
  content: string;
  author: string;
  authorType: "user" | "admin";
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  content: string;
  type: "question" | "bug" | "feature" | "other";
  status: "open" | "processing" | "resolved" | "closed";
  createdAt: string;
  replies: TicketReply[];
}

export interface Message {
  id: string;
  title: string;
  content: string;
  type: "system" | "approval" | "announcement";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "update" | "maintenance" | "feature";
  publishDate: string;
}

export interface CallLog {
  id: string;
  apiName: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  appName: string;
  requestId: string;
}

export interface Partner {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  appCount: number;
  totalCalls: number;
}

export interface ApiCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  apiCount: number;
}

export interface OperationLog {
  id: string;
  targetId: string;
  targetType: "application" | "permission" | "partner" | "key";
  action: "create" | "delete" | "toggle_status" | "approve" | "reject" | "extend" | "rotate" | "restore";
  operator: string;
  detail: string;
  impact: string;
  createdAt: string;
}
