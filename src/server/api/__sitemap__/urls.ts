// queryCollection на сервере и defineSitemapEventHandler приходят автоимпортом:
// @nuxt/content и @nuxtjs/sitemap регистрируют их в nitro
export default defineSitemapEventHandler(async (event) => {
  const articles = await queryCollection(event, "blog").all();

  return articles.map((article) => ({
    loc: article.path,
    lastmod: article.date,
    changefreq: "monthly" as const,
    priority: 0.7,
  }));
});
