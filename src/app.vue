<template>
  <v-app>
    <v-main class="main">
      <VContainer max-width="1200">
        <NuxtPage />
      </VContainer>
      <div class="text-center pa-2 mt-auto">
        <a
          href="https://t.me/pelkin"
          class="text-primary text-decoration-none"
          target="_blank"
        >
          💬 Есть вопрос? Пишите в Telegram
        </a>
      </div>
    </v-main>
  </v-app>
  <VitePwaManifest />
</template>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e0f7fa, #fce4ec);
}
</style>
