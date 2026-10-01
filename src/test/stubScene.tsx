import { useRef } from 'react';
import { Scene } from '../components/layout/Scene';
import type { ChapterId } from '../app/chapters';

/** Test stand-in for a heavy scene: same semantic wrapper, no visuals. */
export function stub(chapter: ChapterId) {
  return function StubScene() {
    const ref = useRef<HTMLElement>(null);
    return (
      <Scene chapter={chapter} sectionRef={ref}>
        <p>{chapter}</p>
      </Scene>
    );
  };
}
