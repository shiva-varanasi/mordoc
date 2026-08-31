import type { UiStrings } from '../types.js';

/** German chrome strings — tier-1 built-in catalog. */
export const de: UiStrings = {
  search: {
    placeholder: 'Suchen...',
    modalAriaLabel: 'Suche',
    inputAriaLabel: 'Suche',
    modalPlaceholder: 'Dokumentation durchsuchen…',
    modalPlaceholderDev: 'Suche im Entwicklungsmodus nicht verfügbar',
    closeAriaLabel: 'Suche schließen',
    buildRequiredNotice: 'Erstelle einen Build deiner Seite, um die Suche zu aktivieren.',
    loading: 'Suchindex wird geladen…',
    noResults: 'Keine Ergebnisse für „{query}“',
  },

  nav: {
    sideNavigationLabel: 'Seitennavigation',
    topNavigationLabel: 'Obere Navigation',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    moreLinksLabel: 'Weitere Links',
    selectLanguageLabel: 'Sprache auswählen',
    languageTriggerLabel: 'Sprache: {language}',
  },

  toc: {
    onThisPage: 'Auf dieser Seite',
  },

  breadcrumb: {
    ariaLabel: 'Brotkrümelnavigation',
    home: 'Start',
  },

  heading: {
    copyLinkLabel: 'Link zu diesem Abschnitt kopieren',
    copiedTooltip: 'Kopiert',
  },

  codeBlock: {
    copyLabel: 'Code kopieren',
  },

  diagram: {
    previewAriaLabel: 'Diagrammvorschau',
    closePreviewLabel: 'Diagrammvorschau schließen',
    zoomOutLabel: 'Verkleinern',
    zoomInLabel: 'Vergrößern',
  },

  image: {
    previewFallbackLabel: 'Bildvorschau',
    closePreviewLabel: 'Bildvorschau schließen',
  },

  notFound: {
    title: 'Seite nicht gefunden',
    description: 'Unter {path} existiert keine Seite.',
    goHomeButton: 'Zur Startseite',
  },

  loading: {
    pageAriaLabel: 'Seite wird geladen',
  },

  article: {
    readTime: '{count} MIN LESEZEIT',
  },
};
