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
      <div class="d-flex flex-column flex-sm-row justify-end">
        <VBtn
          v-if="canShare"
          class="mb-4 mb-sm-0 mr-sm-2"
          color="primary"
          :disabled="!result.items.length"
          @click="shareResult"
          >Отправить в чат</VBtn
        >

        <VBtn
          class="mb-4 mb-sm-0 mr-sm-2"
          color="black"
          :disabled="!result.items.length"
          @click="copyResult"
          >Копировать результат</VBtn
        >

        <VBtn variant="outlined" color="black" @click="model = false"
          >Закрыть</VBtn
        >
      </div>
    </VCard>
  </VDialog>

  <VSnackbar v-model="showCopied" :timeout="2000" color="success" location="top">
    Результат скопирован в буфер обмена
  </VSnackbar>

  <VSnackbar v-model="showCopyError" :timeout="4000" color="error" location="top">
    Не удалось скопировать — выделите текст и скопируйте вручную
  </VSnackbar>
</template>

<script lang="ts" setup>
import { mdiArrowRightThin } from "@mdi/js";
import type { Result } from "~/type/common";

const model = defineModel<boolean>();

const props = defineProps<{ result: Result }>();

const reachGoal = useMetrikaGoal();

const showCopied = ref(false);
const showCopyError = ref(false);

// navigator.share есть не везде: на десктопе обычно нет, на мобильных есть
const canShare = ref(false);

onMounted(() => {
  canShare.value = typeof navigator !== "undefined" && "share" in navigator;
});

const resultText = computed(() => props.result.forCopy.join("\n"));

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(resultText.value);

    showCopied.value = true;
    reachGoal("copy_result");
  } catch {
    // clipboard недоступен: небезопасный контекст, отказ в правах, старый браузер
    showCopyError.value = true;
  }
};

const shareResult = async () => {
  try {
    await navigator.share({ text: resultText.value });

    reachGoal("share_result");
  } catch {
    // пользователь закрыл системное меню — это не ошибка, молчим
  }
};
</script>
