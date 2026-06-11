import { useState } from "react";
import {
  Send,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  Plus,
  Trash2,
  Clock,
  Code,
  FileJson,
} from "lucide-react";
import { apis } from "@/mock";

type TabType = "params" | "headers" | "body";

export default function Debugger() {
  const [selectedApi, setSelectedApi] = useState(apis[0]);
  const [method, setMethod] = useState(apis[0].method);
  const [url, setUrl] = useState(`https://api.example.com${apis[0].path}`);
  const [activeTab, setActiveTab] = useState<TabType>("params");
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [params, setParams] = useState([
    { key: "userId", value: "U100001", enabled: true },
    { key: "fields", value: "", enabled: false },
  ]);
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json", enabled: true },
    { key: "Authorization", value: "Bearer your-token", enabled: true },
    { key: "X-App-Key", value: "AK20240612001", enabled: true },
  ]);
  const [bodyContent, setBodyContent] = useState(
    JSON.stringify(
      {
        items: [
          { productId: "P10001", quantity: 1 },
          { productId: "P10002", quantity: 2 },
        ],
        addressId: "A10001",
        payType: "alipay",
      },
      null,
      2
    )
  );

  const handleSend = () => {
    setIsLoading(true);
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);

    setTimeout(() => {
      const mockResponse = {
        code: 0,
        message: "success",
        data: {
          requestId: `REQ${Date.now()}`,
          timestamp: new Date().toISOString(),
          method: method,
          path: selectedApi.path,
          result: {
            id: "12345",
            status: "ok",
            data: {
              userId: "U100001",
              username: "zhangsan",
              nickname: "张三",
              level: "gold",
              points: 12580,
            },
          },
        },
      };

      setResponse(JSON.stringify(mockResponse, null, 2));
      setStatusCode(200);
      setResponseTime(Math.floor(Math.random() * 100) + 50);
      setIsLoading(false);
    }, 800);
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs: { key: TabType; label: string; icon: typeof Code }[] = [
    { key: "params", label: "Query 参数", icon: Code },
    { key: "headers", label: "请求头", icon: FileJson },
    { key: "body", label: "请求体", icon: FileJson },
  ];

  const methods = ["GET", "POST", "PUT", "DELETE"];

  return (
    <div className="h-[calc(100vh-128px)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">在线调试</h1>
          <p className="text-dark-400 mt-1">在线测试 API 接口，快速验证调用结果</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedApi.id}
            onChange={(e) => {
              const api = apis.find((a) => a.id === e.target.value);
              if (api) {
                setSelectedApi(api);
                setMethod(api.method);
                setUrl(`https://api.example.com${api.path}`);
              }
            }}
            className="input w-64"
          >
            {apis.map((api) => (
              <option key={api.id} value={api.id}>
                {api.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Panel - Request */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* URL Bar */}
          <div className="card p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className={`appearance-none pl-4 pr-10 py-2.5 rounded-lg font-bold text-sm border focus:outline-none focus:ring-2 focus:ring-primary-500/50 ${
                    method === "GET"
                      ? "bg-green-500/10 text-green-400 border-green-500/30"
                      : method === "POST"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : method === "PUT"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {methods.map((m) => (
                    <option key={m} value={m} className="bg-dark-800">
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input flex-1 font-mono text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="btn-primary gap-2 min-w-[100px]"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isLoading ? "发送中" : "发送"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="card flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-1 px-4 border-b border-dark-800">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`tab ${activeTab === tab.key ? "tab-active" : ""}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "params" && (
                <div className="space-y-3">
                  {params.map((param, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => {
                          const newParams = [...params];
                          newParams[index].enabled = e.target.checked;
                          setParams(newParams);
                        }}
                        className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => {
                          const newParams = [...params];
                          newParams[index].key = e.target.value;
                          setParams(newParams);
                        }}
                        placeholder="参数名"
                        className="input flex-1 text-sm"
                      />
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => {
                          const newParams = [...params];
                          newParams[index].value = e.target.value;
                          setParams(newParams);
                        }}
                        placeholder="参数值"
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={() => {
                          const newParams = params.filter((_, i) => i !== index);
                          setParams(newParams);
                        }}
                        className="p-2 text-dark-500 hover:text-warning-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setParams([...params, { key: "", value: "", enabled: true }])
                    }
                    className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300"
                  >
                    <Plus className="w-4 h-4" />
                    添加参数
                  </button>
                </div>
              )}

              {activeTab === "headers" && (
                <div className="space-y-3">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => {
                          const newHeaders = [...headers];
                          newHeaders[index].enabled = e.target.checked;
                          setHeaders(newHeaders);
                        }}
                        className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                      />
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => {
                          const newHeaders = [...headers];
                          newHeaders[index].key = e.target.value;
                          setHeaders(newHeaders);
                        }}
                        placeholder="Header 名"
                        className="input flex-1 text-sm"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => {
                          const newHeaders = [...headers];
                          newHeaders[index].value = e.target.value;
                          setHeaders(newHeaders);
                        }}
                        placeholder="Header 值"
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={() => {
                          const newHeaders = headers.filter((_, i) => i !== index);
                          setHeaders(newHeaders);
                        }}
                        className="p-2 text-dark-500 hover:text-warning-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setHeaders([...headers, { key: "", value: "", enabled: true }])
                    }
                    className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300"
                  >
                    <Plus className="w-4 h-4" />
                    添加 Header
                  </button>
                </div>
              )}

              {activeTab === "body" && (
                <div className="h-full">
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    className="w-full h-64 p-4 bg-dark-950 border border-dark-700 rounded-lg font-mono text-sm text-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none"
                    placeholder="请输入 JSON 请求体..."
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Response */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="card flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-dark-800">
              <h3 className="font-semibold text-white">响应结果</h3>
              <div className="flex items-center gap-3">
                {statusCode !== null && (
                  <span
                    className={`text-sm font-medium ${
                      statusCode === 200 ? "text-green-400" : "text-warning-400"
                    }`}
                  >
                    {statusCode} OK
                  </span>
                )}
                {responseTime !== null && (
                  <span className="flex items-center gap-1 text-sm text-dark-400">
                    <Clock className="w-4 h-4" />
                    {responseTime}ms
                  </span>
                )}
                <button
                  onClick={copyResponse}
                  disabled={!response}
                  className="p-1.5 rounded hover:bg-dark-800 text-dark-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-3 text-dark-400">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>请求中...</span>
                  </div>
                </div>
              ) : response ? (
                <pre className="font-mono text-sm text-dark-200 whitespace-pre-wrap">
                  {response}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-dark-500">
                  <Send className="w-12 h-12 mb-3 opacity-50" />
                  <p>点击"发送"按钮查看响应结果</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
