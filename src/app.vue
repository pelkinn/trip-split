<template>
  <v-app>
    <v-main class="main">
      <VContainer max-width="1200">
        <NuxtPage />
      </VContainer>
    </v-main>
  </v-app>
  <VitePwaManifest />
</template>

<style scoped>
.main {
  background: linear-gradient(135deg, #e0f7fa, #fce4ec);
}
</style>
