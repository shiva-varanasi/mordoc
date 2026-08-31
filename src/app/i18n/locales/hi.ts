import type { UiStrings } from '../types.js';

/** Hindi chrome strings — tier-1 built-in catalog. */
export const hi: UiStrings = {
  search: {
    placeholder: 'खोजें...',
    modalAriaLabel: 'खोजें',
    inputAriaLabel: 'खोजें',
    modalPlaceholder: 'दस्तावेज़ों में खोजें…',
    modalPlaceholderDev: 'डेव मोड में खोज उपलब्ध नहीं है',
    closeAriaLabel: 'खोज बंद करें',
    buildRequiredNotice: 'खोज सक्षम करने के लिए अपनी साइट बिल्ड करें।',
    loading: 'खोज इंडेक्स लोड हो रहा है…',
    noResults: '“{query}” के लिए कोई परिणाम नहीं मिला',
  },

  nav: {
    sideNavigationLabel: 'साइड नेविगेशन',
    topNavigationLabel: 'शीर्ष नेविगेशन',
    openMenu: 'मेनू खोलें',
    closeMenu: 'मेनू बंद करें',
    moreLinksLabel: 'और लिंक',
    selectLanguageLabel: 'भाषा चुनें',
    languageTriggerLabel: 'भाषा: {language}',
  },

  toc: {
    onThisPage: 'इस पेज पर',
  },

  breadcrumb: {
    ariaLabel: 'ब्रेडक्रंब',
    home: 'होम',
  },

  heading: {
    copyLinkLabel: 'इस सेक्शन का लिंक कॉपी करें',
    copiedTooltip: 'कॉपी हो गया',
  },

  codeBlock: {
    copyLabel: 'कोड कॉपी करें',
  },

  diagram: {
    previewAriaLabel: 'डायग्राम पूर्वावलोकन',
    closePreviewLabel: 'डायग्राम पूर्वावलोकन बंद करें',
    zoomOutLabel: 'ज़ूम आउट',
    zoomInLabel: 'ज़ूम इन',
  },

  image: {
    previewFallbackLabel: 'छवि पूर्वावलोकन',
    closePreviewLabel: 'छवि पूर्वावलोकन बंद करें',
  },

  notFound: {
    title: 'पेज नहीं मिला',
    description: '{path} पर कोई पेज मौजूद नहीं है।',
    goHomeButton: 'होम पर जाएं',
  },

  loading: {
    pageAriaLabel: 'पेज लोड हो रहा है',
  },

  article: {
    readTime: '{count} मिनट का पठन',
  },
};
