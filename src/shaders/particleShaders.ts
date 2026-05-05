/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const vertexShader = `
  uniform float uTime;
  uniform float uDispersion;
  uniform float uSize;
  uniform vec3 uMouse;
  uniform float uMouseRadius;
  uniform float uAudioPulse;
  uniform float uClickPulse;
  uniform vec3 uClickPos;
  uniform float uFlowSpeed;
  uniform float uFlowAmplitude;
  uniform float uContrast;

  attribute float aSize;
  attribute vec3 aOffset;
  attribute vec3 color;

  varying vec3 vColor;
  varying float vDistance;

  // Simple noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0);
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - p.xzw * n_;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    // Basic position based on disk distribution
    vec3 pos = position * uDispersion;

    // Simulate a mountain ridge landscape
    float ridge = exp(-pow(pos.x * 0.2, 2.0)) * 2.0;
    float terrain = snoise(vec3(pos.x * 0.1, pos.y * 0.1, 0.0)) * 1.5;
    pos.y += ridge + terrain;

    // Flow field movement
    float noiseScale = 0.5;
    float noiseFreq = uFlowSpeed;
    vec3 noisePos = pos * noiseScale + aOffset + uTime * noiseFreq;
    float noiseVal = snoise(noisePos);
    
    pos += noiseVal * uFlowAmplitude;

    // Audio Pulse effect
    float pulse = uAudioPulse * (1.0 + snoise(pos + uTime * 3.0));
    pos *= (1.0 + pulse * 0.15);

    // Mouse Interaction
    float dist = distance(pos, uMouse);
    vDistance = dist;
    
    if (dist < uMouseRadius) {
      float strength = (1.0 - dist / uMouseRadius);
      vec3 dir = normalize(pos - uMouse);
      pos += dir * strength * 2.0;
    }

    // Click Repulsion (Shockwave)
    float clickDist = distance(pos, uClickPos);
    float waveRadius = uClickPulse * 30.0;
    float waveWidth = 4.0;
    float shockwave = smoothstep(waveRadius - waveWidth, waveRadius, clickDist) * 
                      smoothstep(waveRadius + waveWidth, waveRadius, clickDist);
    
    pos += normalize(pos - uClickPos) * shockwave * (uClickPulse * 15.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Particle size logic
    gl_PointSize = uSize * aSize * (1000.0 / -mvPosition.z);
    
    // Use attribute color
    float heightFactor = smoothstep(-2.0, 5.0, pos.y);
    vColor = color * (0.8 + heightFactor * 0.2);
  }
`;

export const fragmentShader = `
  varying vec3 vColor;
  varying float vDistance;
  uniform float uContrast;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.0, dist);
    // Apply contrast to the glow
    alpha = pow(alpha, uContrast);
    
    // Extra glow in the middle
    alpha += pow(smoothstep(0.5, 0.2, dist), 3.0) * 0.8;
    
    gl_FragColor = vec4(vColor, alpha * 0.9);
  }
`;
