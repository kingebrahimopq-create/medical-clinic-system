import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  longtext,
  json,
} from "drizzle-orm/mysql-core";

/**
 * جدول المستخدمين الأساسي (الأطباء والمالكين)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["owner", "doctor", "patient", "admin"]).default("patient").notNull(),
  
  // معلومات الطبيب
  specialization: varchar("specialization", { length: 255 }),
  licenseNumber: varchar("licenseNumber", { length: 255 }),
  clinicName: varchar("clinicName", { length: 255 }),
  clinicAddress: text("clinicAddress"),
  
  // حقول الأمان والملكية
  isOwner: boolean("isOwner").default(false).notNull(),
  ownerEmail: varchar("ownerEmail", { length: 320 }).default("mhm763517@gmail.com"),
  isVerified: boolean("isVerified").default(false).notNull(),
  
  // إعدادات التخصيص
  appTitle: varchar("appTitle", { length: 255 }).default("نظام إدارة العيادة"),
  appLogo: text("appLogo"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#0066cc"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#00cc99"),
  welcomeMessage: text("welcomeMessage"),
  
  // حقول التشفير
  encryptionKey: text("encryptionKey"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * جدول المرضى
 */
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  
  // المعلومات الأساسية
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth"),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  
  // المعلومات الطبية
  bloodType: varchar("bloodType", { length: 10 }),
  allergies: text("allergies"), // مشفر
  chronicDiseases: text("chronicDiseases"), // مشفر
  currentMedications: text("currentMedications"), // مشفر
  medicalHistory: longtext("medicalHistory"), // مشفر
  
  // معلومات الاتصال الطارئة
  emergencyContactName: varchar("emergencyContactName", { length: 255 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 20 }),
  emergencyContactRelation: varchar("emergencyContactRelation", { length: 100 }),
  
  // العنوان
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  
  // حقول التتبع
  isActive: boolean("isActive").default(true).notNull(),
  lastVisit: timestamp("lastVisit"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول المواعيد
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  patientId: int("patientId").notNull(),
  
  // تفاصيل الموعد
  appointmentDate: timestamp("appointmentDate").notNull(),
  duration: int("duration").default(30), // بالدقائق
  reason: text("reason"),
  notes: text("notes"), // مشفر
  
  // حالة الموعد
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no-show", "rescheduled"])
    .default("scheduled")
    .notNull(),
  
  // التذكيرات والإشعارات
  reminderSent: boolean("reminderSent").default(false).notNull(),
  reminderSentAt: timestamp("reminderSentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول الفحوصات والتقييمات
 */
export const examinations = mysqlTable("examinations", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  patientId: int("patientId").notNull(),
  appointmentId: int("appointmentId"),
  
  // تفاصيل الفحص
  examinationType: varchar("examinationType", { length: 255 }).notNull(),
  examinationDate: timestamp("examinationDate").defaultNow().notNull(),
  
  // النتائج
  findings: longtext("findings"), // مشفر
  diagnosis: longtext("diagnosis"), // مشفر
  recommendations: longtext("recommendations"), // مشفر
  
  // الملفات المرفقة
  attachments: json("attachments"), // قائمة URLs للملفات المرفقة
  
  // الحالة
  status: mysqlEnum("status", ["draft", "completed", "reviewed"]).default("draft").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول الوصفات الطبية
 */
export const prescriptions = mysqlTable("prescriptions", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  patientId: int("patientId").notNull(),
  examinationId: int("examinationId"),
  
  // تفاصيل الوصفة
  prescriptionDate: timestamp("prescriptionDate").defaultNow().notNull(),
  medications: longtext("medications"), // JSON مشفر بقائمة الأدوية
  dosage: longtext("dosage"), // مشفر
  duration: varchar("duration", { length: 255 }), // مثل "7 days", "2 weeks"
  instructions: text("instructions"), // مشفر
  
  // الحالة
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول التقارير الطبية
 */
export const medicalReports = mysqlTable("medicalReports", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  patientId: int("patientId").notNull(),
  
  // تفاصيل التقرير
  reportType: varchar("reportType", { length: 255 }).notNull(),
  reportDate: timestamp("reportDate").defaultNow().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: longtext("content"), // مشفر
  
  // الملفات
  fileUrl: text("fileUrl"), // URL للملف المرفوع
  fileKey: varchar("fileKey", { length: 255 }), // مفتاح الملف في S3
  
  // الحالة
  isConfidential: boolean("isConfidential").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول الملفات المرفوعة (الأشعات والصور والمستندات)
 */
export const uploadedFiles = mysqlTable("uploadedFiles", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  patientId: int("patientId").notNull(),
  
  // تفاصيل الملف
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(), // image, pdf, document, xray
  fileUrl: text("fileUrl").notNull(), // URL للملف
  fileKey: varchar("fileKey", { length: 255 }).notNull(), // مفتاح الملف في S3
  fileSize: int("fileSize"), // حجم الملف بالبايتات
  
  // البيانات الوصفية
  description: text("description"),
  uploadedDate: timestamp("uploadedDate").defaultNow().notNull(),
  
  // الأمان
  isEncrypted: boolean("isEncrypted").default(true).notNull(),
  encryptionIv: varchar("encryptionIv", { length: 255 }), // IV للتشفير
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول الإشعارات
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  
  // تفاصيل الإشعار
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["appointment", "reminder", "system", "alert"]).notNull(),
  
  // البيانات المرتبطة
  relatedEntityType: varchar("relatedEntityType", { length: 50 }), // appointment, patient, examination
  relatedEntityId: int("relatedEntityId"),
  
  // حالة الإشعار
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * جدول سجل الملكية والتحويلات
 */
export const ownershipLog = mysqlTable("ownershipLog", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات التحويل
  fromOwnerId: int("fromOwnerId"),
  toOwnerId: int("toOwnerId").notNull(),
  
  // التفاصيل
  transferReason: text("transferReason"),
  transferDate: timestamp("transferDate").defaultNow().notNull(),
  
  // التوثيق
  documentUrl: text("documentUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * جدول سجل الأمان والتدقيق
 */
export const securityAuditLog = mysqlTable("securityAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  
  // تفاصيل الحدث
  eventType: varchar("eventType", { length: 100 }).notNull(),
  eventDescription: text("eventDescription"),
  
  // معلومات الوصول
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  // النتيجة
  status: mysqlEnum("status", ["success", "failure", "warning"]).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * جدول إعدادات النظام
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  doctorId: int("doctorId").notNull(),
  
  // إعدادات التخصيص
  appTitle: varchar("appTitle", { length: 255 }),
  appLogo: text("appLogo"),
  primaryColor: varchar("primaryColor", { length: 7 }),
  secondaryColor: varchar("secondaryColor", { length: 7 }),
  welcomeMessage: text("welcomeMessage"),
  
  // إعدادات الإشعارات
  enableEmailNotifications: boolean("enableEmailNotifications").default(true).notNull(),
  enableSmsNotifications: boolean("enableSmsNotifications").default(false).notNull(),
  appointmentReminderTime: int("appointmentReminderTime").default(24), // بالساعات
  
  // إعدادات الخصوصية
  enablePatientPortal: boolean("enablePatientPortal").default(true).notNull(),
  enableFileSharing: boolean("enableFileSharing").default(true).notNull(),
  
  // إعدادات النسخ الاحتياطي
  autoBackupEnabled: boolean("autoBackupEnabled").default(true).notNull(),
  backupFrequency: mysqlEnum("backupFrequency", ["daily", "weekly", "monthly"]).default("daily"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ============ Types ============

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

export type Examination = typeof examinations.$inferSelect;
export type InsertExamination = typeof examinations.$inferInsert;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = typeof prescriptions.$inferInsert;

export type MedicalReport = typeof medicalReports.$inferSelect;
export type InsertMedicalReport = typeof medicalReports.$inferInsert;

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type OwnershipLog = typeof ownershipLog.$inferSelect;
export type InsertOwnershipLog = typeof ownershipLog.$inferInsert;

export type SecurityAuditLog = typeof securityAuditLog.$inferSelect;
export type InsertSecurityAuditLog = typeof securityAuditLog.$inferInsert;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = typeof systemSettings.$inferInsert;
