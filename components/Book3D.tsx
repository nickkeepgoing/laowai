"use client";

/**
 * หนังสือเปิดสามมิติ ที่มีเสียงลอยออกมาจากหน้ากระดาษ
 *
 * อธิบายสิ่งที่ประโยคเดียวอธิบายได้ช้ากว่า:
 * "หนังสือเล่มนี้ไม่ได้มีแค่ตัวหนังสือ แต่มีเสียงอยู่ในนั้นด้วย"
 *
 * อนุภาคลอยขึ้นจากหน้าขวา = เสียงที่ยังอยู่ในเล่ม รอให้ใครสักคนสแกน
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Pages() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.rotation.y = Math.sin(t * 0.25) * 0.5 - 0.15;
    g.position.y = Math.sin(t * 0.6) * 0.045;
  });

  // เส้นบรรทัดบนหน้ากระดาษ วาดเป็น plane บาง ๆ แทนการใช้ texture
  const lines = useMemo(
    () => [0.42, 0.26, 0.1, -0.06, -0.22].map((y, i) => ({ y, w: i % 2 ? 0.52 : 0.68 })),
    []
  );

  return (
    <group ref={group} rotation={[0.34, 0, 0]}>
      {/* หน้าซ้าย */}
      <mesh position={[-0.47, 0, 0]} rotation={[0, 0.22, 0]}>
        <planeGeometry args={[0.92, 1.26]} />
        <meshBasicMaterial color="#fffdf9" side={THREE.DoubleSide} />
      </mesh>
      {/* หน้าขวา */}
      <mesh position={[0.47, 0, 0]} rotation={[0, -0.22, 0]}>
        <planeGeometry args={[0.92, 1.26]} />
        <meshBasicMaterial color="#fdf8ef" side={THREE.DoubleSide} />
      </mesh>

      {/* สันหนังสือ */}
      <mesh position={[0, 0, -0.012]}>
        <planeGeometry args={[0.055, 1.3]} />
        <meshBasicMaterial color="#c9953a" side={THREE.DoubleSide} />
      </mesh>

      {/* บรรทัดข้อความบนหน้าซ้าย */}
      {lines.map((l, i) => (
        <mesh key={i} position={[-0.52, l.y, 0.004]} rotation={[0, 0.22, 0]}>
          <planeGeometry args={[l.w, 0.035]} />
          <meshBasicMaterial color="#e0d4c0" side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* บล็อก QR บนหน้าขวา — สื่อว่าหน้านี้ "ฟังได้" */}
      <group position={[0.46, -0.3, 0.005]} rotation={[0, -0.22, 0]}>
        <mesh>
          <planeGeometry args={[0.34, 0.34]} />
          <meshBasicMaterial color="#211a12" side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 25 }).map((_, i) => {
          const r = Math.floor(i / 5);
          const c = i % 5;
          if ((r * 5 + c) % 3 !== 0) return null;
          return (
            <mesh key={i} position={[(c - 2) * 0.058, (2 - r) * 0.058, 0.002]}>
              <planeGeometry args={[0.05, 0.05]} />
              <meshBasicMaterial color="#fdf8ef" side={THREE.DoubleSide} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** อนุภาคเสียงที่ลอยขึ้นจากหน้ากระดาษ */
function RisingVoice() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 320;

  const { positions, speed } = useMemo(() => {
    const p = new Float32Array(COUNT * 3);
    const s = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      p[i * 3] = (Math.random() - 0.3) * 1.3;
      p[i * 3 + 1] = Math.random() * 2 - 0.4;
      p[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      s[i] = 0.1 + Math.random() * 0.22;
    }
    return { positions: p, speed: s };
  }, []);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speed[i] * delta;
      // วนกลับลงมาเมื่อลอยพ้นกรอบ ทำให้ดูไหลต่อเนื่องไม่มีสะดุด
      if (arr[i * 3 + 1] > 1.7) arr[i * 3 + 1] = -0.45;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#c9953a"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Book3D({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0.15, 2.6], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Pages />
        <RisingVoice />
      </Canvas>
    </div>
  );
}
