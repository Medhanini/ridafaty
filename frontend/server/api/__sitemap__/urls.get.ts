type ArticleEntry = {
  slug: string
  lang: string
  updatedAt: string
  subCategory?: {
    slug: string
    category?: { slug: string }
  }
}

type CategoryEntry = {
  slug: string
  lang: string
  updatedAt: string
}

type ApiPage<T> = { data: T[]; total: number }

type SitemapUrl = {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

const LANGS = ['fr', 'en', 'ar']

export default defineEventHandler(async (event): Promise<SitemapUrl[]> => {
  const config = useRuntimeConfig(event)
  const apiBase = config.apiBaseInternal

  // One home URL per language
  const urls: SitemapUrl[] = LANGS.map((l) => ({
    loc: `/${l}/`,
    changefreq: 'daily',
    priority: 1.0,
  }))

  // ── Categories (fetch per language so slugs are correct) ───────────────────
  for (const l of LANGS) {
    const result = await $fetch<ApiPage<CategoryEntry>>(
      `${apiBase}/categories?limit=100&lang=${l}`,
    ).catch(() => null)

    for (const cat of result?.data ?? []) {
      urls.push({ loc: `/${l}/${cat.slug}`, changefreq: 'weekly', priority: 0.7, lastmod: cat.updatedAt })
    }
  }

  // ── Articles (all pages, all languages) ────────────────────────────────────
  const limit = 100
  let page = 1

  while (true) {
    const result = await $fetch<ApiPage<ArticleEntry>>(
      `${apiBase}/articles?page=${page}&limit=${limit}`,
    ).catch(() => null)

    if (!result?.data?.length) break

    for (const article of result.data) {
      const cat = article.subCategory?.category?.slug
      const sub = article.subCategory?.slug
      if (!cat || !sub) continue

      urls.push({
        loc: `/${article.lang}/${cat}/${sub}/${article.slug}`,
        lastmod: article.updatedAt,
        changefreq: 'weekly',
        priority: 0.8,
      })
    }

    if (result.data.length < limit) break
    page++
  }

  return urls
})
