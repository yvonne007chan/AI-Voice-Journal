/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Particles from './Particles';

export default function Experience({ audioPulse = 0, imageData = null }: { audioPulse?: number, imageData?: any }) {
  return (
    <div className="w-full h-full bg-black">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={35} />
        <OrbitControls 
          enablePan={false} 
          enableRotate={false} 
          enableZoom={false} 
          makeDefault 
        />
        
        <color attach="background" args={['#000000']} />
        
        <Particles audioPulse={audioPulse} imageData={imageData} />

        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.5} 
            radius={0.4} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
