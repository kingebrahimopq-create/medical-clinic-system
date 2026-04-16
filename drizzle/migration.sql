CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`patientId` int NOT NULL,
	`appointmentDate` timestamp NOT NULL,
	`duration` int DEFAULT 30,
	`reason` text,
	`notes` text,
	`status` enum('scheduled','completed','cancelled','no-show','rescheduled') NOT NULL DEFAULT 'scheduled',
	`reminderSent` boolean NOT NULL DEFAULT false,
	`reminderSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `examinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`patientId` int NOT NULL,
	`appointmentId` int,
	`examinationType` varchar(255) NOT NULL,
	`examinationDate` timestamp NOT NULL DEFAULT (now()),
	`findings` longtext,
	`diagnosis` longtext,
	`recommendations` longtext,
	`attachments` json,
	`status` enum('draft','completed','reviewed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `examinations_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `medicalReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`patientId` int NOT NULL,
	`reportType` varchar(255) NOT NULL,
	`reportDate` timestamp NOT NULL DEFAULT (now()),
	`title` varchar(255) NOT NULL,
	`content` longtext,
	`fileUrl` text,
	`fileKey` varchar(255),
	`isConfidential` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medicalReports_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('appointment','reminder','system','alert') NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `ownershipLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromOwnerId` int,
	`toOwnerId` int NOT NULL,
	`transferReason` text,
	`transferDate` timestamp NOT NULL DEFAULT (now()),
	`documentUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ownershipLog_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20) NOT NULL,
	`dateOfBirth` timestamp,
	`gender` enum('male','female','other'),
	`bloodType` varchar(10),
	`allergies` text,
	`chronicDiseases` text,
	`currentMedications` text,
	`medicalHistory` longtext,
	`emergencyContactName` varchar(255),
	`emergencyContactPhone` varchar(20),
	`emergencyContactRelation` varchar(100),
	`address` text,
	`city` varchar(100),
	`country` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastVisit` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `prescriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`patientId` int NOT NULL,
	`examinationId` int,
	`prescriptionDate` timestamp NOT NULL DEFAULT (now()),
	`medications` longtext,
	`dosage` longtext,
	`duration` varchar(255),
	`instructions` text,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prescriptions_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `securityAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`eventType` varchar(100) NOT NULL,
	`eventDescription` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failure','warning') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `securityAuditLog_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `systemSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`appTitle` varchar(255),
	`appLogo` text,
	`primaryColor` varchar(7),
	`secondaryColor` varchar(7),
	`welcomeMessage` text,
	`enableEmailNotifications` boolean NOT NULL DEFAULT true,
	`enableSmsNotifications` boolean NOT NULL DEFAULT false,
	`appointmentReminderTime` int DEFAULT 24,
	`enablePatientPortal` boolean NOT NULL DEFAULT true,
	`enableFileSharing` boolean NOT NULL DEFAULT true,
	`autoBackupEnabled` boolean NOT NULL DEFAULT true,
	`backupFrequency` enum('daily','weekly','monthly') DEFAULT 'daily',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemSettings_id` PRIMARY KEY(`id`)
);
;
CREATE TABLE `uploadedFiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`patientId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileSize` int,
	`description` text,
	`uploadedDate` timestamp NOT NULL DEFAULT (now()),
	`isEncrypted` boolean NOT NULL DEFAULT true,
	`encryptionIv` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uploadedFiles_id` PRIMARY KEY(`id`)
);
;
ALTER TABLE `users` MODIFY COLUMN `role` enum('owner','doctor','patient','admin') NOT NULL DEFAULT 'patient';;
ALTER TABLE `users` ADD `phone` varchar(20);;
ALTER TABLE `users` ADD `specialization` varchar(255);;
ALTER TABLE `users` ADD `licenseNumber` varchar(255);;
ALTER TABLE `users` ADD `clinicName` varchar(255);;
ALTER TABLE `users` ADD `clinicAddress` text;;
ALTER TABLE `users` ADD `isOwner` boolean DEFAULT false NOT NULL;;
ALTER TABLE `users` ADD `ownerEmail` varchar(320) DEFAULT 'mhm763517@gmail.com';;
ALTER TABLE `users` ADD `isVerified` boolean DEFAULT false NOT NULL;;
ALTER TABLE `users` ADD `appTitle` varchar(255) DEFAULT 'نظام إدارة العيادة';;
ALTER TABLE `users` ADD `appLogo` text;;
ALTER TABLE `users` ADD `primaryColor` varchar(7) DEFAULT '#0066cc';;
ALTER TABLE `users` ADD `secondaryColor` varchar(7) DEFAULT '#00cc99';;
ALTER TABLE `users` ADD `welcomeMessage` text DEFAULT ('أهلاً وسهلاً في عيادتنا');;
ALTER TABLE `users` ADD `encryptionKey` text;