import type { Lang } from '~/types'

// ── Translations ──────────────────────────────────────────────────────────────

export interface Translations {
  // Nav
  home: string
  about: string
  contact: string
  login: string
  // Sections
  highlights: string
  latestArticles: string
  readMore: string
  viewAll: string
  noArticles: string
  loading: string
  // Footer
  followUs: string
  quickLinks: string
  categories: string
  rights: string
  // Lang switcher
  language: string
  // Article / category pages
  subcategories: string
  allArticles: string
  publishedOn: string
  by: string
  tags: string
  relatedArticles: string
  notFound: string
  backToHome: string
  prev: string
  next: string
  page: string
  of: string
}

const TRANSLATIONS: Record<Lang, Translations> = {
  fr: {
    home:            'Accueil',
    about:           'À propos',
    contact:         'Contact',
    login:           'Connexion',
    highlights:      'À la une',
    latestArticles:  'Derniers articles',
    readMore:        'Lire la suite',
    viewAll:         'Voir tout',
    noArticles:      'Aucun article disponible.',
    loading:         'Chargement…',
    followUs:        'Suivez-nous',
    quickLinks:      'Liens rapides',
    categories:      'Catégories',
    rights:          'Tous droits réservés',
    language:        'Langue',
    subcategories:   'Sous-catégories',
    allArticles:     'Tous les articles',
    publishedOn:     'Publié le',
    by:              'Par',
    tags:            'Tags',
    relatedArticles: 'Articles similaires',
    notFound:        'Page introuvable.',
    backToHome:      'Retour à l\'accueil',
    prev:            'Précédent',
    next:            'Suivant',
    page:            'Page',
    of:              'sur',
  },
  en: {
    home:            'Home',
    about:           'About',
    contact:         'Contact',
    login:           'Login',
    highlights:      'Highlights',
    latestArticles:  'Latest articles',
    readMore:        'Read more',
    viewAll:         'View all',
    noArticles:      'No articles available.',
    loading:         'Loading…',
    followUs:        'Follow us',
    quickLinks:      'Quick links',
    categories:      'Categories',
    rights:          'All rights reserved',
    language:        'Language',
    subcategories:   'Subcategories',
    allArticles:     'All articles',
    publishedOn:     'Published on',
    by:              'By',
    tags:            'Tags',
    relatedArticles: 'Related articles',
    notFound:        'Page not found.',
    backToHome:      'Back to home',
    prev:            'Previous',
    next:            'Next',
    page:            'Page',
    of:              'of',
  },
  ar: {
    home:            'الرئيسية',
    about:           'من نحن',
    contact:         'اتصل بنا',
    login:           'تسجيل الدخول',
    highlights:      'أبرز الأخبار',
    latestArticles:  'أحدث المقالات',
    readMore:        'اقرأ المزيد',
    viewAll:         'عرض الكل',
    noArticles:      'لا توجد مقالات متاحة.',
    loading:         'جارٍ التحميل…',
    followUs:        'تابعونا',
    quickLinks:      'روابط سريعة',
    categories:      'الفئات',
    rights:          'جميع الحقوق محفوظة',
    language:        'اللغة',
    subcategories:   'الفئات الفرعية',
    allArticles:     'جميع المقالات',
    publishedOn:     'نُشر في',
    by:              'بقلم',
    tags:            'الوسوم',
    relatedArticles: 'مقالات ذات صلة',
    notFound:        'الصفحة غير موجودة.',
    backToHome:      'العودة إلى الرئيسية',
    prev:            'السابق',
    next:            'التالي',
    page:            'صفحة',
    of:              'من',
  },
}

export const LANG_OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: 'fr', label: 'FR', native: 'Français' },
  { code: 'en', label: 'EN', native: 'English'  },
  { code: 'ar', label: 'AR', native: 'العربية'  },
]

// ── Composable ────────────────────────────────────────────────────────────────

export function useLang() {
  const lang = useCookie<Lang>('ridafaty_lang', {
    default: () => 'fr' as Lang,
    maxAge: 60 * 60 * 24 * 365,
  })

  const isRTL  = computed(() => lang.value === 'ar')
  const dir    = computed(() => (isRTL.value ? 'rtl' : 'ltr') as 'rtl' | 'ltr')
  const t      = computed<Translations>(() => TRANSLATIONS[lang.value])
  const label  = computed(() => LANG_OPTIONS.find((o) => o.code === lang.value)?.label ?? 'FR')

  function setLang(l: Lang) {
    lang.value = l
  }

  function formatDate(dateStr: string): string {
    const localeMap: Record<Lang, string> = { fr: 'fr-FR', en: 'en-US', ar: 'ar-SA' }
    try {
      return new Date(dateStr).toLocaleDateString(localeMap[lang.value], {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return { lang, isRTL, dir, t, label, langOptions: LANG_OPTIONS, setLang, formatDate }
}
