<template>
  <v-app>
    <v-main class="main">
      <VContainer max-width="1200" class="mb-15">
        <NuxtPage />
      </VContainer>
    </v-main>
    <v-footer class="footer" app>
      <div class="footer__content">
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
          Сервис бесплатный и сделан одним человеком. Если помог —
          <a
            :href="DONATE_URL"
            target="_blank"
            rel="noopener noreferrer"
            @click="reachGoal('donate_click')"
          >
            можно закинуть на кофе
          </a>
        </div>
      </div>
    </v-footer>
  </v-app>
  <VitePwaManifest />
</template>

<script lang="ts" setup>
// ссылка на донат (ЮMoney / CloudTips). Пусто — блок в подвале не показывается
const DONATE_URL = "https://pay.cloudtips.ru/p/7e481b45";

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
  margin-top: 4px;
}

.footer__donate a {
  text-decoration: underline;
}

.footer__content a:hover {
  color: rgba(0, 0, 0, 0.8);
  text-decoration: underline;
}

.main::before {
  content: "";
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
