import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

// ============ Validation Schemas ============

const createPatientSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح").optional(),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  currentMedications: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

const createAppointmentSchema = z.object({
  patientId: z.number().int().positive(),
  appointmentDate: z.date(),
  duration: z.number().int().positive().optional().default(30),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  appointmentDate: z.date().optional(),
  duration: z.number().int().positive().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "completed", "cancelled", "no-show", "rescheduled"]).optional(),
});

const createExaminationSchema = z.object({
  patientId: z.number().int().positive(),
  appointmentId: z.number().int().positive().optional(),
  examinationType: z.string().min(1, "نوع الفحص مطلوب"),
  findings: z.string().optional(),
  diagnosis: z.string().optional(),
  recommendations: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

const createPrescriptionSchema = z.object({
  patientId: z.number().int().positive(),
  examinationId: z.number().int().positive().optional(),
  medications: z.string().min(1, "الأدوية مطلوبة"),
  dosage: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

const createMedicalReportSchema = z.object({
  patientId: z.number().int().positive(),
  reportType: z.string().min(1, "نوع التقرير مطلوب"),
  title: z.string().min(1, "عنوان التقرير مطلوب"),
  content: z.string().min(1, "محتوى التقرير مطلوب"),
  fileUrl: z.string().optional(),
  fileKey: z.string().optional(),
  isConfidential: z.boolean().optional().default(false),
});

const createUploadedFileSchema = z.object({
  patientId: z.number().int().positive(),
  fileName: z.string().min(1, "اسم الملف مطلوب"),
  fileType: z.enum(["image", "pdf", "document", "xray"]),
  fileUrl: z.string().min(1, "رابط الملف مطلوب"),
  fileKey: z.string().min(1, "مفتاح الملف مطلوب"),
  fileSize: z.number().int().positive().optional(),
  description: z.string().optional(),
  isEncrypted: z.boolean().optional().default(true),
  encryptionIv: z.string().optional(),
});

const createNotificationSchema = z.object({
  title: z.string().min(1, "عنوان الإشعار مطلوب"),
  message: z.string().min(1, "محتوى الإشعار مطلوب"),
  type: z.enum(["appointment", "reminder", "system", "alert"]),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.number().int().optional(),
});

const updateSystemSettingsSchema = z.object({
  appTitle: z.string().optional(),
  appLogo: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  welcomeMessage: z.string().optional(),
  enableEmailNotifications: z.boolean().optional(),
  enableSmsNotifications: z.boolean().optional(),
  appointmentReminderTime: z.number().int().optional(),
  enablePatientPortal: z.boolean().optional(),
  enableFileSharing: z.boolean().optional(),
  autoBackupEnabled: z.boolean().optional(),
  backupFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
});

// ============ Routers ============

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Patients Router ============
  patients: router({
    // إنشاء مريض جديد
    create: protectedProcedure
      .input(createPatientSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const result = await db.createPatient({
            doctorId: ctx.user.id,
            ...input,
          });
          
          return {
            success: true,
            patientId: (result as any).insertId || 0,
            message: "تم إنشاء المريض بنجاح",
          };
        } catch (error) {
          console.error("Error creating patient:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء المريض",
          });
        }
      }),

    // الحصول على قائمة المرضى
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const patients = await db.getPatientsByDoctor(ctx.user.id);
          return patients;
        } catch (error) {
          console.error("Error fetching patients:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب قائمة المرضى",
          });
        }
      }),

    // الحصول على بيانات مريض واحد
    getById: protectedProcedure
      .input(z.object({ patientId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const patient = await db.getPatientById(input.patientId);
          if (!patient) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "المريض غير موجود",
            });
          }
          return patient;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching patient:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب بيانات المريض",
          });
        }
      }),

    // تحديث بيانات المريض
    update: protectedProcedure
      .input(z.object({
        patientId: z.number().int().positive(),
        data: updatePatientSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.updatePatient(input.patientId, input.data);
          return {
            success: true,
            message: "تم تحديث بيانات المريض بنجاح",
          };
        } catch (error) {
          console.error("Error updating patient:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث بيانات المريض",
          });
        }
      }),

    // حذف مريض
    delete: protectedProcedure
      .input(z.object({ patientId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.deletePatient(input.patientId);
          return {
            success: true,
            message: "تم حذف المريض بنجاح",
          };
        } catch (error) {
          console.error("Error deleting patient:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في حذف المريض",
          });
        }
      }),

    // الحصول على السجل الطبي الكامل للمريض
    getMedicalHistory: protectedProcedure
      .input(z.object({ patientId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const patient = await db.getPatientById(input.patientId);
          if (!patient) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "المريض غير موجود",
            });
          }

          const examinations = await db.getExaminationsByPatient(input.patientId);
          const prescriptions = await db.getPrescriptionsByPatient(input.patientId);
          const reports = await db.getReportsByPatient(input.patientId);

          return {
            patient,
            examinations,
            prescriptions,
            reports,
          };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching medical history:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب السجل الطبي",
          });
        }
      }),
  }),

  // ============ Appointments Router ============
  appointments: router({
    // إنشاء موعد جديد
    create: protectedProcedure
      .input(createAppointmentSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const result = await db.createAppointment({
            doctorId: ctx.user.id,
            ...input,
          });

          const appointmentId = (result as any).insertId || 0;

          // إنشاء إشعار للطبيب
          await db.createNotification({
            doctorId: ctx.user.id,
            title: "موعد جديد",
            message: "تم حجز موعد جديد",
            type: "appointment",
            relatedEntityType: "appointment",
            relatedEntityId: appointmentId,
          });

          return {
            success: true,
            appointmentId,
            message: "تم إنشاء الموعد بنجاح",
          };
        } catch (error) {
          console.error("Error creating appointment:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء الموعد",
          });
        }
      }),

    // الحصول على قائمة المواعيد
    list: protectedProcedure
      .input(z.object({
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const appointments = await db.getAppointmentsByDoctor(
            ctx.user.id,
            input.fromDate,
            input.toDate
          );
          return appointments;
        } catch (error) {
          console.error("Error fetching appointments:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب قائمة المواعيد",
          });
        }
      }),

    // الحصول على بيانات موعد واحد
    getById: protectedProcedure
      .input(z.object({ appointmentId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const appointment = await db.getAppointmentById(input.appointmentId);
          if (!appointment) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "الموعد غير موجود",
            });
          }
          return appointment;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching appointment:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب بيانات الموعد",
          });
        }
      }),

    // تحديث الموعد
    update: protectedProcedure
      .input(z.object({
        appointmentId: z.number().int().positive(),
        data: updateAppointmentSchema,
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.updateAppointment(input.appointmentId, input.data);

          // إنشاء إشعار للطبيب
          await db.createNotification({
            doctorId: ctx.user.id,
            title: "تم تعديل الموعد",
            message: "تم تعديل موعد",
            type: "appointment",
            relatedEntityType: "appointment",
            relatedEntityId: input.appointmentId,
          });

          return {
            success: true,
            message: "تم تحديث الموعد بنجاح",
          };
        } catch (error) {
          console.error("Error updating appointment:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث الموعد",
          });
        }
      }),

    // إلغاء الموعد
    cancel: protectedProcedure
      .input(z.object({ appointmentId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.cancelAppointment(input.appointmentId);

          // إنشاء إشعار للطبيب
          await db.createNotification({
            doctorId: ctx.user.id,
            title: "تم إلغاء الموعد",
            message: "تم إلغاء موعد",
            type: "appointment",
            relatedEntityType: "appointment",
            relatedEntityId: input.appointmentId,
          });

          return {
            success: true,
            message: "تم إلغاء الموعد بنجاح",
          };
        } catch (error) {
          console.error("Error cancelling appointment:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إلغاء الموعد",
          });
        }
      }),
  }),

  // ============ Examinations Router ============
  examinations: router({
    // إنشاء فحص جديد
    create: protectedProcedure
      .input(createExaminationSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const result = await db.createExamination({
            doctorId: ctx.user.id,
            ...input,
          });

          return {
            success: true,
            examinationId: (result as any).insertId || 0,
            message: "تم إنشاء الفحص بنجاح",
          };
        } catch (error) {
          console.error("Error creating examination:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء الفحص",
          });
        }
      }),

    // الحصول على فحوصات المريض
    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const examinations = await db.getExaminationsByPatient(input.patientId);
          return examinations;
        } catch (error) {
          console.error("Error fetching examinations:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الفحوصات",
          });
        }
      }),

    // الحصول على بيانات فحص واحد
    getById: protectedProcedure
      .input(z.object({ examinationId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const examination = await db.getExaminationById(input.examinationId);
          if (!examination) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "الفحص غير موجود",
            });
          }
          return examination;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching examination:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب بيانات الفحص",
          });
        }
      }),

    // تحديث الفحص
    update: protectedProcedure
      .input(z.object({
        examinationId: z.number().int().positive(),
        data: z.object({
          findings: z.string().optional(),
          diagnosis: z.string().optional(),
          recommendations: z.string().optional(),
          attachments: z.array(z.string()).optional(),
          status: z.enum(["draft", "completed", "reviewed"]).optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.updateExamination(input.examinationId, input.data);
          return {
            success: true,
            message: "تم تحديث الفحص بنجاح",
          };
        } catch (error) {
          console.error("Error updating examination:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث الفحص",
          });
        }
      }),
  }),

  // ============ Prescriptions Router ============
  prescriptions: router({
    // إنشاء وصفة طبية جديدة
    create: protectedProcedure
      .input(createPrescriptionSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const result = await db.createPrescription({
            doctorId: ctx.user.id,
            ...input,
          });

          return {
            success: true,
            prescriptionId: (result as any).insertId || 0,
            message: "تم إنشاء الوصفة الطبية بنجاح",
          };
        } catch (error) {
          console.error("Error creating prescription:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء الوصفة الطبية",
          });
        }
      }),

    // الحصول على وصفات المريض
    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const prescriptions = await db.getPrescriptionsByPatient(input.patientId);
          return prescriptions;
        } catch (error) {
          console.error("Error fetching prescriptions:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الوصفات الطبية",
          });
        }
      }),

    // الحصول على بيانات وصفة واحدة
    getById: protectedProcedure
      .input(z.object({ prescriptionId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const prescription = await db.getPrescriptionById(input.prescriptionId);
          if (!prescription) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "الوصفة الطبية غير موجودة",
            });
          }
          return prescription;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching prescription:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب بيانات الوصفة الطبية",
          });
        }
      }),

    // تحديث الوصفة الطبية
    update: protectedProcedure
      .input(z.object({
        prescriptionId: z.number().int().positive(),
        data: z.object({
          medications: z.string().optional(),
          dosage: z.string().optional(),
          duration: z.string().optional(),
          instructions: z.string().optional(),
          status: z.enum(["active", "completed", "cancelled"]).optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.updatePrescription(input.prescriptionId, input.data);
          return {
            success: true,
            message: "تم تحديث الوصفة الطبية بنجاح",
          };
        } catch (error) {
          console.error("Error updating prescription:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث الوصفة الطبية",
          });
        }
      }),
  }),

  // ============ Medical Reports Router ============
  medicalReports: router({
    // إنشاء تقرير طبي جديد
    create: protectedProcedure
      .input(createMedicalReportSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const result = await db.createMedicalReport({
            doctorId: ctx.user.id,
            ...input,
          });

          return {
            success: true,
            reportId: (result as any).insertId || 0,
            message: "تم إنشاء التقرير الطبي بنجاح",
          };
        } catch (error) {
          console.error("Error creating medical report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في إنشاء التقرير الطبي",
          });
        }
      }),

    // الحصول على تقارير المريض
    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const reports = await db.getReportsByPatient(input.patientId);
          return reports;
        } catch (error) {
          console.error("Error fetching medical reports:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب التقارير الطبية",
          });
        }
      }),

    // الحصول على بيانات تقرير واحد
    getById: protectedProcedure
      .input(z.object({ reportId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const report = await db.getReportById(input.reportId);
          if (!report) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "التقرير الطبي غير موجود",
            });
          }
          return report;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error fetching medical report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب بيانات التقرير الطبي",
          });
        }
      }),

    // تحديث التقرير الطبي
    update: protectedProcedure
      .input(z.object({
        reportId: z.number().int().positive(),
        data: z.object({
          title: z.string().optional(),
          content: z.string().optional(),
          isConfidential: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.updateMedicalReport(input.reportId, input.data);
          return {
            success: true,
            message: "تم تحديث التقرير الطبي بنجاح",
          };
        } catch (error) {
          console.error("Error updating medical report:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث التقرير الطبي",
          });
        }
      }),
  }),

  // ============ Uploaded Files Router ============
  uploadedFiles: router({
    // إنشاء ملف مرفوع جديد
    create: protectedProcedure
      .input(createUploadedFileSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const result = await db.createUploadedFile({
            doctorId: ctx.user.id,
            ...input,
          });

          return {
            success: true,
            fileId: (result as any).insertId || 0,
            message: "تم رفع الملف بنجاح",
          };
        } catch (error) {
          console.error("Error creating uploaded file:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في رفع الملف",
          });
        }
      }),

    // الحصول على ملفات المريض
    getByPatient: protectedProcedure
      .input(z.object({ patientId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const files = await db.getUploadedFilesByPatient(input.patientId);
          return files;
        } catch (error) {
          console.error("Error fetching uploaded files:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الملفات المرفوعة",
          });
        }
      }),

    // حذف ملف
    delete: protectedProcedure
      .input(z.object({ fileId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.deleteUploadedFile(input.fileId);
          return {
            success: true,
            message: "تم حذف الملف بنجاح",
          };
        } catch (error) {
          console.error("Error deleting uploaded file:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في حذف الملف",
          });
        }
      }),
  }),

  // ============ Notifications Router ============
  notifications: router({
    // الحصول على الإشعارات
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const notifications = await db.getNotificationsByDoctor(ctx.user.id);
          return notifications;
        } catch (error) {
          console.error("Error fetching notifications:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الإشعارات",
          });
        }
      }),

    // تحديد الإشعار كمقروء
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.markNotificationAsRead(input.notificationId);
          return {
            success: true,
            message: "تم تحديث الإشعار",
          };
        } catch (error) {
          console.error("Error marking notification as read:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث الإشعار",
          });
        }
      }),

    // حذف إشعار
    delete: protectedProcedure
      .input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.deleteNotification(input.notificationId);
          return {
            success: true,
            message: "تم حذف الإشعار",
          };
        } catch (error) {
          console.error("Error deleting notification:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في حذف الإشعار",
          });
        }
      }),
  }),

  // ============ System Settings Router ============
  settings: router({
    // الحصول على إعدادات النظام
    get: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const settings = await db.getSystemSettings(ctx.user.id);
          return settings;
        } catch (error) {
          console.error("Error fetching system settings:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب الإعدادات",
          });
        }
      }),

    // تحديث إعدادات النظام
    update: protectedProcedure
      .input(updateSystemSettingsSchema)
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          await db.updateSystemSettings(ctx.user.id, input);
          return {
            success: true,
            message: "تم تحديث الإعدادات بنجاح",
          };
        } catch (error) {
          console.error("Error updating system settings:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في تحديث الإعدادات",
          });
        }
      }),
  }),

  // ============ Dashboard Router ============
  dashboard: router({
    // الحصول على إحصائيات لوحة التحكم
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        try {
          const totalPatients = await db.getPatientCountByDoctor(ctx.user.id);
          const todayAppointments = await db.getTodayAppointmentsByDoctor(ctx.user.id);
          const recentExaminations = await db.getRecentExaminationsByDoctor(ctx.user.id);
          const pendingNotifications = await db.getPendingNotificationsByDoctor(ctx.user.id);

          return {
            totalPatients,
            todayAppointments: todayAppointments.length,
            recentExaminations,
            pendingNotifications,
          };
        } catch (error) {
          console.error("Error fetching dashboard stats:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في جلب إحصائيات لوحة التحكم",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
