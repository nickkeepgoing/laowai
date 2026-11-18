import { currentUser } from "@/lib/supabase/server";
import NavBar from "./NavBar";

/**
 * อ่านสถานะล็อกอินฝั่ง server แล้วส่งให้แถบนำทาง
 * ทำแบบนี้เพื่อไม่ให้มีจังหวะกระพริบจาก "ยังไม่รู้ว่าใครล็อกอิน" ซึ่งดูไม่โปรตอน demo
 */
export default async function SiteHeader() {
  const user = await currentUser();
  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "";

  return (
    <NavBar
      signedIn={Boolean(user)}
      name={name}
      avatar={user?.user_metadata?.avatar_url as string | undefined}
    />
  );
}
