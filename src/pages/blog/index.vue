<template>
  <div class="wrapper">
    <h1 class="text-h5 mb-2">Блог TripSplit</h1>
    <p class="text-body-2 mb-8">
      Как делить расходы в поездках, на даче и в компании друзей — без ссор и
      калькулятора в столбик.
    </p>

    <VCard
      v-for="article in articles"
      :key="article.path"
      class="pa-6 mb-4 card"
      variant="outlined"
      rounded="xl"
    >
      <NuxtLink class="article-link" :to="article.path">
        <h2 class="text-h6 font-weight-bold mb-1">{{ article.title }}</h2>
      </NuxtLink>
      <p class="text-caption mb-3">{{ formatDate(article.date) }}</p>
      <p class="text-body-2">{{ article.description }}</p>
    </VCard>

    <p v-if="!articles?.length" class="text-body-2">
      Статьи скоро появятся.
    </p>

    <div class="mt-10">
      <VBtn to="/" color="primary" variant="tonal" rounded="pill">
        Открыть калькулятор
      </VBtn>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { data: articles } = await useAsyncData("blog-list", () =>
  queryCollection("blog").order("date", "DESC").all(),
);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const title = "Блог о совместных расходах | TripSplit";
const description =
  "Статьи о том, как делить расходы в поездке и компании: способы расчёта, договорённости, типичные ошибки.";
const url = "https://trip-split.ru/blog";

useHead({
  title,
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
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

.article-link {
  color: inherit;
  text-decoration: none;
}

.article-link:hover h2 {
  text-decoration: underline;
}
</style>
