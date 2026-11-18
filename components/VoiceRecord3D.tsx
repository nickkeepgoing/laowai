"use client";

/**
 * แผ่นเสียงสามมิติ — แทนที่ลูกแก้วเดิม
 *
 * ทำไมเปลี่ยน: ทรงหลายเหลี่ยมโปร่งแสงบนพื้นสว่างเรนเดอร์ออกมาเป็นลูกบอลเบจแบน
 * เพราะ material แบบ transmission ต้องมี environment map ถึงจะเห็นการหักเหสวย
 * ซึ่งเพิ่มเข้ามาแล้วจะหนักเกินไปสำหรับเครื่องในห้อง pitch
 *
 * แผ่นเสียงตอบโจทย์กว่าในทุกทาง:
 *   - เป็นสัญลักษณ์ของ "เสียงที่ถูกบันทึกไว้" ตรงกับสิ่งที่เราทำ
 *   - ร่องวงกลมซ้อนกันให้มิติชัดโดยไม่ต้องพึ่ง material ซับซ้อน
 *   - หมุนช้า ๆ อ่านออกทันทีว่าเป็นของที่กำลังเล่นอยู่
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Record() {
  const disc = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (disc.current) disc.current.rotation.z -= delta * 0.5;
  });

  // ร่องแผ่นเสียง — ความถี่ไม่เท่ากันเหมือนแผ่นจริง
  const grooves = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const r = 0.46 + i * 0.047;
        return { r, op: 0.18 + (i % 3 === 0 ? 0.22 : 0.05) };
      }),
    []
  );

  return (
    <group rotation={[-0.92, 0, 0.22]}>
      <group ref={disc}>
        {/* ตัวแผ่น */}
        <mesh>
          <circleGeometry args={[1.68, 72]} />
          <meshBasicMaterial color="#2a211a" side={THREE.DoubleSide} />
        </mesh>

        {/* ร่อง */}
        {grooves.map((g, i) => (
          <mesh key={i} position={[0, 0, 0.002]}>
            <ringGeometry args={[g.r, g.r + 0.012, 96]} />
            <meshBasicMaterial
              color="#c9953a"
              transparent
              opacity={g.op}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* ป้ายกลางแผ่น */}
        <mesh position={[0, 0, 0.004]}>
          <circleGeometry args={[0.42, 48]} />
          <meshBasicMaterial color="#e3b254" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.006]}>
          <ringGeometry args={[0.3, 0.315, 48]} />
          <meshBasicMaterial color="#fdf8ef" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* รูตรงกลาง */}
        <mesh position={[0, 0, 0.008]}>
          <circleGeometry args={[0.055, 24]} />
          <meshBasicMaterial color="#fdf8ef" side={THREE.DoubleSide} />
        </mesh>

        {/* แสงสะท้อนพาดแผ่น ทำให้ไม่แบน */}
        <mesh position={[0, 0, 0.003]} rotation={[0, 0, 0.6]}>
          <planeGeometry args={[3.4, 0.5]} />
          <meshBasicMaterial color="#f8e3ad" transparent opacity={0.07} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* วงแหวนทองลอยรอบ — เสียงที่แผ่ออกจากแผ่น */}
      <FloatingRings />
    </group>
  );
}

function FloatingRings() {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.getElapsedTime();
    g.current.children.forEach((c, i) => {
      const s = 1 + ((t * 0.28 + i * 0.33) % 1) * 0.9;
      c.scale.setScalar(s);
      const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = 0.42 * (1 - ((t * 0.28 + i * 0.33) % 1));
    });
  });

  return (
    <group ref={g} position={[0, 0, 0.01]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i}>
          <ringGeometry args={[1.72, 1.745, 96]} />
          <meshBasicMaterial color="#c9953a" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

export default function VoiceRecord3D({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 42 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Record />
      </Canvas>
    </div>
  );
}
