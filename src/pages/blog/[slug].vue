<template>
  <div class="wrapper">
    <NuxtLink class="back-link text-body-2" to="/blog">← Все статьи</NuxtLink>

    <template v-if="article">
      <h1 class="text-h5 mt-4 mb-2">{{ article.title }}</h1>
      <p class="text-caption mb-8">{{ formatDate(article.date) }}</p>

      <article class="article">
        <ContentRenderer :value="article" />
      </article>

      <VCard class="pa-6 mt-10 card" variant="outlined" rounded="xl">
        <p class="text-h6 font-weight-bold mb-2">
          Посчитать, кто кому должен
        </p>
        <p class="text-body-2 mb-4">
          Добавьте участников и траты — калькулятор посчитает долги и соберёт
          результат для отправки в чат. Без регистрации.
        </p>
        <VBtn to="/" color="primary" variant="flat" rounded="pill">
          Открыть калькулятор
        </VBtn>
      </VCard>

      <PartnerBlock class="mt-6" />
    </template>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const slug = route.params.slug as string;

const { data: article } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection("blog").path(`/blog/${slug}`).first(),
);

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Статья не найдена",
    fatal: true,
  });
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const url = `https://trip-split.ru/blog/${slug}`;

useHead({
  title: `${article.value.title} | TripSplit`,
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "description", content: article.value.description },
    { property: "og:title", content: article.value.title },
    { property: "og:description", content: article.value.description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    {
      property: "og:image",
      content: "https://trip-split.ru/pwa-192x192.png",
    },
    { property: "article:published_time", content: article.value.date },
  ],
});
</script>

<style scoped>
.wrapper {
  max-width: 720px;
  margin: 0 auto;
}

/* outlined-карточка прозрачная — задаём белый фон и обычный цвет текста */
.card {
  background: #fff;
  color: rgba(0, 0, 0, 0.87);
}

.back-link {
  color: rgba(0, 0, 0, 0.6);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.article :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 32px 0 12px;
}

.article :deep(h3) {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 24px 0 10px;
}

.article :deep(p) {
  margin-bottom: 16px;
  line-height: 1.7;
}

.article :deep(ul),
.article :deep(ol) {
  margin: 0 0 16px 20px;
}

.article :deep(li) {
  margin-bottom: 8px;
  line-height: 1.7;
}

.article :deep(a) {
  color: #00838f;
}

.article :deep(blockquote) {
  margin: 0 0 16px;
  padding-left: 16px;
  border-left: 3px solid rgba(0, 0, 0, 0.15);
  color: rgba(0, 0, 0, 0.7);
}
</style>
