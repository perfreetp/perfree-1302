import { useState, useEffect } from "react";
import {
  MessageSquare,
  Bell,
  FileText,
  Plus,
  Search,
  Send,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useDataStore } from "@/store/dataStore";

type TabType = "messages" | "tickets";
type TicketType = "question" | "bug" | "feature" | "other";

export default function Tickets() {
  const { tickets, messages, addTicket, addTicketReply } = useDataStore();

  const [activeTab, setActiveTab] = useState<TabType>("tickets");
  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);
  const [ticketFilter, setTicketFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);

  const [newTicketType, setNewTicketType] = useState<TicketType>("question");
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketContent, setNewTicketContent] = useState("");
  const [newTicketApi, setNewTicketApi] = useState("");

  const [titleError, setTitleError] = useState(false);
  const [contentError, setContentError] = useState(false);
  const [replyError, setReplyError] = useState(false);

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    }
  }, [tickets, selectedTicket]);

  useEffect(() => {
    if (tickets.length > 0) {
      const exists = tickets.find((t) => t.id === selectedTicket?.id);
      if (!exists) {
        setSelectedTicket(tickets[0]);
      } else if (exists) {
        setSelectedTicket(exists);
      }
    }
  }, [tickets]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter =
      ticketFilter === "all" || ticket.status === ticketFilter;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadMessages = messages.filter((m) => !m.read).length;

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/10 text-blue-400";
      case "processing":
        return "bg-warning-500/10 text-warning-400";
      case "resolved":
        return "bg-green-500/10 text-green-400";
      case "closed":
        return "bg-dark-700 text-dark-400";
      default:
        return "bg-dark-700 text-dark-400";
    }
  };

  const getTicketStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "待处理";
      case "processing":
        return "处理中";
      case "resolved":
        return "已解决";
      case "closed":
        return "已关闭";
      default:
        return status;
    }
  };

  const getTicketTypeColor = (type: TicketType) => {
    switch (type) {
      case "question":
        return "bg-primary-500/10 text-primary-400";
      case "bug":
        return "bg-red-500/10 text-red-400";
      case "feature":
        return "bg-green-500/10 text-green-400";
      case "other":
        return "bg-dark-700 text-dark-400";
    }
  };

  const getTicketTypeText = (type: TicketType) => {
    switch (type) {
      case "question":
        return "问题咨询";
      case "bug":
        return "Bug反馈";
      case "feature":
        return "功能建议";
      case "other":
        return "其他";
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "system":
        return <Bell className="w-5 h-5 text-warning-400" />;
      case "announcement":
        return <FileText className="w-5 h-5 text-primary-400" />;
      default:
        return <Bell className="w-5 h-5 text-dark-400" />;
    }
  };

  const handleOpenNewTicket = () => {
    setNewTicketType("question");
    setNewTicketTitle("");
    setNewTicketContent("");
    setNewTicketApi("");
    setTitleError(false);
    setContentError(false);
    setShowNewTicket(true);
  };

  const handleSubmitTicket = () => {
    let hasError = false;

    if (!newTicketTitle.trim()) {
      setTitleError(true);
      hasError = true;
    } else {
      setTitleError(false);
    }

    if (!newTicketContent.trim()) {
      setContentError(true);
      hasError = true;
    } else {
      setContentError(false);
    }

    if (hasError) {
      return;
    }

    addTicket({
      title: newTicketTitle.trim(),
      content: newTicketContent.trim(),
      type: newTicketType,
    });

    setShowNewTicket(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      setReplyError(true);
      return;
    }

    setReplyError(false);
    addTicketReply(selectedTicket.id, {
      content: replyText.trim(),
      author: "我",
    });
    setReplyText("");
  };

  return (
    <div className="h-[calc(100vh-128px)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">工单消息</h1>
          <p className="text-dark-400 mt-1">
            查看系统消息和提交问题工单
          </p>
        </div>
        {activeTab === "tickets" && (
          <button
            onClick={handleOpenNewTicket}
            className="btn-primary gap-2"
          >
            <Plus className="w-5 h-5" />
            新建工单
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "tickets"
              ? "bg-primary-500/20 text-primary-400"
              : "text-dark-400 hover:text-white hover:bg-dark-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          我的工单
          <span className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded-full">
            {tickets.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "messages"
              ? "bg-primary-500/20 text-primary-400"
              : "text-dark-400 hover:text-white hover:bg-dark-800"
          }`}
        >
          <Bell className="w-4 h-4" />
          消息通知
          {unreadMessages > 0 && (
            <span className="text-xs bg-warning-500 text-white px-2 py-0.5 rounded-full">
              {unreadMessages}
            </span>
          )}
        </button>
      </div>

      {activeTab === "tickets" ? (
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Ticket List */}
          <div className="w-96 flex-shrink-0 flex flex-col min-h-0">
            <div className="card flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b border-dark-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <input
                      type="text"
                      placeholder="搜索工单..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="input pl-10 w-full py-2 text-sm"
                    />
                  </div>
                  <button className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {[
                    { value: "all", label: "全部" },
                    { value: "open", label: "待处理" },
                    { value: "processing", label: "处理中" },
                    { value: "resolved", label: "已解决" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setTicketFilter(item.value)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        ticketFilter === item.value
                          ? "bg-primary-500/20 text-primary-400"
                          : "text-dark-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-4 border-b border-dark-800 cursor-pointer transition-colors hover:bg-dark-800/50 ${
                      selectedTicket?.id === ticket.id ? "bg-dark-800/50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm line-clamp-1 flex-1">
                        {ticket.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${getTicketStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getTicketStatusText(ticket.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-dark-500">
                      <span className={`px-2 py-0.5 rounded ${getTicketTypeColor(ticket.type as TicketType)}`}>
                        {getTicketTypeText(ticket.type as TicketType)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ticket.createdAt}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedTicket ? (
              <div className="card flex-1 flex flex-col min-h-0">
                <div className="p-6 border-b border-dark-800">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedTicket.title}
                    </h2>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${getTicketStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {getTicketStatusText(selectedTicket.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-dark-400">
                    <span className={`px-2 py-0.5 rounded text-xs ${getTicketTypeColor(selectedTicket.type as TicketType)}`}>
                      {getTicketTypeText(selectedTicket.type as TicketType)}
                    </span>
                    <span>工单编号：{selectedTicket.id}</span>
                    <span>创建时间：{selectedTicket.createdAt}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Question */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">我</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-dark-800 rounded-xl rounded-tl-none p-4">
                        <p className="text-dark-200 text-sm leading-relaxed">
                          {selectedTicket.content}
                        </p>
                      </div>
                      <p className="text-xs text-dark-500 mt-1">
                        {selectedTicket.createdAt}
                      </p>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedTicket.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`flex gap-3 ${
                        reply.authorType === "admin" ? "" : "flex-row-reverse"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          reply.authorType === "admin"
                            ? "bg-accent-500/20"
                            : "bg-gradient-to-br from-primary-500 to-accent-500"
                        }`}
                      >
                        {reply.authorType === "admin" ? (
                          <AlertCircle className="w-5 h-5 text-accent-400" />
                        ) : (
                          <span className="text-white text-sm font-medium">我</span>
                        )}
                      </div>
                      <div
                        className={`flex-1 max-w-[80%] ${
                          reply.authorType === "admin" ? "" : "text-right"
                        }`}
                      >
                        <div
                          className={`inline-block rounded-xl p-4 ${
                            reply.authorType === "admin"
                              ? "bg-dark-800 rounded-tl-none"
                              : "bg-primary-500/20 rounded-tr-none"
                          }`}
                        >
                          <p className="text-dark-200 text-sm leading-relaxed text-left">
                            {reply.content}
                          </p>
                        </div>
                        <p className="text-xs text-dark-500 mt-1">
                          {reply.author} · {reply.createdAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t border-dark-800">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        if (replyError && e.target.value.trim()) {
                          setReplyError(false);
                        }
                      }}
                      placeholder="输入您的回复内容..."
                      className={`input flex-1 resize-none h-24 py-3 ${
                        replyError ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          handleSendReply();
                        }
                      }}
                    />
                    <button onClick={handleSendReply} className="btn-primary h-24 px-6">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  {replyError && (
                    <p className="text-xs text-red-400 mt-2">
                      请填写回复内容
                    </p>
                  )}
                  <p className="text-xs text-dark-500 mt-2">
                    按 Ctrl + Enter 快速发送
                  </p>
                </div>
              </div>
            ) : (
              <div className="card flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                  <p className="text-dark-400">选择一个工单查看详情</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Messages Tab
        <div className="card">
          <div className="p-4 border-b border-dark-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">全部消息</h3>
            <button className="text-sm text-primary-400 hover:text-primary-300">
              全部标为已读
            </button>
          </div>
          <div className="divide-y divide-dark-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-5 hover:bg-dark-800/50 cursor-pointer transition-colors ${
                  !msg.read ? "bg-primary-500/5" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0">
                    {getMessageTypeIcon(msg.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        {msg.title}
                        {!msg.read && (
                          <span className="w-2 h-2 rounded-full bg-primary-500" />
                        )}
                      </h4>
                      <span className="text-xs text-dark-500">
                        {msg.createdAt}
                      </span>
                    </div>
                    <p className="text-sm text-dark-400 line-clamp-2">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-dark-900 rounded-2xl border border-dark-700 w-full max-w-lg p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-6">新建工单</h3>
            <div className="space-y-4">
              <div>
                <label className="label">工单类型</label>
                <select
                  className="input"
                  value={newTicketType}
                  onChange={(e) => setNewTicketType(e.target.value as TicketType)}
                >
                  <option value="question">问题咨询</option>
                  <option value="bug">Bug反馈</option>
                  <option value="feature">功能建议</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label className="label">工单标题 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="请简要描述您的问题"
                  className={`input ${titleError ? "border-red-500 focus:border-red-500" : ""}`}
                  value={newTicketTitle}
                  onChange={(e) => {
                    setNewTicketTitle(e.target.value);
                    if (titleError && e.target.value.trim()) {
                      setTitleError(false);
                    }
                  }}
                />
                {titleError && (
                  <p className="text-xs text-red-400 mt-1">
                    请填写工单标题
                  </p>
                )}
              </div>
              <div>
                <label className="label">问题描述 <span className="text-red-400">*</span></label>
                <textarea
                  rows={5}
                  placeholder="请详细描述您遇到的问题或建议..."
                  className={`input resize-none ${contentError ? "border-red-500 focus:border-red-500" : ""}`}
                  value={newTicketContent}
                  onChange={(e) => {
                    setNewTicketContent(e.target.value);
                    if (contentError && e.target.value.trim()) {
                      setContentError(false);
                    }
                  }}
                />
                {contentError && (
                  <p className="text-xs text-red-400 mt-1">
                    请填写问题描述
                  </p>
                )}
              </div>
              <div>
                <label className="label">关联接口</label>
                <select
                  className="input"
                  value={newTicketApi}
                  onChange={(e) => setNewTicketApi(e.target.value)}
                >
                  <option value="">请选择（可选）</option>
                  <option value="1">获取用户信息</option>
                  <option value="2">创建订单</option>
                  <option value="3">商品列表查询</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewTicket(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleSubmitTicket}
                className="btn-primary"
              >
                提交工单
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-20 right-6 z-[60] animate-slide-up">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm font-medium">工单创建成功</span>
          </div>
        </div>
      )}
    </div>
  );
}
