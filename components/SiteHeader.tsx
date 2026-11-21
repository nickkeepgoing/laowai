import { currentUser } from "@/lib/supabase/server";
import NavBar from "./NavBar";
import BottomTabs from "./BottomTabs";

/**
 * อ่านสถานะล็อกอินฝั่ง server แล้วส่งให้แถบนำทางทั้งสองอัน
 * ทำแบบนี้เพื่อไม่ให้มีจังหวะกระพริบจาก "ยังไม่รู้ว่าใครล็อกอิน" ซึ่งดูไม่โปรตอน demo
 *
 * นำทางมีสองชุดที่ไม่ทับกัน แบ่งตามขนาดจอ:
 *   เดสก์ท็อป (lg+)  แถบลอยด้านบน แสดงลิงก์ครบ
 *   มือถือ           แถบแท็บด้านล่าง ส่วนแถบบนเหลือแค่โลโก้
 * อ่านสถานะครั้งเดียวแล้วส่งให้ทั้งคู่ จะได้ไม่ยิง Supabase ซ้ำ
 */
export default async function SiteHeader() {
  const user = await currentUser();
  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "";
  const signedIn = Boolean(user);
  const avatar = user?.user_metadata?.avatar_url as string | undefined;

  return (
    <>
      <NavBar signedIn={signedIn} name={name} avatar={avatar} />
      <BottomTabs signedIn={signedIn} name={name} avatar={avatar} />
    </>
  );
}
