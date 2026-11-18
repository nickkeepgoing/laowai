/** POST /auth/signout — ออกจากระบบและล้าง cookie session */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const client = await supabaseServer();
  await client?.auth.signOut();
  return NextResponse.redirect(new URL("/", req.url), { status: 303 });
}
