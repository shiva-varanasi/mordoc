import React, { useEffect, useRef, useState } from 'react';
import type { TocEntry } from '../../types/content.js';
import styles from './Toc.module.css';

interface TocProps {
  items: TocEntry[];
}

export function Toc({ items }: TocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current?.disconnect();

    const headingIds = items.map((item) => item.id);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      },
    );

    for (const id of headingIds) {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
    history.pushState(null, '', `#${id}`);
  }

  if (items.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.heading}>On this page</p>
      <ul className={styles.list}>
        {items.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <a
              href={`#${entry.id}`}
              data-level={entry.level}
              className={`${styles.link} ${activeId === entry.id ? styles.active : ''}`}
              onClick={(e) => handleClick(e, entry.id)}
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
