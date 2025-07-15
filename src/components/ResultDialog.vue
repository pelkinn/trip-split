<template>
  <VDialog v-model="model" max-width="600">
    <VCard class="pa-6">
      <div class="mb-8">
        <p class="text-h6 mb-8 font-weight-bold">РЕЗУЛЬТАТ</p>
        <p v-if="!result.items.length" class="text-center">
          Введите корректные данные
        </p>
        <div v-for="(item, index) in result.items" :key="item.debtorName">
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
        <v-snackbar :timeout="2000" color="success">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              class="mb-4 mb-sm-0 mr-sm-2"
              color="black"
              :disabled="!result.items.length"
              @click="copyResult"
              >Копировать результат</VBtn
            >
          </template>

          Результат скопирован в буфер обмена
        </v-snackbar>

        <VBtn variant="outlined" color="black" @click="model = false"
          >Закрыть</VBtn
        >
      </div>
    </VCard>
  </VDialog>
</template>

<script lang="ts" setup>
import { mdiArrowRightThin } from "@mdi/js";
import type { Result } from "~/type/common";

const model = defineModel<boolean>();

const props = defineProps<{ result: Result }>();

const copyResult = async () => {
  const text = props.result.forCopy.join("\n");

  await navigator.clipboard.writeText(text);
};
</script>
