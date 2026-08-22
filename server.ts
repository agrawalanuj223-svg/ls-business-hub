import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

export async function createSessionSupabase(request?: Request) {
  const cookieStore = await cookies();
  const authorization = request?.headers.get("authorization");
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: authorization?.startsWith("Bearer ")
        ? { headers: { Authorization: authorization } }
        : undefined,
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Server Components may be unable to mutate cookies. Route handlers
            // and middleware perform refresh persistence.
          }
        },
      },
    },
  );
}

export async function requireSession(request?: Request) {
  const supabase = await createSessionSupabase(request);
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("UNAUTHENTICATED");
  return { supabase, user: data.user };
}
