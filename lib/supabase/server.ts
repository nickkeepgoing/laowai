import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, hasSupabase } from "@/lib/env";

/**
 * Supabase client ฝั่ง server ที่ผูกกับ cookie ของผู้ใช้
 *
 * ใช้ cookie แทน localStorage เพราะเราต้องการให้ server component
 * (หน้า /library, /interview/[id]) รู้ว่าใครล็อกอินอยู่ โดยไม่ต้องรอ JS ฝั่ง browser
 * และทำให้ RLS ที่อิง auth.uid() ทำงานจาก API route ได้ด้วย
 */
export async function supabaseServer() {
  if (!hasSupabase()) return null;
  const store = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // server component เขียน cookie ไม่ได้ — middleware จะ refresh session ให้แทน
        }
      },
    },
  });
}

/** ผู้ใช้ที่ล็อกอินอยู่ หรือ null ถ้ายังไม่ล็อกอิน */
export async function currentUser() {
  const client = await supabaseServer();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user ?? null;
}
