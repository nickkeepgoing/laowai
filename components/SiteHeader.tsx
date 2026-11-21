import { currentUser } from "@/lib/supabase/server";
import NavBar from "./NavBar";
import BottomTabs from "./BottomTabs";
import AppRail from "./AppRail";

/**
 * อ่านสถานะล็อกอินฝั่ง server แล้วส่งให้แถบนำทางทั้งสองอัน
 * ทำแบบนี้เพื่อไม่ให้มีจังหวะกระพริบจาก "ยังไม่รู้ว่าใครล็อกอิน" ซึ่งดูไม่โปรตอน demo
 *
 * นำทางมีสามชุดที่ไม่ทับกัน ใครโผล่หน้าไหนกำหนดไว้ที่เดียวใน lib/chrome.ts
 *   แถบบนลอย        หน้า landing ทุกขนาดจอ · ในตัวแอปบนมือถือเหลือแค่โลโก้
 *   แถบแท็บล่าง      ในตัวแอปบนมือถือ
 *   แถบไอคอนซ้าย     ในตัวแอปบนเดสก์ท็อป
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
      <AppRail signedIn={signedIn} name={name} avatar={avatar} />
    </>
  );
}
