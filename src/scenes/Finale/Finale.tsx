import { useRef } from 'react';
import { Scene } from '../../components/layout/Scene';
import { ForestScene } from '../../components/visualizations/forest/ForestScene';
import { SourcesList } from '../../components/controls/SourcesList';
import { useSceneTimeline } from '../../lib/animation/useSceneTimeline';
import { goHome } from '../../lib/animation/navigator';
import { setState } from '../../app/store';
import { NARRATIVE } from '../../content/narrative';
import './Finale.css';

const T = NARRATIVE.finale;

/**
 * ACT XII — reflection. The opening forest returns (same seed), the first line
 * is rewritten, practical responses, then the full source list.
 */
export function Finale() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useSceneTimeline(sectionRef, stageRef, {
    chapter: 'finale',
    length: 2.2,
    scrub: 1,
    build: (tl, { reduced }) => {
      tl.addLabel('beat:echo', 6)
        .fromTo('.fi-forest', { opacity: 0 }, { opacity: 1, duration: 8 }, 0)
        .fromTo('.fi-before', { opacity: 0 }, { opacity: 1, duration: 8 }, 4)
        .fromTo('.fi-before', { '--strike': 0 }, { '--strike': 1, duration: 10 }, 26)
        .to('.fi-before', { opacity: 0.35, duration: 8 }, 34)
        .fromTo('.fi-after', { opacity: 0, y: reduced ? 0 : 16 }, { opacity: 1, y: 0, duration: 10 }, 44)
        .addLabel('beat:after', 56)
        .fromTo('.fi-thanks', { opacity: 0 }, { opacity: 1, duration: 8 }, 72)
        .addLabel('beat:thanks', 84);
    },
  });

  return (
    <Scene
      chapter="finale"
      sectionRef={sectionRef}
      stageRef={stageRef}
      stageClassName="fi-stage"
      after={
        <div className="fi-after-content">
          <section className="fi-actions" aria-labelledby="fi-actions-title">
            <h3 id="fi-actions-title" className="title">
              {T.actionsTitle}
            </h3>
            <ol>
              {T.actions.map((a, i) => (
                <li key={a}>
                  <span className="fi-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p>{a}</p>
                </li>
              ))}
            </ol>
          </section>
          <section className="fi-sources" aria-labelledby="fi-sources-title">
            <h3 id="fi-sources-title" className="title">
              {T.sources}
            </h3>
            <SourcesList />
            <div className="fi-buttons">
              <button type="button" className="pill-button" onClick={() => setState({ sourcesOpen: true })}>
                {T.sources}
              </button>
              <button type="button" className="pill-button" onClick={goHome}>
                {T.restart}
              </button>
            </div>
            <p className="fi-credits">{T.credits}</p>
          </section>
        </div>
      }
    >
      <div className="fi-forest">
        <ForestScene seed={11} life={0.95} />
      </div>
      <div className="fi-lines">
        <p className="fi-before display">{T.echoBefore}</p>
        <p className="fi-after display">{T.echoAfter}</p>
        <p className="fi-thanks label">{T.thanks}</p>
      </div>
    </Scene>
  );
}
