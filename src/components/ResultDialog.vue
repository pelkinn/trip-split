<template>
  <VDialog v-model="model" max-width="600">
    <VCard class="pa-6">
      <div class="text-h5 mb-6">
        <p class="text-h6 mb-4">Результат</p>
        <div v-for="item in result" :key="item">{{ item }}</div>
      </div>
      <div class="d-flex flex-column flex-sm-row justify-end">
        <v-snackbar :timeout="2000" color="success">
          <template #activator="{ props }">
            <VBtn
              v-bind="props"
              class="mb-4 mb-sm-0 mr-sm-2"
              @click="copyResult"
              >Копировать результат</VBtn
            >
          </template>

          Результат скопирован в буфер обмена
        </v-snackbar>

        <VBtn variant="outlined" @click="model = false">Закрыть</VBtn>
      </div>
    </VCard>
  </VDialog>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>();

const props = defineProps<{ result: string[] }>();

const copyResult = async () => {
  const text = props.result.join("\n");

  await navigator.clipboard.writeText(text);
};
</script>
