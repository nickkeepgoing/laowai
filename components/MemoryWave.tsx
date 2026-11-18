"use client";

/**
 * คลื่นเสียงสามมิติ — ใช้คั่นระหว่าง section
 *
 * ตาข่ายจุดที่ไหลเป็นคลื่นช้า ๆ สื่อถึง "เสียงที่ยังเคลื่อนไหวอยู่"
 * ต่างจาก VoiceOrb ที่เป็นเสียงหนึ่งเสียง อันนี้คือเสียงหลายคนหลายรุ่นต่อกัน
 *
 * ใช้ plane geometry ขยับ vertex ตรง ๆ ไม่ใช้ shader
 * เพราะอ่านง่ายกว่าเวลาคนอื่นในทีมมาแก้ และไม่มีปัญหา shader compile บนเครื่องแปลก ๆ
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function WaveMesh() {
  const ref = useRef<THREE.Points>(null);
  const COLS = 90;
  const ROWS = 26;

  const { positions, base } = useMemo(() => {
    const pos = new Float32Array(COLS * ROWS * 3);
    let i = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        pos[i++] = (c / (COLS - 1) - 0.5) * 9;
        pos[i++] = 0;
        pos[i++] = (r / (ROWS - 1) - 0.5) * 3.2;
      }
    }
    return { positions: pos, base: pos.slice() };
  }, []);

  useFrame(({ clock }) => {
    const pts = ref.current;
    if (!pts) return;
    const t = clock.getElapsedTime();
    const arr = pts.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i];
      const z = base[i + 2];
      // คลื่นสองชุดซ้อนกัน ทำให้ไม่เป็นจังหวะซ้ำซาก เหมือนเสียงพูดจริง
      arr[i + 1] =
        Math.sin(x * 0.9 + t * 1.1) * 0.26 +
        Math.sin(x * 0.35 + z * 0.8 - t * 0.7) * 0.18;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref} rotation={[-0.62, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#c9953a"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function MemoryWave({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 1.5, 4.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <WaveMesh />
      </Canvas>
    </div>
  );
}
