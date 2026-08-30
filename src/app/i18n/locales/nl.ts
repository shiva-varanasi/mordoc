import type { UiStrings } from '../types.js';

/** Dutch chrome strings — tier-1 built-in catalog. */
export const nl: UiStrings = {
  search: {
    placeholder: 'Zoeken...',
    modalAriaLabel: 'Zoeken',
    inputAriaLabel: 'Zoeken',
    modalPlaceholder: 'Zoek in de documentatie…',
    modalPlaceholderDev: 'Zoeken niet beschikbaar in ontwikkelmodus',
    closeAriaLabel: 'Zoeken sluiten',
    buildRequiredNotice: 'Bouw je site om zoeken in te schakelen.',
    loading: 'Zoekindex wordt geladen…',
    noResults: 'Geen resultaten voor “{query}”',
  },

  nav: {
    sideNavigationLabel: 'Zijnavigatie',
    topNavigationLabel: 'Bovenste navigatie',
    openMenu: 'Menu openen',
    closeMenu: 'Menu sluiten',
    moreLinksLabel: 'Meer links',
    selectLanguageLabel: 'Taal selecteren',
    languageTriggerLabel: 'Taal: {language}',
  },

  toc: {
    onThisPage: 'Op deze pagina',
  },

  breadcrumb: {
    ariaLabel: 'Kruimelpad',
    home: 'Home',
  },

  heading: {
    copyLinkLabel: 'Link naar deze sectie kopiëren',
    copiedTooltip: 'Gekopieerd',
  },

  codeBlock: {
    copyLabel: 'Code kopiëren',
  },

  diagram: {
    previewAriaLabel: 'Diagramvoorbeeld',
    closePreviewLabel: 'Diagramvoorbeeld sluiten',
    zoomOutLabel: 'Uitzoomen',
    zoomInLabel: 'Inzoomen',
  },

  image: {
    previewFallbackLabel: 'Afbeeldingsvoorbeeld',
    closePreviewLabel: 'Afbeeldingsvoorbeeld sluiten',
  },

  notFound: {
    title: 'Pagina niet gevonden',
    description: 'Er bestaat geen pagina op {path}.',
    goHomeButton: 'Naar home',
  },

  loading: {
    pageAriaLabel: 'Pagina wordt geladen',
  },

  article: {
    readTime: '{count} MIN LEESTIJD',
  },
};
