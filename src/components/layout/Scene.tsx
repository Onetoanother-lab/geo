import type { ReactNode, RefObject } from 'react';
import { chapterById, type ChapterId } from '../../app/chapters';

type Props = {
  chapter: ChapterId;
  sectionRef: RefObject<HTMLElement | null>;
  stageRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  stageClassName?: string;
  /** Auto-height stage for non-pinned, scrolling content. */
  auto?: boolean;
  children: ReactNode;
  after?: ReactNode;
};

/** Semantic wrapper for one act: a labelled section with a visually-hidden heading and a stage. */
export function Scene({ chapter, sectionRef, stageRef, className, stageClassName, auto, children, after }: Props) {
  const c = chapterById(chapter);
  return (
    <section ref={sectionRef} className={`scene scene--${chapter} ${className ?? ''}`} data-chapter={chapter} aria-labelledby={`${chapter}-heading`}>
      <h2 id={`${chapter}-heading`} className="visually-hidden">
        {c.numeral}. {c.title}
      </h2>
      <div ref={stageRef} className={`stage ${auto ? 'stage--auto' : ''} ${stageClassName ?? ''}`}>
        {children}
      </div>
      {after}
    </section>
  );
}
