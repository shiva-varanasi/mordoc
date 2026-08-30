import type { UiStrings } from '../types.js';

/** Italian chrome strings — tier-1 built-in catalog. */
export const it: UiStrings = {
  search: {
    placeholder: 'Cerca...',
    modalAriaLabel: 'Cerca',
    inputAriaLabel: 'Cerca',
    modalPlaceholder: 'Cerca nella documentazione…',
    modalPlaceholderDev: 'Ricerca non disponibile in modalità sviluppo',
    closeAriaLabel: 'Chiudi ricerca',
    buildRequiredNotice: 'Compila il tuo sito per abilitare la ricerca.',
    loading: 'Caricamento indice di ricerca…',
    noResults: 'Nessun risultato per «{query}»',
  },

  nav: {
    sideNavigationLabel: 'Navigazione laterale',
    topNavigationLabel: 'Navigazione superiore',
    openMenu: 'Apri menu',
    closeMenu: 'Chiudi menu',
    moreLinksLabel: 'Altri link',
    selectLanguageLabel: 'Seleziona lingua',
    languageTriggerLabel: 'Lingua: {language}',
  },

  toc: {
    onThisPage: 'In questa pagina',
  },

  breadcrumb: {
    ariaLabel: 'Percorso di navigazione',
    home: 'Home',
  },

  heading: {
    copyLinkLabel: 'Copia il link a questa sezione',
    copiedTooltip: 'Copiato',
  },

  codeBlock: {
    copyLabel: 'Copia codice',
  },

  diagram: {
    previewAriaLabel: 'Anteprima del diagramma',
    closePreviewLabel: 'Chiudi anteprima del diagramma',
    zoomOutLabel: 'Riduci zoom',
    zoomInLabel: 'Aumenta zoom',
  },

  image: {
    previewFallbackLabel: 'Anteprima immagine',
    closePreviewLabel: 'Chiudi anteprima immagine',
  },

  notFound: {
    title: 'Pagina non trovata',
    description: 'Non esiste alcuna pagina all’indirizzo {path}.',
    goHomeButton: 'Torna alla home',
  },

  loading: {
    pageAriaLabel: 'Caricamento della pagina',
  },

  article: {
    readTime: '{count} MIN DI LETTURA',
  },
};
