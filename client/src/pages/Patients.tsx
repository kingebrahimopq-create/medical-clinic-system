import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, MoreVertical, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/DashboardLayout";

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const patients = [
    { id: 1, name: "أحمد محمد", phone: "0501234567", lastVisit: "2024-04-10", status: "نشط" },
    { id: 2, name: "سارة علي", phone: "0507654321", lastVisit: "2024-04-12", status: "نشط" },
    { id: 3, name: "خالد عبدالله", phone: "0505554443", lastVisit: "2024-03-25", status: "غير نشط" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">إدارة المرضى</h1>
            <p className="text-slate-500">عرض وإدارة جميع ملفات المرضى في عيادتك.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 shadow-sm">
            <UserPlus className="ml-2 h-4 w-4" />
            إضافة مريض جديد
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="البحث باسم المريض، رقم الهاتف..."
                  className="pr-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-10 border-slate-200">
                  <Filter className="ml-2 h-4 w-4 text-slate-500" />
                  تصفية
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-right font-bold">المريض</TableHead>
                    <TableHead className="text-right font-bold">رقم الهاتف</TableHead>
                    <TableHead className="text-right font-bold">آخر زيارة</TableHead>
                    <TableHead className="text-right font-bold">الحالة</TableHead>
                    <TableHead className="text-left font-bold w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {patient.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{patient.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{patient.phone}</TableCell>
                      <TableCell className="text-slate-600">{patient.lastVisit}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.status === "نشط" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                        }`}>
                          {patient.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl">
                            <DropdownMenuItem className="cursor-pointer">عرض الملف</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">تعديل البيانات</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">حذف</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
