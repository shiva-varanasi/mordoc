/**
 * Shape of Mordoc's own chrome/UI strings — every piece of text the shell
 * renders that the user did NOT author (as opposed to sidenav/topnav/header
 * labels, page content, etc., which come from the user's own config and are
 * translated via resolveLabel() in ../lang-utils.ts instead).
 *
 * Each tier-1 language ships a complete `UiStrings` object under
 * ./locales/<lang>.ts; TypeScript enforces completeness — a locale file
 * missing a key is a compile error, not a runtime fallback. There is no
 * user-facing override for these strings (see design discussion); the keys
 * below are purely an internal lookup shape, not a public contract.
 *
 * Placeholders use a simple `{name}` substitution (see ../i18n/format.ts),
 * not full ICU plural rules — the one count-bearing string (`article.readTime`)
 * accepts that simplification for v1.
 */
export interface UiStrings {
  search: {
    /** SearchBar button placeholder. Original: "Search..." */
    placeholder: string;
    /** SearchModal dialog aria-label. Original: "Search" */
    modalAriaLabel: string;
    /** SearchModal input aria-label. Original: "Search" */
    inputAriaLabel: string;
    /** SearchModal input placeholder (production). Original: "Search docs…" */
    modalPlaceholder: string;
    /** SearchModal input placeholder (dev mode, index not built). Original: "Search unavailable in dev mode" */
    modalPlaceholderDev: string;
    /** SearchModal close button aria-label. Original: "Close search" */
    closeAriaLabel: string;
    /** SearchModal dev-mode notice. Original: "Build your site to enable search." */
    buildRequiredNotice: string;
    /** SearchModal status while the Pagefind index loads. Original: "Loading search index…" */
    loading: string;
    /** SearchModal empty-results status. `{query}` is substituted. Original: 'No results for "{query}"' */
    noResults: string;
  };

  nav: {
    /** Sidenav <nav> aria-label. Original: "Side navigation" */
    sideNavigationLabel: string;
    /** Topnav <nav> aria-label. Original: "Top navigation" */
    topNavigationLabel: string;
    /** Header hamburger button aria-label when the sidenav is closed. Original: "Open menu" */
    openMenu: string;
    /** Header hamburger button aria-label when the sidenav is open. Original: "Close menu" */
    closeMenu: string;
    /** HeaderLinks mobile overflow ("...") button aria-label. Original: "More links" */
    moreLinksLabel: string;
    /** LanguagePicker dropdown aria-label. Original: "Select language" */
    selectLanguageLabel: string;
    /** LanguagePicker trigger button aria-label. `{language}` is substituted with the current language's autonym. Original: "Language: {language}" */
    languageTriggerLabel: string;
  };

  toc: {
    /** Table-of-contents <nav> aria-label. Original: "On this page" */
    onThisPage: string;
  };

  breadcrumb: {
    /** Breadcrumb <nav> aria-label. Original: "Breadcrumb" */
    ariaLabel: string;
    /** Synthetic root breadcrumb entry, prepended ahead of user-configured labels. Original: "Home" */
    home: string;
  };

  heading: {
    /** Heading anchor-link icon aria-label. Original: "Copy link to this section" */
    copyLinkLabel: string;
    /** Tooltip shown briefly after copying a heading link. Original: "Copied" */
    copiedTooltip: string;
  };

  codeBlock: {
    /** Copy-code button aria-label. Original: "Copy code" */
    copyLabel: string;
  };

  diagram: {
    /** Lightbox dialog aria-label. Original: "Diagram preview" */
    previewAriaLabel: string;
    /** Lightbox close button aria-label. Original: "Close diagram preview" */
    closePreviewLabel: string;
    /** Zoom-out button aria-label. Original: "Zoom out" */
    zoomOutLabel: string;
    /** Zoom-in button aria-label. Original: "Zoom in" */
    zoomInLabel: string;
  };

  image: {
    /** Lightbox dialog aria-label fallback when the image has no alt text. Original: "Image preview" */
    previewFallbackLabel: string;
    /** Lightbox close button aria-label. Original: "Close image preview" */
    closePreviewLabel: string;
  };

  notFound: {
    /** 404 page heading. Original: "Page not found" */
    title: string;
    /** 404 page body text. `{path}` is substituted. Original: "No page exists at {path}." */
    description: string;
    /** 404 page button label. Original: "Go home" */
    goHomeButton: string;
  };

  loading: {
    /** Skeleton page aria-label shown during SPA navigations. Original: "Loading page" */
    pageAriaLabel: string;
  };

  article: {
    /** Article header meta line. `{count}` is substituted. Original: "{count} MIN READ" */
    readTime: string;
  };
}
