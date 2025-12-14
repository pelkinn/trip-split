<template>
  <v-app>
    <v-main class="main">
      <VContainer max-width="1200" class="mb-15">
        <NuxtPage />
      </VContainer>
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

.main::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/pattern.webp");
  background-repeat: repeat;
  background-size: 300px;
  opacity: 0.09;
}
</style>
