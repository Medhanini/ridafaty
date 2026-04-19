type ArticleEntry = {
  slug: string
  updatedAt: string
  subCategory?: {
    slug: string
    category?: { slug: string }
  }
}

type ApiPage<T> = { data: T[]; total: number }

type SitemapUrl = {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: number
}

export default defineEventHandler(async (event): Promise<SitemapUrl[]> => {
  const config = useRuntimeConfig(event)
  const apiBase = config.apiBaseInternal

  const urls: SitemapUrl[] = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
  ]

  // ── Categories ─────────────────────────────────────────────────────────────
  const catsResult = await $fetch<ApiPage<{ slug: string; updatedAt: string }>>(
    `${apiBase}/categories?limit=100`,
  ).catch(() => null)

  for (const cat of catsResult?.data ?? []) {
    urls.push({ loc: `/${cat.slug}`, changefreq: 'weekly', priority: 0.7, lastmod: cat.updatedAt })
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
        loc: `/${cat}/${sub}/${article.slug}`,
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
