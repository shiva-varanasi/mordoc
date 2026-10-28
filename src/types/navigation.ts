/** A single item in the side navigation tree. */
export interface SidenavItem {
  /**
   * Display text shown in the sidebar.
   *
   * Required in an authored nav file, with one exception: an item using
   * `operation` may omit it, in which case the spec's `summary` is filled in
   * when the reference is resolved. Supply it anyway when the sidebar wants
   * something shorter than the page title — "Create" under a "Payments"
   * group, against "Create a payment" as the heading.
   */
  label?: string;
  /** Route path for this item. Absent when the item is a group-only heading. */
  path?: string;
  /**
   * An API operation to link to, by `operationId`, as an alternative to
   * spelling out `path`. Resolved to a real route once specs and navigation
   * are both loaded, after which this item carries an ordinary `path` and
   * the rest of the shell treats it like any other entry — this is not a
   * union or a new node kind.
   *
   * Preferred over `path` for operations on three counts: the writer uses
   * the identifier straight from the spec rather than deriving
   * `createPayment` → `create-payment` by hand; moving the API's content
   * folder touches only the registry; and the coverage check compares two
   * sets of identifiers instead of string-matching computed routes against
   * the nav tree.
   *
   * When `label` is omitted, the spec's `summary` is used.
   */
  operation?: string;
  /** Nested child items. Present for both group-only and navigable parents. */
  children?: SidenavItem[];
  /**
   * When true, this group is expanded on initial page load. Has no effect on leaf items.
   * User can still collapse it during the session; state is not persisted across reloads.
   */
  expanded?: boolean;
}

/** Shape of a sidenav YAML file (sidenav.yaml or any topnav-referenced file). */
export type SidenavConfig = SidenavItem[];

/** A single item in the top navigation bar. */
export interface TopnavItem {
  /** Display text shown in the top navigation bar. */
  label: string;
  /** Route path prefix for this section. */
  path: string;
  /** Filename of the sidenav YAML file in config/navigation/ (e.g. "payments.yaml"). */
  sidenav: string;
}

/** Shape of the config/navigation/topnav.yaml file. */
export type TopnavConfig = TopnavItem[];

/**
 * Resolved top navigation: each item paired with its loaded sidenav tree.
 * This is the runtime representation after all referenced files are loaded.
 */
export interface ResolvedTopnavItem {
  label: string;
  path: string;
  sidenav: SidenavConfig;
}

export type ResolvedTopnavConfig = ResolvedTopnavItem[];

/** A single link or button-styled link in the header's right-hand action area. */
export interface HeaderLink {
  /** Display text. */
  label: string;
  /** Internal route path or external absolute URL. */
  path: string;
  /**
   * Visual treatment. 'link' = plain text (default), 'primary' = filled
   * accent button, 'secondary' = outlined accent button.
   */
  variant?: 'link' | 'primary' | 'secondary';
}

/** Shape of the config/navigation/headernav.yaml file. */
export type HeaderLinksConfig = HeaderLink[];

/**
 * One footer line. Plain string, rendered top-to-bottom in a column
 * alongside the rest of its zone (see {@link FooterConfig}). Supports
 * CommonMark-style `[text](url)` links, resolved at render time rather than
 * by the loader — everything outside the brackets renders as plain text,
 * the bracketed part as a link. External URLs (http/https/protocol-relative)
 * open in a new tab; anything else is treated as an internal route.
 * Translated the same way nav labels are: keyed on this literal string in
 * config/navigation/translations/<lang>.yaml, link syntax kept intact by
 * the translator.
 */
export type FooterLine = string;

/**
 * Shape of the config/navigation/footer.yaml file: up to three named
 * columns, each an ordered list of {@link FooterLine}s stacked one per line.
 * `start`/`center`/`end` are writing-direction-relative (not `left`/`right`)
 * so the layout stays correct if the shell ever adds RTL support. All three
 * are optional and independently omittable.
 *
 * Absent from a project entirely (see {@link loadFooterConfig}) is distinct
 * from an explicit empty object / all-empty columns — the former falls back
 * to Mordoc's built-in default footer, the latter renders no footer at all.
 */
export interface FooterConfig {
  start?: FooterLine[];
  center?: FooterLine[];
  end?: FooterLine[];
}
