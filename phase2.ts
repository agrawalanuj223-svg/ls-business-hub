import { NextResponse } from "next/server";
import { z } from "zod";

export const companyIdSchema = z.string().uuid();
export const uuidSchema = z.string().uuid();

export const companyCreateSchema = z.object({
  company_code: z.string().trim().min(2).max(40),
  legal_name: z.string().trim().min(2).max(200),
  display_name: z.string().trim().min(2).max(120),
  city: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
});

export const partnerCreateSchema = z.object({
  company_id: uuidSchema,
  partner_code: z.string().trim().min(2).max(40),
  partner_type: z.enum(["CLIENT", "VENDOR", "BOTH"]),
  company_name: z.string().trim().min(2).max(200),
  contact_person: z.string().trim().max(120).nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  payment_terms_days: z.number().int().min(0).max(3650).default(0),
});

export const serviceOrderCreateSchema = z.object({
  company_id: uuidSchema,
  business_partner_id: uuidSchema,
  order_number: z.string().trim().min(2).max(60),
  service_description: z.string().trim().min(2).max(5000),
  start_date: z.string().date(),
  end_date: z.string().date().nullable().optional(),
  contract_value: z.number().nonnegative().default(0),
  billing_frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "ONE_TIME", "CUSTOM"]),
  billing_day: z.number().int().min(1).max(31).nullable().optional(),
  payment_terms_days: z.number().int().min(0).max(3650).default(0),
  notes: z.string().max(5000).nullable().optional(),
});

export function jsonError(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  console.error(error);
  return NextResponse.json({ error: "Request failed" }, { status: 400 });
}

export async function parseJson<T>(request: Request, schema: z.ZodSchema<T>) {
  const body: unknown = await request.json();
  return schema.parse(body);
}
