import type { UiStrings } from '../types.js';

/**
 * Arabic chrome strings — tier-1 built-in catalog.
 *
 * Text direction (RTL) is a layout/CSS concern, not a string-catalog one —
 * it isn't handled here. This file only supplies the translated strings.
 */
export const ar: UiStrings = {
  search: {
    placeholder: 'بحث...',
    modalAriaLabel: 'بحث',
    inputAriaLabel: 'بحث',
    modalPlaceholder: 'ابحث في المستندات…',
    modalPlaceholderDev: 'البحث غير متاح في وضع التطوير',
    closeAriaLabel: 'إغلاق البحث',
    buildRequiredNotice: 'قم ببناء موقعك لتفعيل البحث.',
    loading: 'جارٍ تحميل فهرس البحث…',
    noResults: 'لا توجد نتائج لـ «{query}»',
  },

  nav: {
    sideNavigationLabel: 'التنقل الجانبي',
    topNavigationLabel: 'التنقل العلوي',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    moreLinksLabel: 'روابط أخرى',
    selectLanguageLabel: 'اختر اللغة',
    languageTriggerLabel: 'اللغة: {language}',
  },

  toc: {
    onThisPage: 'في هذه الصفحة',
  },

  breadcrumb: {
    ariaLabel: 'مسار التصفح',
    home: 'الرئيسية',
  },

  heading: {
    copyLinkLabel: 'نسخ رابط هذا القسم',
    copiedTooltip: 'تم النسخ',
  },

  codeBlock: {
    copyLabel: 'نسخ الكود',
  },

  diagram: {
    previewAriaLabel: 'معاينة الرسم التخطيطي',
    closePreviewLabel: 'إغلاق معاينة الرسم التخطيطي',
    zoomOutLabel: 'تصغير',
    zoomInLabel: 'تكبير',
  },

  image: {
    previewFallbackLabel: 'معاينة الصورة',
    closePreviewLabel: 'إغلاق معاينة الصورة',
  },

  notFound: {
    title: 'الصفحة غير موجودة',
    description: 'لا توجد صفحة على {path}.',
    goHomeButton: 'العودة إلى الرئيسية',
  },

  loading: {
    pageAriaLabel: 'جارٍ تحميل الصفحة',
  },

  article: {
    readTime: '{count} دقيقة قراءة',
  },
};
