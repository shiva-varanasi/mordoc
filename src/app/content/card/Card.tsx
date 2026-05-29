/**
 * Card — flexible content card supporting icon, image, and plain variants.
 *
 * Variant is inferred from props: `image` → image card, `icon` → icon card,
 * neither → plain. Compact mode activates automatically when no body text is
 * provided (self-closing tag). When `path` is set the entire card is a link;
 * internal paths (starting with "/") use React Router Link for SPA navigation,
 * external URLs open in a new tab.
 *
 * Registered as a Markdoc tag (`card`) in markdoc-config.ts and added to
 * Content.tsx's components map. Intended to be used inside {% cardGrid %}.
 */

import { Link } from 'react-router';
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  path?: string;
  icon?: string;
  image?: string;
  tag?: string;
  children?: React.ReactNode;
}

function ArrowIcon() {
  return (
    <svg
      className={styles.arrow}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CardInner({ title, path, icon, image, tag, children }: CardProps) {
  const hasImage = Boolean(image);
  const hasIcon  = Boolean(icon) && !hasImage;
  const hasBody  = Boolean(children);

  return (
    <>
      {hasImage && (
        <div className={styles.imageWrap}>
          <img src={image} alt="" className={styles.cardImage} />
        </div>
      )}
      <div className={styles.body}>
        {tag && <span className={styles.tag}>{tag}</span>}
        {hasIcon && (
          <img src={icon} alt="" className={styles.icon} />
        )}
        <div className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {path && <ArrowIcon />}
        </div>
        {hasBody && <div className={styles.description}>{children}</div>}
      </div>
    </>
  );
}

function isExternal(path: string) {
  return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//');
}

export function Card(props: CardProps) {
  const { path } = props;
  const hasImage = Boolean(props.image);

  const className = [
    styles.card,
    hasImage ? styles.imageCard : '',
    path ? styles.linked : '',
  ].filter(Boolean).join(' ');

  if (path) {
    if (isExternal(path)) {
      return (
        <a href={path} className={className} target="_blank" rel="noopener noreferrer">
          <CardInner {...props} />
        </a>
      );
    }
    return (
      <Link to={path} className={className}>
        <CardInner {...props} />
      </Link>
    );
  }

  return (
    <div className={className}>
      <CardInner {...props} />
    </div>
  );
}

export default Card;
