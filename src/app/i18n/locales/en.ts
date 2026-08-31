import type { UiStrings } from '../types.js';

/**
 * English chrome strings — the literal source-of-truth catalog, extracted
 * 1:1 from the hardcoded text currently inline in the shell components.
 * Also the ultimate fallback for any declared language outside the tier-1
 * set (see the other files in this directory).
 *
 * Typed as `UiStrings` so a missing/misspelled key is a compile error rather
 * than a silent runtime gap.
 */
export const en: UiStrings = {
  search: {
    placeholder: 'Search...',
    modalAriaLabel: 'Search',
    inputAriaLabel: 'Search',
    modalPlaceholder: 'Search docs…',
    modalPlaceholderDev: 'Search unavailable in dev mode',
    closeAriaLabel: 'Close search',
    buildRequiredNotice: 'Build your site to enable search.',
    loading: 'Loading search index…',
    noResults: 'No results for “{query}”',
  },

  nav: {
    sideNavigationLabel: 'Side navigation',
    topNavigationLabel: 'Top navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    moreLinksLabel: 'More links',
    selectLanguageLabel: 'Select language',
    languageTriggerLabel: 'Language: {language}',
  },

  toc: {
    onThisPage: 'On this page',
  },

  breadcrumb: {
    ariaLabel: 'Breadcrumb',
    home: 'Home',
  },

  heading: {
    copyLinkLabel: 'Copy link to this section',
    copiedTooltip: 'Copied',
  },

  codeBlock: {
    copyLabel: 'Copy code',
  },

  diagram: {
    previewAriaLabel: 'Diagram preview',
    closePreviewLabel: 'Close diagram preview',
    zoomOutLabel: 'Zoom out',
    zoomInLabel: 'Zoom in',
  },

  image: {
    previewFallbackLabel: 'Image preview',
    closePreviewLabel: 'Close image preview',
  },

  notFound: {
    title: 'Page not found',
    description: 'No page exists at {path}.',
    goHomeButton: 'Go home',
  },

  loading: {
    pageAriaLabel: 'Loading page',
  },

  article: {
    readTime: '{count} MIN READ',
  },
};
