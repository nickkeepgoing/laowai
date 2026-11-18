"use client";

/**
 * นาฬิกาทรายอนุภาค — ใช้ในส่วน "ทำไมเรื่องนี้ต้องรีบ"
 *
 * เม็ดทรายไหลจากห้องบนลงห้องล่างแล้ววนกลับ
 * สื่อเรื่องเวลาที่เหลือกับผู้สูงอายุ ซึ่งเป็นแกนของทั้งโปรเจกต์
 *
 * เลือกทำเป็นอนุภาคไหลแทนโมเดลนาฬิกาทรายทึบ
 * เพราะเม็ดที่ไหลทีละเม็ดอ่านเป็น "เวลาที่กำลังหมดไป" ได้ชัดกว่ารูปทรงนิ่ง
 */

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 900;

/** รัศมีของนาฬิกาทรายที่ความสูง y — คอดตรงกลาง */
function radiusAt(y: number) {
  return 0.12 + Math.abs(y) * 0.78;
}

function Sand() {
  const ref = useRef<THREE.Points>(null);

  const { positions, vel, theta, rad } = useMemo(() => {
    const p = new Float32Array(COUNT * 3);
    const v = new Float32Array(COUNT);
    const th = new Float32Array(COUNT);
    const rd = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const y = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radiusAt(y) * 0.92;
      p[i * 3] = Math.cos(t) * r;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = Math.sin(t) * r;
      v[i] = 0.1 + Math.random() * 0.26;
      th[i] = t;
      rd[i] = r;
    }
    return { positions: p, vel: v, theta: th, rad: rd };
  }, []);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const a = pts.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      let y = a[i3 + 1];

      // ยิ่งใกล้คอยิ่งไหลเร็ว เหมือนทรายจริงที่เร่งตรงช่องแคบ
      const nearNeck = 1 - Math.min(1, Math.abs(y) * 1.6);
      y -= vel[i] * delta * (0.5 + nearNeck * 1.8);

      // ตกถึงก้นแล้ววนกลับขึ้นห้องบน เพื่อให้ไหลต่อเนื่องไม่มีสะดุด
      if (y < -1) y = 1;

      const maxR = radiusAt(y) * 0.92;
      const r = Math.min(rad[i], maxR);
      a[i3] = Math.cos(theta[i]) * r;
      a[i3 + 1] = y;
      a[i3 + 2] = Math.sin(theta[i]) * r;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y += delta * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#c9953a"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** โครงแก้วบาง ๆ ให้รู้ว่าเป็นนาฬิกาทราย ไม่ใช่กลุ่มอนุภาคลอย */
function GlassShell() {
  const pts = useMemo(() => {
    const top: THREE.Vector3[] = [];
    const bottom: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const y = i / 24;
      top.push(new THREE.Vector3(radiusAt(y), y, 0));
      bottom.push(new THREE.Vector3(radiusAt(-y), -y, 0));
    }
    return { top, bottom };
  }, []);

  return (
    <group>
      {[0, Math.PI / 2].map((rot) => (
        <group key={rot} rotation={[0, rot, 0]}>
          {[1, -1].map((side) => (
            <group key={side} scale={[side, 1, 1]}>
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array(pts.top.flatMap((v) => [v.x, v.y, v.z])),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#d9c7ab" transparent opacity={0.75} />
              </line>
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array(pts.bottom.flatMap((v) => [v.x, v.y, v.z])),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#d9c7ab" transparent opacity={0.75} />
              </line>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function Hourglass3D({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 3.4], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Sand />
        <GlassShell />
      </Canvas>
    </div>
  );
}
