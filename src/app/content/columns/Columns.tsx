/**
 * Columns — flex wrapper that lays out its `Column` children side by side.
 *
 * Equal-width only: each `Column` gets an equal share of the row (no
 * per-column width override). Column *count* comes from however many
 * `{% column %}` children the author nests — there's no `cols` attribute
 * to keep in sync with them, unlike `CardGrid`.
 *
 * Since this is an ordinary block-level tag, it needs no special handling
 * to appear mid-page: normal content, then a `{% columns %}...{% /columns %}`
 * block, then normal content again — or the author wraps the whole page body
 * in one `columns` block. Both just fall out of Markdoc's existing tag model.
 *
 * `divider` (default off) draws a vertical rule between columns — see
 * Columns.module.css's `.divided` rule, which targets "every child but the
 * first" structurally rather than depending on Column's own class name.
 *
 * Registered as a Markdoc tag (`columns`) in markdoc-config.ts and in
 * ArticlePage.tsx's and LandingPage.tsx's components maps.
 */

import type { ReactNode } from 'react';
import styles from './Columns.module.css';

interface ColumnsProps {
  divider?: boolean;
  children?: ReactNode;
}

export function Columns({ divider = false, children }: ColumnsProps) {
  return (
    <div className={`${styles.columns} ${divider ? styles.divided : ''}`}>
      {children}
    </div>
  );
}

export default Columns;
