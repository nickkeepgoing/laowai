import { LibrarySkeleton } from "@/components/skeletons";

/** หน้าคลังต้องรอ listClips ของทุก session จึงเป็นหน้าที่ว่างนานที่สุดในแอป */
export default function Loading() {
  return <LibrarySkeleton />;
}
