import 'react-i18next';
import type common from './locales/en/common.json';
import type navigation from './locales/en/navigation.json';
import type home from './locales/en/home.json';
import type detail from './locales/en/detail.json';
import type search from './locales/en/search.json';
import type advancedSearch from './locales/en/advancedSearch.json';
import type filters from './locales/en/filters.json';
import type settings from './locales/en/settings.json';
import type about from './locales/en/about.json';
import type footer from './locales/en/footer.json';
import type errors from './locales/en/errors.json';
import type dialogs from './locales/en/dialogs.json';
import type toast from './locales/en/toast.json';
import type forms from './locales/en/forms.json';
import type validation from './locales/en/validation.json';
import type seo from './locales/en/seo.json';
import type a11y from './locales/en/a11y.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      navigation: typeof navigation;
      home: typeof home;
      detail: typeof detail;
      search: typeof search;
      advancedSearch: typeof advancedSearch;
      filters: typeof filters;
      settings: typeof settings;
      about: typeof about;
      footer: typeof footer;
      errors: typeof errors;
      dialogs: typeof dialogs;
      toast: typeof toast;
      forms: typeof forms;
      validation: typeof validation;
      seo: typeof seo;
      a11y: typeof a11y;
    };
  }
}
