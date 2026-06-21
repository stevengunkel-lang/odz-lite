import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (typeof window !== "undefined") {
  console.log("LIVE SUPABASE URL:", supabaseUrl);
  console.log("LIVE SUPABASE KEY LENGTH:", supabaseAnonKey.length);
  console.log("LIVE SUPABASE KEY START:", supabaseAnonKey.slice(0, 10));
}

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL fehlt");
}

if (!supabaseUrl.startsWith("https://")) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL ist ungültig: " + supabaseUrl);
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY fehlt");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);