import { NextResponse } from "next/server";
import { requireSession } from "@/lib/supabase/server";
import { companyCreateSchema, jsonError, parseJson } from "@/lib/api/phase2";

export async function GET(request: Request) {
  try {
    const { supabase } = await requireSession(request);
    const { data, error } = await supabase
      .from("companies")
      .select("id, company_code, legal_name, display_name, status, city, state, email, phone, created_at, updated_at")
      .order("display_name");
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase } = await requireSession(request);
    const input = await parseJson(request, companyCreateSchema);
    const { data, error } = await supabase
      .from("companies")
      .insert(input)
      .select("id, company_code, legal_name, display_name, status, city, state, email, phone, created_at, updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
