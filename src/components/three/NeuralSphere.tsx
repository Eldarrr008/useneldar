import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;

  // Simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    
    float n1 = snoise(uv * 1.5 + uTime * 0.08);
    float n2 = snoise(uv * 2.0 - uTime * 0.06 + 3.0);
    float n3 = snoise(uv * 1.2 + uTime * 0.04 + 7.0);
    
    float blend1 = smoothstep(-0.3, 0.6, n1);
    float blend2 = smoothstep(-0.2, 0.7, n2);
    
    vec3 color = mix(uColor1, uColor2, blend1);
    color = mix(color, uColor3, blend2 * 0.5);
    
    // Add subtle brightness variation
    color += 0.04 * n3;
    
    // Soft vignette
    float vignette = 1.0 - smoothstep(0.3, 1.4, length(uv - 0.5) * 1.5);
    float alpha = vignette * 0.35;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

const GradientMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      // Primary green: hsl(158 45% 42%) ≈ rgb(0.23, 0.61, 0.49)
      uColor1: { value: new THREE.Color(0.23, 0.61, 0.49) },
      // Accent lavender: hsl(265 55% 68%) ≈ rgb(0.58, 0.42, 0.82)
      uColor2: { value: new THREE.Color(0.58, 0.42, 0.82) },
      // Soft teal blend
      uColor3: { value: new THREE.Color(0.30, 0.52, 0.65) },
    }),
    []
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <mesh ref={meshRef} scale={[12, 8, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

const FloatingOrb = ({ position, color, speed, size }: {
  position: [number, number, number];
  color: string;
  speed: number;
  size: number;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.2;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.12} />
    </mesh>
  );
};

const Scene = () => {
  return (
    <>
      <GradientMesh />
      <FloatingOrb position={[-2.5, 1, 0.5]} color="#3da882" speed={0.5} size={0.8} />
      <FloatingOrb position={[2.8, -0.5, 0.3]} color="#7c5cbf" speed={0.4} size={0.6} />
      <FloatingOrb position={[0, 1.5, 0.2]} color="#4d85a5" speed={0.6} size={0.5} />
      <FloatingOrb position={[-1.5, -1.2, 0.4]} color="#7c5cbf" speed={0.35} size={0.4} />
    </>
  );
};

const GradientBackground3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default GradientBackground3D;
