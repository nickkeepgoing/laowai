"use client";

/**
 * ทรงกลมอนุภาคสีทอง = "เสียงหนึ่งเสียงที่ถูกเก็บไว้"
 *
 * ทำไมเป็น 3D จริง ไม่ใช่ภาพนิ่ง:
 * มันเต้นตามจังหวะช้า ๆ เหมือนลมหายใจ ทำให้หน้าแรกรู้สึกมีชีวิต
 * โดยไม่ต้องใช้รูปคนที่เรายังไม่มีสิทธิ์ใช้
 *
 * ข้อควรระวังที่ออกแบบเผื่อไว้:
 *   - โหลดแบบ dynamic เฉพาะตอนต้องใช้ ไม่ถ่วงหน้าแรก
 *   - เครื่องที่ไม่มี WebGL (คอมกลางในห้อง pitch อาจเป็นแบบนั้น) จะเห็นวงแสงนิ่งแทน
 *   - เคารพ prefers-reduced-motion
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Particles({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 2600;

  // กระจายจุดบนผิวทรงกลมแบบ fibonacci — สม่ำเสมอกว่าสุ่มล้วน
  const { positions, seeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const sd = new Float32Array(COUNT);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      sd[i] = Math.random();
    }
    return { positions: pos, seeds: sd };
  }, []);

  const base = useMemo(() => positions.slice(), [positions]);

  useFrame(({ clock }) => {
    const pts = ref.current;
    if (!pts) return;
    const t = clock.getElapsedTime();

    pts.rotation.y = reduced ? 0.4 : t * 0.1;
    pts.rotation.x = Math.sin(t * 0.18) * 0.12;

    if (reduced) return;

    // คลื่นวิ่งผ่านผิวทรงกลม = จังหวะของเสียงพูด
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      const wave =
        1 +
        0.07 * Math.sin(t * 1.5 + base[i3 + 1] * 5 + seeds[i] * 2) +
        0.03 * Math.sin(t * 0.7 + seeds[i] * 8);
      arr[i3] = base[i3] * wave;
      arr[i3 + 1] = base[i3 + 1] * wave;
      arr[i3 + 2] = base[i3 + 2] * wave;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.016}
        color="#c9953a"
        transparent
        opacity={0.92}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

export default function VoiceOrb({ className = "" }: { className?: string }) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 2.9], fov: 45 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        // ถ้าเครื่องไม่รองรับ WebGL React จะไม่ render อะไร แต่ fallback ด้านหลังยังอยู่
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Particles reduced={Boolean(reduced)} />
      </Canvas>
    </div>
  );
}
