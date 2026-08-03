<template>
  <v-app>
    <v-main class="main">
      <VContainer max-width="1200" class="mb-15">
        <NuxtPage />
      </VContainer>
    </v-main>
    <v-footer class="footer" app>
      <div class="footer__content">
        <div class="mb-2">
          <NuxtLink to="/blog">Блог</NuxtLink>
        </div>
        <div>
          Разработка —
          <a
            href="https://t.me/pelkin"
            target="_blank"
            rel="noopener noreferrer"
          >
            Александр Перепелкин
          </a>
        </div>
        <div v-if="DONATE_URL" class="footer__donate">
          <div class="mb-2">Сервис бесплатный и сделан одним человеком</div>
          <VBtn
            :href="DONATE_URL"
            :prepend-icon="mdiCoffee"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            variant="tonal"
            size="small"
            rounded="pill"
            @click="reachGoal('donate_click', { place: 'footer' })"
            >Купить кофе автору</VBtn
          >
        </div>
      </div>
    </v-footer>
  </v-app>
  <VitePwaManifest />
</template>

<script lang="ts" setup>
import { mdiCoffee } from "@mdi/js";

const reachGoal = useMetrikaGoal();
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e0f7fa, #fce4ec);
}

.footer {
  background: transparent !important;
  justify-content: center;
  padding: 16px;
  position: absolute !important;
}

.footer__content {
  text-align: center;
}

.footer__content,
.footer__content a {
  color: rgba(0, 0, 0, 0.5);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;
}

.footer__donate {
  margin-top: 12px;
}

/* кнопка доната — не ссылка в тексте, подчёркивание и серый цвет ей не нужны */
.footer__content a.v-btn {
  color: inherit;
  text-decoration: none;
}

.footer__content a:not(.v-btn):hover {
  color: rgba(0, 0, 0, 0.8);
  text-decoration: underline;
}

.main::before {
  content: "";
  /* декоративный слой поверх контента — не должен перехватывать клики по ссылкам */
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/summer.jpg");
  background-repeat: repeat;
  background-size: 800px;
  opacity: 0.05;
}
</style>
