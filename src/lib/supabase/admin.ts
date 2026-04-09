import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseAdminEnv } from "@/lib/env";

export function getSupabaseAdminClient() {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  return createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
