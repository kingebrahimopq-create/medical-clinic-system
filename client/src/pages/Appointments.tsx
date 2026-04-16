import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function AppointmentsPage() {
  const appointments = [
    { id: 1, patient: "أحمد محمد", time: "10:30 AM", date: "2024-04-16", type: "فحص دوري", status: "قادم" },
    { id: 2, patient: "سارة علي", time: "11:45 AM", date: "2024-04-16", type: "استشارة", status: "قادم" },
    { id: 3, patient: "محمد حسن", time: "01:15 PM", date: "2024-04-16", type: "متابعة", status: "قيد الانتظار" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">جدول المواعيد</h1>
            <p className="text-slate-500">تنظيم ومتابعة مواعيد المرضى اليومية.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 shadow-sm">
            <Plus className="ml-2 h-4 w-4" />
            حجز موعد جديد
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h3 className="font-bold text-slate-900">الثلاثاء، 16 أبريل 2024</h3>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" className="text-primary font-bold text-sm">اليوم</Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="group relative flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                    <div className="flex flex-col items-center justify-center min-w-[80px] py-2 rounded-xl bg-white shadow-sm border border-slate-100">
                      <Clock className="h-4 w-4 text-primary mb-1" />
                      <span className="text-xs font-bold text-slate-900">{apt.time}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{apt.patient}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === "قادم" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{apt.type}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      تعديل
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold">ملخص المواعيد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm font-medium text-blue-700">مواعيد اليوم</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">12</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-sm font-medium text-emerald-700">تمت معاينتهم</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">8</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-700">إلغاءات</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
