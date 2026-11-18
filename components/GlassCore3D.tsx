"use client";

/**
 * แก่นแก้วหมุนช้า ๆ พร้อมตัวเลขลอยรอบตัว
 *
 * ทำไมเป็นวัตถุทึบรูปทรงชัด ไม่ใช่กลุ่มอนุภาคเรืองแสง:
 * อนุภาคเรืองแสงคือภาษาภาพของเว็บ AI ซึ่งทุกทีมใช้กันหมด
 * วัตถุแก้วที่มีการหักเหและเงาจริงให้ความรู้สึกเป็น "ของ" ที่จับต้องได้
 * ซึ่งตรงกับสิ่งที่เราขาย คือหนังสือที่ถือได้จริง ไม่ใช่บริการลอย ๆ
 *
 * ตัวเลขทำเป็น HTML ซ้อนด้านบน ไม่ใช่ text ใน 3D
 * เพราะ text ใน WebGL จะเบลอบนจอ retina และอ่านยากสำหรับผู้สูงอายุ
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Crystal() {
  const mesh = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.22;
      mesh.current.rotation.x = Math.sin(t * 0.3) * 0.18;
      mesh.current.position.y = Math.sin(t * 0.7) * 0.06;
    }
    if (ring.current) {
      ring.current.rotation.z = -t * 0.35;
      ring.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.25) * 0.12;
    }
  });

  return (
    <>
      {/* ไฟสีอุ่นกับเย็นคู่กัน ทำให้ผิวแก้วมีสองโทนเหมือนแสงจริงในบ้าน */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 3]} intensity={2.2} color="#fff4de" />
      <directionalLight position={[-3, -1, 2]} intensity={1.1} color="#9db9ff" />
      <pointLight position={[0, 0, 3]} intensity={2} color="#e3b254" />

      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshPhysicalMaterial
          color="#fff6e6"
          transmission={0.92}
          thickness={1.4}
          roughness={0.12}
          metalness={0}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.08}
          reflectivity={0.6}
          attenuationColor={new THREE.Color("#e3b254")}
          attenuationDistance={2.4}
        />
      </mesh>

      {/* วงแหวนทองรอบแก่น = เสียงที่หมุนวนอยู่รอบความทรงจำ */}
      <mesh ref={ring}>
        <torusGeometry args={[1.6, 0.016, 12, 128]} />
        <meshBasicMaterial color="#c9953a" transparent opacity={0.65} />
      </mesh>
      <mesh rotation={[Math.PI / 2.6, 0.4, 0]}>
        <torusGeometry args={[1.85, 0.01, 10, 128]} />
        <meshBasicMaterial color="#c9953a" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

export default function GlassCore3D({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Crystal />
      </Canvas>
    </div>
  );
}
