import type { UiStrings } from '../types.js';

/** Japanese chrome strings — tier-1 built-in catalog. */
export const ja: UiStrings = {
  search: {
    placeholder: '検索...',
    modalAriaLabel: '検索',
    inputAriaLabel: '検索',
    modalPlaceholder: 'ドキュメントを検索…',
    modalPlaceholderDev: '開発モードでは検索を利用できません',
    closeAriaLabel: '検索を閉じる',
    buildRequiredNotice: 'サイトをビルドすると検索を利用できます。',
    loading: '検索インデックスを読み込み中…',
    noResults: '「{query}」に一致する結果はありません',
  },

  nav: {
    sideNavigationLabel: 'サイドナビゲーション',
    topNavigationLabel: 'トップナビゲーション',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    moreLinksLabel: 'その他のリンク',
    selectLanguageLabel: '言語を選択',
    languageTriggerLabel: '言語: {language}',
  },

  toc: {
    onThisPage: 'このページの内容',
  },

  breadcrumb: {
    ariaLabel: 'パンくずリスト',
    home: 'ホーム',
  },

  heading: {
    copyLinkLabel: 'このセクションへのリンクをコピー',
    copiedTooltip: 'コピーしました',
  },

  codeBlock: {
    copyLabel: 'コードをコピー',
  },

  diagram: {
    previewAriaLabel: '図のプレビュー',
    closePreviewLabel: '図のプレビューを閉じる',
    zoomOutLabel: '縮小',
    zoomInLabel: '拡大',
  },

  image: {
    previewFallbackLabel: '画像のプレビュー',
    closePreviewLabel: '画像のプレビューを閉じる',
  },

  notFound: {
    title: 'ページが見つかりません',
    description: '{path} にはページが存在しません。',
    goHomeButton: 'ホームに戻る',
  },

  loading: {
    pageAriaLabel: 'ページを読み込み中',
  },

  article: {
    readTime: '{count} 分で読了',
  },
};
