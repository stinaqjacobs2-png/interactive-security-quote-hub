"use strict";
// lib/validation.js – Zod schemas for all API inputs
const { z } = require("zod");

const email = z.string().email().max(255).transform((v) => v.trim().toLowerCase());
const shortText = (max = 255) => z.string().max(max).transform((v) => v.trim());
const optionalText = (max = 255) => z.string().max(max).transform((v) => v.trim()).optional().or(z.literal(""));

// ── Auth ─────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email: email,
  password: z.string().min(1).max(200),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

// ── Members ──────────────────────────────────────────────────────

const MemberSchema = z.object({
  name: shortText(100),
  email: email,
  role: z.enum(["Super Admin", "Admin", "Full Access Member", "Quotation Builder Only"]),
  permissions: z.array(z.string().max(60)).default([]),
  inviteStatus: z.enum(["Pending", "Invite Sent", "Active", "Disabled"]).default("Pending"),
  tempPassword: z.string().min(8).max(200).optional().or(z.literal("")),
  phone: optionalText(50),
  branch: optionalText(100),
  department: optionalText(100),
});

// ── Sales reps ───────────────────────────────────────────────────

const SalesRepSchema = z.object({
  name: shortText(100),
  email: email,
  phone: optionalText(50),
});

// ── Clients ──────────────────────────────────────────────────────

const ClientSchema = z.object({
  name: shortText(200),
  address: optionalText(500),
  contact: optionalText(200),
  email: email.optional().or(z.literal("")),
  phone: optionalText(50),
});

// ── Supplier prices ──────────────────────────────────────────────

const SupplierPriceSchema = z.object({
  supplierName: shortText(200),
  stockCode: shortText(100),
  description: shortText(500),
  category: optionalText(100),
  cost: z.number().min(0),
});

// ── Quotation ────────────────────────────────────────────────────

const QuotationItemSchema = z.object({
  stockCode: optionalText(100),
  description: shortText(500),
  quantity: z.number().int().min(0),
  supplierCost: z.number().min(0),
});

const QuotationCostingSchema = z.object({
  stockCost: z.number().min(0).default(0),
  consumablesCost: z.number().min(0).default(0),
  labourCost: z.number().min(0).default(0),
});

const QuotationSchema = z.object({
  selectedCompany: z.enum(["isc-sa", "isc-limpopo", "isc-24", "isc-converted"]),
  clientName: shortText(200),
  clientAddress: optionalText(500),
  contactPerson: optionalText(200),
  contactEmail: email.optional().or(z.literal("")),
  contactNumber: optionalText(50),
  salesRep: shortText(100),
  quoteDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  validityDays: z.number().int().min(1).max(365).default(30),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  projectSummary: optionalText(5000),
  additionalScope: optionalText(5000),
  aiInstruction: optionalText(1000),
  termsText: optionalText(5000),
  markupPercent: z.number().min(0).max(500).default(20),
  items: z.array(QuotationItemSchema).min(1),
  costing: QuotationCostingSchema.default({}),
  revisionNumber: z.number().int().min(0).default(0),
  revisionSourceId: optionalText(200),
  salesRequestId: optionalText(200),
  supplierQuotes: z.array(z.object({
    fileId: shortText(200),
    name: shortText(500),
    size: z.number().optional(),
    type: optionalText(200),
  })).default([]),
});

// ── Sales requests ───────────────────────────────────────────────

const SalesRequestSchema = z.object({
  clientName: shortText(200),
  clientContactPerson: optionalText(200),
  clientEmail: email.optional().or(z.literal("")),
  clientPhone: optionalText(50),
  siteProjectName: optionalText(200),
  siteAddress: optionalText(500),
  salesRepId: optionalText(200),
  salesRepName: shortText(200),
  salesRepEmail: email.optional().or(z.literal("")),
  salesRepPhone: optionalText(50),
  requiredDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  descriptionOfWork: optionalText(5000),
  notesForBuilder: optionalText(2000),
});

// ── Settings ─────────────────────────────────────────────────────

const QuotationSettingsSchema = z.object({
  profitDeductionPercent: z.number().min(0).max(100),
  commissionPercent: z.number().min(0).max(100),
});

// ── SSO ──────────────────────────────────────────────────────────

const SsoCreateSchema = z.object({
  hubSlug: z.string().max(100),
});

const SsoConsumeSchema = z.object({
  token: z.string().max(200),
  hubSlug: z.string().max(100),
});

// ── Helper ───────────────────────────────────────────────────────

/**
 * Parse and validate a body against a schema.
 * Returns { data } on success, { error, issues } on failure.
 */
function validate(schema, body) {
  const result = schema.safeParse(body);
  if (result.success) return { data: result.data };
  return {
    error: "Validation failed",
    issues: result.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    })),
  };
}

module.exports = {
  LoginSchema, ChangePasswordSchema,
  MemberSchema, SalesRepSchema, ClientSchema,
  SupplierPriceSchema, QuotationSchema, SalesRequestSchema,
  QuotationSettingsSchema, SsoCreateSchema, SsoConsumeSchema,
  validate,
};
