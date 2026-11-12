/**
 * CardGrid — responsive CSS grid container for Card components.
 *
 * Column count is controlled by the `cols` attribute, which validation
 * limits to 1–`CARD_GRID_MAX_COLUMNS` (see markdoc-config.ts), default 3.
 * The value is passed as a `--cols` CSS custom property so the grid
 * layout is driven entirely by CSS, keeping component logic minimal.
 * Responsive collapse (to 2-col at medium, 1-col at small) is handled
 * in CardGrid.module.css via media queries.
 *
 * Registered as a Markdoc tag (`cardGrid`) in markdoc-config.ts and
 * added to ArticlePage.tsx's and LandingPage.tsx's components maps.
 */

import React from 'react';
import styles from './CardGrid.module.css';

interface CardGridProps {
  cols?: string;
  children?: React.ReactNode;
}

export function CardGrid({ cols, children }: CardGridProps) {
  return (
    <div
      className={styles.cardGrid}
      style={{ '--cols': cols } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

export default CardGrid;
