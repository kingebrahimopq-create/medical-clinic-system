import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertPatient,
  InsertAppointment,
  InsertExamination,
  InsertPrescription,
  InsertMedicalReport,
  InsertUploadedFile,
  InsertNotification,
  InsertSystemSettings,
  users,
  patients,
  appointments,
  examinations,
  prescriptions,
  medicalReports,
  uploadedFiles,
  notifications,
  systemSettings,
  ownershipLog,
  securityAuditLog,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ Users ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "specialization", "licenseNumber", "clinicName", "clinicAddress", "appTitle", "appLogo", "welcomeMessage", "encryptionKey"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "owner";
      updateSet.role = "owner";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserSettings(userId: number, settings: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateSet: Record<string, unknown> = {};
  const settingsFields = ["appTitle", "appLogo", "primaryColor", "secondaryColor", "welcomeMessage"] as const;

  for (const field of settingsFields) {
    if (settings[field] !== undefined) {
      updateSet[field] = settings[field];
    }
  }

  if (Object.keys(updateSet).length === 0) return;

  await db.update(users).set(updateSet).where(eq(users.id, userId));
}

// ============ Patients ============

export async function createPatient(patient: InsertPatient) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(patients).values(patient);
  return result;
}

export async function getPatientsByDoctor(doctorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(patients).where(eq(patients.doctorId, doctorId));
}

export async function getPatientById(patientId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePatient(patientId: number, updates: Partial<InsertPatient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(patients).set({ ...updates, updatedAt: new Date() }).where(eq(patients.id, patientId));
}

export async function deletePatient(patientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(patients).set({ isActive: false }).where(eq(patients.id, patientId));
}

// ============ Appointments ============

export async function createAppointment(appointment: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(appointments).values(appointment);
  return result;
}

export async function getAppointmentsByDoctor(doctorId: number, fromDate?: Date, toDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  if (fromDate && toDate) {
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          gte(appointments.appointmentDate, fromDate),
          lte(appointments.appointmentDate, toDate)
        )
      )
      .orderBy(desc(appointments.appointmentDate));
  }

  return await db
    .select()
    .from(appointments)
    .where(eq(appointments.doctorId, doctorId))
    .orderBy(desc(appointments.appointmentDate));
}

export async function getAppointmentById(appointmentId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAppointment(appointmentId: number, updates: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(appointments).set({ ...updates, updatedAt: new Date() }).where(eq(appointments.id, appointmentId));
}

export async function cancelAppointment(appointmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(appointments).set({ status: "cancelled", updatedAt: new Date() }).where(eq(appointments.id, appointmentId));
}

// ============ Examinations ============

export async function createExamination(examination: InsertExamination) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(examinations).values(examination);
  return result;
}

export async function getExaminationsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(examinations).where(eq(examinations.patientId, patientId)).orderBy(desc(examinations.examinationDate));
}

export async function getExaminationById(examinationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(examinations).where(eq(examinations.id, examinationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateExamination(examinationId: number, updates: Partial<InsertExamination>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(examinations).set({ ...updates, updatedAt: new Date() }).where(eq(examinations.id, examinationId));
}

// ============ Prescriptions ============

export async function createPrescription(prescription: InsertPrescription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(prescriptions).values(prescription);
  return result;
}

export async function getPrescriptionsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId)).orderBy(desc(prescriptions.prescriptionDate));
}

export async function getPrescriptionById(prescriptionId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(prescriptions).where(eq(prescriptions.id, prescriptionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePrescription(prescriptionId: number, updates: Partial<InsertPrescription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(prescriptions).set({ ...updates, updatedAt: new Date() }).where(eq(prescriptions.id, prescriptionId));
}

// ============ Medical Reports ============

export async function createMedicalReport(report: InsertMedicalReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(medicalReports).values(report);
  return result;
}

export async function getReportsByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(medicalReports).where(eq(medicalReports.patientId, patientId)).orderBy(desc(medicalReports.reportDate));
}

export async function getReportById(reportId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(medicalReports).where(eq(medicalReports.id, reportId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateMedicalReport(reportId: number, updates: Partial<InsertMedicalReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(medicalReports).set({ ...updates, updatedAt: new Date() }).where(eq(medicalReports.id, reportId));
}

// ============ Uploaded Files ============

export async function createUploadedFile(file: InsertUploadedFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(uploadedFiles).values(file);
  return result;
}

export async function getFilesByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(uploadedFiles).where(eq(uploadedFiles.patientId, patientId)).orderBy(desc(uploadedFiles.uploadedDate));
}

export async function getFileById(fileId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, fileId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteFile(fileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(uploadedFiles).where(eq(uploadedFiles.id, fileId));
}

export async function getUploadedFilesByPatient(patientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(uploadedFiles).where(eq(uploadedFiles.patientId, patientId)).orderBy(desc(uploadedFiles.uploadedDate));
}

export async function deleteUploadedFile(fileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(uploadedFiles).where(eq(uploadedFiles.id, fileId));
}

// ============ Notifications ============

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getNotificationsByDoctor(doctorId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];

  if (unreadOnly) {
    return await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.doctorId, doctorId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
  }

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.doctorId, doctorId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, notificationId));
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(notifications).where(eq(notifications.id, notificationId));
}

export async function getPendingNotificationsByDoctor(doctorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.doctorId, doctorId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt));
}

// ============ System Settings ============

export async function getSystemSettings(doctorId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(systemSettings).where(eq(systemSettings.doctorId, doctorId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSystemSettings(settings: InsertSystemSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(systemSettings).values(settings);
  return result;
}

export async function updateSystemSettings(doctorId: number, updates: Partial<InsertSystemSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getSystemSettings(doctorId);

  if (existing) {
    await db.update(systemSettings).set({ ...updates, updatedAt: new Date() }).where(eq(systemSettings.doctorId, doctorId));
  } else {
    await createSystemSettings({ ...updates, doctorId } as InsertSystemSettings);
  }
}

// ============ Ownership & Audit ============

export async function logOwnershipTransfer(fromOwnerId: number | null, toOwnerId: number, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(ownershipLog).values({
    fromOwnerId,
    toOwnerId,
    transferReason: reason,
    transferDate: new Date(),
  });
}

export async function logSecurityEvent(userId: number | undefined, eventType: string, description?: string, status: "success" | "failure" | "warning" = "success") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log security event: database not available");
    return;
  }

  try {
    await db.insert(securityAuditLog).values({
      userId,
      eventType,
      eventDescription: description,
      status,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[Database] Failed to log security event:", error);
  }
}

// ============ Dashboard Statistics ============

export async function getPatientCountByDoctor(doctorId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(patients)
    .where(and(eq(patients.doctorId, doctorId), eq(patients.isActive, true)));
  return result.length;
}

export async function getTodayAppointmentsByDoctor(doctorId: number) {
  const db = await getDb();
  if (!db) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentDate, today),
        lte(appointments.appointmentDate, tomorrow),
        eq(appointments.status, "scheduled")
      )
    )
    .orderBy(appointments.appointmentDate);
}

export async function getRecentExaminationsByDoctor(doctorId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(examinations)
    .where(eq(examinations.doctorId, doctorId))
    .orderBy(desc(examinations.examinationDate))
    .limit(limit);
}
