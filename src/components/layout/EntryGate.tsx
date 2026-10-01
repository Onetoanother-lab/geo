import { useRef, useState } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '../../lib/animation/gsap';
import { getState, setState, useStore, isReducedMotion } from '../../app/store';
import { clearSavedScroll, savedScroll, setSound } from '../../app/useAppEffects';
import { nearestBeat } from '../../lib/animation/beats';
import { NARRATIVE } from '../../content/narrative';
import './EntryGate.css';

/**
 * The black threshold. Nothing plays before this click: it is the user gesture
 * that may unlock audio. Escape-free by design — it is not a modal trap, the
 * buttons are the only content.
 */
export function EntryGate() {
  const entered = useStore((s) => s.entered);
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const [resumeY] = useState(() => savedScroll());
  const t = NARRATIVE.gate;

  useGSAP(
    () => {
      if (isReducedMotion(getState())) return;
      gsap.from('.gate-reveal', { opacity: 0, y: 14, duration: 2.2, ease: 'power2.out', stagger: 0.35, delay: 0.3 });
    },
    { scope: ref },
  );

  const enter = (withSound: boolean, resume: boolean) => {
    if (withSound) void setSound(true);
    const reduced = isReducedMotion(getState());
    const finish = () => {
      setGone(true);
      document.getElementById('experience')?.focus({ preventScroll: true });
    };
    setState({ entered: true });
    window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      if (resume && resumeY > 0) {
        const b = nearestBeat(resumeY);
        window.scrollTo({ top: b ? b.y : resumeY, behavior: 'auto' });
      } else {
        clearSavedScroll();
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
    if (reduced) finish();
    else gsap.to(ref.current, { opacity: 0, duration: 1.8, ease: 'power2.inOut', onComplete: finish });
  };

  if (gone) return null;

  return (
    <div ref={ref} className="entry-gate" data-entered={entered} aria-hidden={entered}>
      <div className="gate-fog" aria-hidden="true" />
      <div className="gate-content">
        <p className="label gate-reveal">{t.kicker}</p>
        <h1 className="gate-title gate-reveal">
          <span className="gate-word">{t.title}</span>
          <span className="gate-sub">{t.subtitle}</span>
        </h1>
        <p className="gate-question gate-reveal">{t.question}</p>
        <div className="gate-actions gate-reveal">
          <button type="button" className="gate-enter" onClick={() => enter(true, resumeY > 0)} autoFocus>
            <span className="gate-enter-main">{resumeY > 0 ? t.resume : t.enter}</span>
            <span className="gate-enter-sub">{t.withSound}</span>
          </button>
          <button type="button" className="gate-quiet" onClick={() => enter(false, resumeY > 0)}>
            {t.enterQuiet}
          </button>
          {resumeY > 0 && (
            <button type="button" className="gate-quiet" onClick={() => enter(false, false)}>
              {t.restart}
            </button>
          )}
        </div>
        <p className="gate-hint gate-reveal">{t.hint}</p>
      </div>
    </div>
  );
}
