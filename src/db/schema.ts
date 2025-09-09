import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum للأدوار
export const userRoleEnum = pgEnum('user_role', ['admin', 'employee']);

// Enum لأنواع رموز التحقق
export const verificationTypeEnum = pgEnum('verification_type', ['login', 'password_reset']);

// جدول المستخدمين
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('employee'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by'),
});

// جدول رموز التحقق
export const verificationCodes = pgTable('verification_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 6 }).notNull(),
  type: verificationTypeEnum('type').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// جدول جلسات المستخدمين
export const userSessions = pgTable('user_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
});

// العلاقات
export const usersRelations = relations(users, ({ many, one }) => ({
  verificationCodes: many(verificationCodes),
  sessions: many(userSessions),
  createdByUser: one(users, {
    fields: [users.createdBy],
    references: [users.id],
    relationName: 'UserCreatedBy'
  }),
  createdUsers: many(users, {
    relationName: 'UserCreatedBy'
  }),
}));

export const verificationCodesRelations = relations(verificationCodes, ({ one }) => ({
  user: one(users, {
    fields: [verificationCodes.userId],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

// جدول العملاء
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  nationalId: varchar('national_id', { length: 50 }),
  companyName: varchar('company_name', { length: 255 }),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  totalDebt: decimal('total_debt', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalPaid: decimal('total_paid', { precision: 12, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

export const customerTransactions = pgTable('customer_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'debt' أو 'payment'
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  dueDate: timestamp('due_date'),
  paidDate: timestamp('paid_date'),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'paid', 'overdue'
  paymentMethod: varchar('payment_method', { length: 50 }), // 'cash', 'bank_transfer', 'check', etc.
  referenceNumber: varchar('reference_number', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

// جدول سجل المدفوعات التفصيلي
export const paymentHistory = pgTable('payment_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  transactionId: uuid('transaction_id').references(() => customerTransactions.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  referenceNumber: varchar('reference_number', { length: 100 }),
  notes: text('notes'),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

// العلاقات للعملاء
export const customersRelations = relations(customers, ({ many, one }) => ({
  transactions: many(customerTransactions),
  payments: many(paymentHistory),
  createdByUser: one(users, {
    fields: [customers.createdBy],
    references: [users.id],
  }),
}));

export const customerTransactionsRelations = relations(customerTransactions, ({ one, many }) => ({
  customer: one(customers, {
    fields: [customerTransactions.customerId],
    references: [customers.id],
  }),
  payments: many(paymentHistory),
  createdByUser: one(users, {
    fields: [customerTransactions.createdBy],
    references: [users.id],
  }),
}));

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  customer: one(customers, {
    fields: [paymentHistory.customerId],
    references: [customers.id],
  }),
  transaction: one(customerTransactions, {
    fields: [paymentHistory.transactionId],
    references: [customerTransactions.id],
  }),
  createdByUser: one(users, {
    fields: [paymentHistory.createdBy],
    references: [users.id],
  }),
}));

// جدول الموردين
export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  nationalId: varchar('national_id', { length: 50 }),
  companyName: varchar('company_name', { length: 255 }),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  totalDebt: decimal('total_debt', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalPaid: decimal('total_paid', { precision: 12, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

// جدول معاملات الموردين (الديون والمدفوعات)
export const supplierTransactions = pgTable('supplier_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'debt' أو 'payment'
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  dueDate: timestamp('due_date'),
  paidDate: timestamp('paid_date'),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'paid', 'overdue'
  paymentMethod: varchar('payment_method', { length: 50 }), // 'cash', 'bank_transfer', 'check', etc.
  referenceNumber: varchar('reference_number', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

// جدول سجل مدفوعات الموردين التفصيلي
export const supplierPaymentHistory = pgTable('supplier_payment_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  transactionId: uuid('transaction_id').references(() => supplierTransactions.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  referenceNumber: varchar('reference_number', { length: 100 }),
  notes: text('notes'),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
})

// العلاقات للموردين
export const suppliersRelations = relations(suppliers, ({ many, one }) => ({
  transactions: many(supplierTransactions),
  payments: many(supplierPaymentHistory),
  createdByUser: one(users, {
    fields: [suppliers.createdBy],
    references: [users.id],
  }),
}));

export const supplierTransactionsRelations = relations(supplierTransactions, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [supplierTransactions.supplierId],
    references: [suppliers.id],
  }),
  payments: many(supplierPaymentHistory),
  createdByUser: one(users, {
    fields: [supplierTransactions.createdBy],
    references: [users.id],
  }),
}));

export const supplierPaymentHistoryRelations = relations(supplierPaymentHistory, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierPaymentHistory.supplierId],
    references: [suppliers.id],
  }),
  transaction: one(supplierTransactions, {
    fields: [supplierPaymentHistory.transactionId],
    references: [supplierTransactions.id],
  }),
  createdByUser: one(users, {
    fields: [supplierPaymentHistory.createdBy],
    references: [users.id],
  }),
}));

// جدول الإعدادات العامة للنظام
export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyName: varchar("company_name", { length: 255 }),
  companyDescription: text("company_description"),
  companyLogoWebp: text("company_logo_webp"), // WebP format for better compression
  companyLogoPng: text("company_logo_png"),   // PNG fallback for compatibility
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const systemSettingsRelations = relations(systemSettings, () => ({}));