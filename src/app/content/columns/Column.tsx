/**
 * Column — a single column inside `{% columns %}...{% /columns %}`.
 *
 * A plain flex-item wrapper with no attributes of its own: content inside
 * accepts the same broad model as `section`/`accordion` (headings,
 * paragraphs, lists, code fences, images, and any nested custom tag), so a
 * column reads exactly like normal article content — callouts, clips, cards,
 * even a nested `accordion` or `columns` all work.
 *
 * Only meaningful inside `columns`; used standalone it just renders as an
 * unstyled block.
 *
 * Registered as a Markdoc tag (`column`) in markdoc-config.ts and in
 * ArticlePage.tsx's and LandingPage.tsx's components maps.
 */

import type { ReactNode } from 'react';
import styles from './Column.module.css';

interface ColumnProps {
  children?: ReactNode;
}

export function Column({ children }: ColumnProps) {
  return <div className={styles.column}>{children}</div>;
}

export default Column;
