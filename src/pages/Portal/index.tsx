import {
  ArrowRight,
  Code2,
  Zap,
  Shield,
  BarChart3,
  Clock,
  BookOpen,
  Play,
  Bell,
  ChevronRight,
  TrendingUp,
  Users,
  Layers,
  Server,
} from "lucide-react";
import { apiCategories, announcements, apis } from "@/mock";
import { useNavigate } from "react-router-dom";

export default function Portal() {
  const navigate = useNavigate();
  const hotApis = apis.slice(0, 4);
  const stats = [
    { label: "开放接口", value: "128", icon: Layers, suffix: "个" },
    { label: "合作伙伴", value: "56", icon: Users, suffix: "家" },
    { label: "累计调用", value: "2.5", icon: Server, suffix: "亿次" },
    { label: "平均响应", value: "85", icon: Clock, suffix: "ms" },
  ];

  const quickStartSteps = [
    { step: 1, title: "注册入驻", desc: "提交企业信息，申请成为开发者" },
    { step: 2, title: "创建应用", desc: "创建应用，获取 AppKey 和 Secret" },
    { step: 3, title: "申请权限", desc: "浏览接口目录，申请调用权限" },
    { step: 4, title: "集成调用", desc: "参考文档，快速集成 API 到业务系统" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-dark-900 p-10 border border-primary-700/30">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-sm font-medium mb-6 border border-primary-500/30">
            <Zap className="w-4 h-4" />
            API v3.0 全新上线，性能提升 50%
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            企业级 API 开放平台
            <br />
            <span className="text-gradient">连接生态，赋能业务</span>
          </h1>
          <p className="text-lg text-dark-300 mb-8 leading-relaxed">
            提供稳定、安全、高效的 API 服务，助力企业快速构建数字化生态。
            覆盖用户、订单、商品、支付等核心业务场景，助力合作伙伴快速接入。
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/apis")}
              className="btn-primary btn-lg gap-2"
            >
              开始使用
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate("/debugger")}
              className="btn-secondary btn-lg gap-2"
            >
              <Play className="w-5 h-5" />
              在线调试
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-10 grid grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-dark-900/50 backdrop-blur-sm rounded-xl p-5 border border-dark-700/50"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white">
                  {stat.value}
                  <span className="text-lg font-normal text-dark-400 ml-1">
                    {stat.suffix}
                  </span>
                </p>
                <p className="text-sm text-dark-400 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">平台能力</h2>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              icon: Code2,
              title: "丰富的接口",
              desc: "覆盖用户、订单、商品、支付、物流等全业务场景，100+ API 持续更新中",
              color: "primary",
            },
            {
              icon: Shield,
              title: "安全可靠",
              desc: "多重安全机制，签名验证、IP 白名单、权限管控，保障接口调用安全",
              color: "accent",
            },
            {
              icon: BarChart3,
              title: "实时监控",
              desc: "调用量、成功率、响应时间实时监控，异常告警及时通知",
              color: "warning",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="card card-hover p-6 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    item.color === "primary"
                      ? "bg-primary-500/20"
                      : item.color === "accent"
                      ? "bg-accent-500/20"
                      : "bg-warning-500/20"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      item.color === "primary"
                        ? "text-primary-400"
                        : item.color === "accent"
                        ? "text-accent-400"
                        : "text-warning-400"
                    }`}
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* API Categories & Hot APIs */}
      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">接口分类</h2>
            <button
              onClick={() => navigate("/apis")}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {apiCategories.map((cat, index) => {
              const IconComponent =
                index === 0
                  ? Users
                  : index === 1
                  ? Layers
                  : index === 2
                  ? BookOpen
                  : index === 3
                  ? Shield
                  : index === 4
                  ? Zap
                  : Bell;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate("/apis")}
                  className="card card-hover p-4 cursor-pointer flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white text-sm">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-dark-400 mt-0.5">
                      {cat.apiCount} 个接口
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dark-500" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">热门接口</h2>
            <button
              onClick={() => navigate("/apis")}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hotApis.map((api) => (
              <div
                key={api.id}
                onClick={() => navigate(`/apis/${api.id}`)}
                className="card card-hover p-5 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      api.method === "GET"
                        ? "bg-green-500/10 text-green-400"
                        : api.method === "POST"
                        ? "bg-blue-500/10 text-blue-400"
                        : api.method === "PUT"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {api.method}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-dark-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {api.callCount.toLocaleString()}
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-1.5">{api.name}</h3>
                <p className="text-sm text-dark-400 line-clamp-2 mb-3">
                  {api.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-500">{api.version}</span>
                  <span className="badge-success badge">{api.status === "online" ? "已上线" : api.status === "beta" ? "测试中" : "已下线"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start & Announcements */}
      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="text-xl font-bold text-white mb-6">快速接入</h2>
          <div className="card p-6">
            <div className="grid grid-cols-4 gap-6">
              {quickStartSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  {index < quickStartSteps.length - 1 && (
                    <div className="absolute top-6 left-12 right-0 h-0.5 bg-dark-700" />
                  )}
                  <h3 className="font-semibold text-white mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm text-dark-400">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-dark-800 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate("/apis")}
                className="btn-outline btn-sm gap-2"
              >
                <BookOpen className="w-4 h-4" />
                查看开发文档
              </button>
              <button
                onClick={() => navigate("/debugger")}
                className="btn-outline btn-sm gap-2"
              >
                <Code2 className="w-4 h-4" />
                在线调试工具
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">平台公告</h2>
            <button
              onClick={() => navigate("/tickets")}
              className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              更多
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="card divide-y divide-dark-800">
            {announcements.slice(0, 4).map((ann) => (
              <div
                key={ann.id}
                className="p-4 hover:bg-dark-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      ann.type === "feature"
                        ? "bg-green-500"
                        : ann.type === "maintenance"
                        ? "bg-warning-500"
                        : "bg-primary-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white mb-1 truncate">
                      {ann.title}
                    </h4>
                    <p className="text-xs text-dark-400 line-clamp-2">
                      {ann.content}
                    </p>
                    <p className="text-xs text-dark-500 mt-2">
                      {ann.publishDate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
