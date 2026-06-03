/** A single item in the side navigation tree. */
export interface SidenavItem {
  /** Display text shown in the sidebar. */
  label: string;
  /** Route path for this item. Absent when the item is a group-only heading. */
  path?: string;
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
