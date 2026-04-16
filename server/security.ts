import crypto from "crypto";

/**
 * نظام التشفير المتقدم لحماية البيانات الحساسة
 * يستخدم AES-256-GCM للتشفير المتقدم
 */

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * توليد مفتاح تشفير آمن من كلمة مرور
 */
export function deriveKey(password: string, salt: Buffer = crypto.randomBytes(SALT_LENGTH)): { key: Buffer; salt: Buffer } {
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");
  return { key, salt };
}

/**
 * تشفير البيانات باستخدام AES-256-GCM
 */
export function encryptData(data: string, masterKey: string): string {
  try {
    const { key, salt } = deriveKey(masterKey);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    const authTag = cipher.getAuthTag();
    
    // دمج الملح والـ IV والـ authTag مع البيانات المشفرة
    const combined = Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, "hex")]);
    return combined.toString("base64");
  } catch (error) {
    console.error("[Encryption] Error encrypting data:", error);
    throw new Error("فشل تشفير البيانات");
  }
}

/**
 * فك تشفير البيانات
 */
export function decryptData(encryptedData: string, masterKey: string): string {
  try {
    const combined = Buffer.from(encryptedData, "base64");
    
    // استخراج الملح والـ IV والـ authTag
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    
    // اشتقاق المفتاح من الملح المستخرج
    const { key } = deriveKey(masterKey, salt);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("[Encryption] Error decrypting data:", error);
    throw new Error("فشل فك تشفير البيانات");
  }
}

/**
 * توليد hash آمن للبيانات (للتحقق من السلامة)
 */
export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * التحقق من صحة hash
 */
export function verifyHash(data: string, hash: string): boolean {
  return hashData(data) === hash;
}

/**
 * توليد token عشوائي آمن
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * توليد مفتاح تشفير عشوائي للمستخدم
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * تشفير كلمة المرور (للمستقبل إذا لزم الأمر)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256");
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

/**
 * التحقق من كلمة المرور
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [saltHex, hashHex] = hash.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const hashVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha256");
  return hashVerify.toString("hex") === hashHex;
}

/**
 * نظام الملكية والتوثيق
 */
export interface OwnershipInfo {
  ownerId: number;
  ownerEmail: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
}

/**
 * التحقق من أن المستخدم هو المالك الأساسي
 */
export function isOwner(userEmail: string, ownerEmail: string = "mhm763517@gmail.com"): boolean {
  return userEmail?.toLowerCase() === ownerEmail.toLowerCase();
}

/**
 * التحقق من أن المستخدم لديه صلاحيات الطبيب
 */
export function isDoctorOrOwner(userRole: string): boolean {
  return userRole === "doctor" || userRole === "owner" || userRole === "admin";
}

/**
 * التحقق من أن المستخدم لديه صلاحيات الوصول للبيانات
 */
export function canAccessPatientData(userRole: string, userId: number, patientDoctorId: number): boolean {
  // المالك والمسؤول يمكنهم الوصول لأي بيانات
  if (userRole === "owner" || userRole === "admin") {
    return true;
  }
  
  // الطبيب يمكنه الوصول فقط لمرضاه
  if (userRole === "doctor" && userId === patientDoctorId) {
    return true;
  }
  
  return false;
}

/**
 * إنشاء سجل تدقيق أمني
 */
export interface SecurityAuditEntry {
  userId?: number;
  eventType: string;
  eventDescription?: string;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure" | "warning";
  timestamp: Date;
}

/**
 * تسجيل حدث أمني
 */
export function logSecurityEvent(entry: SecurityAuditEntry): void {
  console.log(`[Security Audit] ${entry.status.toUpperCase()}: ${entry.eventType}`, {
    userId: entry.userId,
    description: entry.eventDescription,
    ip: entry.ipAddress,
    timestamp: entry.timestamp.toISOString(),
  });
}

/**
 * التحقق من محاولات الوصول المريبة
 */
export function detectSuspiciousActivity(failedAttempts: number, timeWindowMinutes: number = 15): boolean {
  // إذا كان هناك أكثر من 5 محاولات فاشلة في 15 دقيقة، اعتبرها مريبة
  return failedAttempts > 5;
}

/**
 * تشفير البيانات الطبية الحساسة
 */
export function encryptMedicalData(data: Record<string, any>, encryptionKey: string): Record<string, any> {
  const sensitiveFields = ["allergies", "chronicDiseases", "currentMedications", "medicalHistory", "findings", "diagnosis", "recommendations", "medications", "dosage", "instructions"];
  
  const encrypted: Record<string, any> = { ...data };
  
  for (const field of sensitiveFields) {
    if (encrypted[field] && typeof encrypted[field] === "string") {
      encrypted[field] = encryptData(encrypted[field], encryptionKey);
    }
  }
  
  return encrypted;
}

/**
 * فك تشفير البيانات الطبية
 */
export function decryptMedicalData(data: Record<string, any>, encryptionKey: string): Record<string, any> {
  const sensitiveFields = ["allergies", "chronicDiseases", "currentMedications", "medicalHistory", "findings", "diagnosis", "recommendations", "medications", "dosage", "instructions"];
  
  const decrypted: Record<string, any> = { ...data };
  
  for (const field of sensitiveFields) {
    if (decrypted[field] && typeof decrypted[field] === "string") {
      try {
        decrypted[field] = decryptData(decrypted[field], encryptionKey);
      } catch (error) {
        console.warn(`[Decryption] Failed to decrypt field: ${field}`);
        decrypted[field] = null;
      }
    }
  }
  
  return decrypted;
}

/**
 * التحقق من قوة كلمة المرور
 */
export function isStrongPassword(password: string): boolean {
  // يجب أن تكون كلمة المرور على الأقل 8 أحرف
  // وتحتوي على أحرف كبيرة وصغيرة وأرقام ورموز
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

/**
 * تنظيف البيانات من المدخلات الخطرة (XSS Prevention)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة رقم الهاتف
 */
export function isValidPhone(phone: string): boolean {
  // قبول أرقام هاتف بصيغ مختلفة
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}
