import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, ClipboardList, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const stats = [
    {
      title: "إجمالي المرضى",
      value: "1,284",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "مواعيد اليوم",
      value: "12",
      change: "+4",
      trend: "up",
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "فحوصات مكتملة",
      value: "45",
      change: "-2%",
      trend: "down",
      icon: ClipboardList,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "معدل النشاط",
      value: "88%",
      change: "+5%",
      trend: "up",
      icon: Activity,
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          مرحباً دكتور، {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500">
          إليك نظرة سريعة على أداء عيادتك اليوم.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="flex items-center mt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 ml-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                )}
                <span className={`text-xs font-medium ${stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                  {stat.change} منذ الشهر الماضي
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">المواعيد القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center font-bold text-primary shadow-sm">
                      أ
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">أحمد محمد</p>
                      <p className="text-xs text-slate-500">فحص دوري • 10:30 صباحاً</p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline">
                    عرض التفاصيل
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">آخر النشاطات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative pr-6 border-r-2 border-slate-100 last:border-r-0 pb-6 last:pb-0">
                  <div className="absolute -right-[9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-white shadow-sm" />
                  <p className="text-sm font-medium text-slate-900">تمت إضافة وصفة طبية جديدة</p>
                  <p className="text-xs text-slate-500 mt-1">للمريض سارة علي • منذ ساعتين</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
