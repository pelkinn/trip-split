<template>
  <VDialog v-model="model" max-width="600">
    <VCard class="pa-6">
      <div class="mb-8">
        <p class="text-h6 mb-8 font-weight-bold">РЕЗУЛЬТАТ</p>
        <p v-if="!result.items.length" class="text-center">
          {{ result.forCopy.at(-1) || "Введите корректные данные" }}
        </p>
        <div v-for="(item, index) in result.items" :key="index">
          <div class="d-flex justify-space-between">
            <p class="d-flex align-center">
              <span>{{ item.debtorName }}</span>
              <VIcon :icon="mdiArrowRightThin" color="primary" class="mx-2" />
              <span>{{ item.creditorName }}</span>
            </p>
            <p>
              <span class="font-weight-bold text-h6">{{ item.amount }}</span> ₽
            </p>
          </div>
          <VDivider v-if="index + 1 !== result.items.length" class="my-2" />
        </div>
      </div>
      <p v-if="link" class="text-body-2 mb-6 text-medium-emphasis">
        Ссылку можно скинуть в чат — остальные откроют тот же расчёт и дополнят
        своими тратами.
      </p>

      <!-- кнопок до четырёх, поэтому переносим, а не сжимаем в одну строку -->
      <div class="d-flex flex-column flex-sm-row flex-sm-wrap justify-end ga-2">
        <VBtn
          v-if="canShare"
          color="primary"
          :disabled="!result.items.length"
          @click="shareResult"
          >Отправить в чат</VBtn
        >

        <VBtn color="black" :disabled="!result.items.length" @click="copyResult"
          >Копировать текст</VBtn
        >

        <VBtn
          v-if="link"
          variant="outlined"
          color="black"
          @click="copyLink"
          >Копировать ссылку</VBtn
        >

        <VBtn variant="text" color="black" @click="model = false"
          >Закрыть</VBtn
        >
      </div>
    </VCard>
  </VDialog>

  <VSnackbar v-model="showCopied" :timeout="2000" color="success" location="top">
    {{ copiedMessage }}
  </VSnackbar>

  <VSnackbar v-model="showCopyError" :timeout="4000" color="error" location="top">
    Не удалось скопировать — выделите текст и скопируйте вручную
  </VSnackbar>
</template>

<script lang="ts" setup>
import { mdiArrowRightThin } from "@mdi/js";
import type { Result } from "~/type/common";

const model = defineModel<boolean>();

const props = defineProps<{ result: Result; link?: string }>();

const reachGoal = useMetrikaGoal();

const showCopied = ref(false);
const copiedMessage = ref("");
const showCopyError = ref(false);

// navigator.share есть не везде: на десктопе обычно нет, на мобильных есть
const canShare = ref(false);

onMounted(() => {
  canShare.value = typeof navigator !== "undefined" && "share" in navigator;
});

const resultText = computed(() => props.result.forCopy.join("\n"));

const copyToClipboard = async (
  text: string,
  goal: "copy_result" | "copy_link",
  message: string,
) => {
  try {
    await navigator.clipboard.writeText(text);

    copiedMessage.value = message;
    showCopied.value = true;
    reachGoal(goal);
  } catch {
    // clipboard недоступен: небезопасный контекст, отказ в правах, старый браузер
    showCopyError.value = true;
  }
};

const copyResult = () =>
  copyToClipboard(
    resultText.value,
    "copy_result",
    "Результат скопирован в буфер обмена",
  );

const copyLink = () =>
  copyToClipboard(
    props.link ?? "",
    "copy_link",
    "Ссылка на расчёт скопирована",
  );

const shareResult = async () => {
  try {
    await navigator.share({ text: resultText.value });

    reachGoal("share_result");
  } catch {
    // пользователь закрыл системное меню — это не ошибка, молчим
  }
};
</script>
