import type { ReactNode } from 'react';

type Props = {
  id?: string;
  className?: string;
  size?: 'display' | 'colossal' | 'title' | 'lead';
  position?: 'center' | 'low' | 'high';
  children: ReactNode;
  as?: 'p' | 'h3';
};

/** A line of narration living inside the scene (not in a box). */
export function Narration({ id, className, size = 'display', position = 'center', children, as = 'p' }: Props) {
  const Tag = as;
  const sizeClass = size === 'colossal' ? 'display display--colossal' : size === 'display' ? 'display' : size === 'title' ? 'title' : 'lead';
  return (
    <div className={`narration narration--${position} ${className ?? ''}`} data-line={id}>
      <Tag className={sizeClass}>{children}</Tag>
    </div>
  );
}
