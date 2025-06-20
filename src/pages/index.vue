<template>
  <div>
    <div class="d-flex justify-center mb-4 mb-sm-12">
      <img width="200" src="~/assets/img/logo.png" alt="" />
    </div>
    <div class="wrapper">
      <div class="grid">
        <div>
          <p class="text-h6 mb-4">Название поездки</p>
          <VTextField v-model="form.name" label="Название поездки" />
        </div>

        <div>
          <p class="text-h6 mb-4">Участники</p>
          <VTextField
            v-for="(participant, index) in form.participants"
            :key="participant.id"
            :ref="(el) => setFieldRef(el, index)"
            v-model="form.participants[index].name"
            label="Имя участника"
            :append-icon="index ? mdiClose : ''"
            @click:append="removeParticipant(index)"
          />
          <VBtn size="small" color="secondary" @click="addParticipant"
            >Добавить участника</VBtn
          >
        </div>

        <div>
          <p class="text-h6 mb-4">Расходы</p>
          <VCard
            v-for="(expense, i) in form.expenses"
            :key="expense.id"
            class="pa-4 mb-4"
            variant="outlined"
          >
            <VTextField v-model="form.expenses[i].title" label="Описание" />
            <VTextField v-model="form.expenses[i].amount" label="Сумма" />
            <VSelect
              v-model="form.expenses[i].paidBy"
              :items="itemsPaidBy"
              item-title="name"
              item-value="id"
              label="Кто заплатил"
            />
            <VSelect
              v-model="form.expenses[i].sharedWith"
              multiple
              :items="itemsPaidBy"
              item-title="name"
              item-value="id"
              label="Кто делит расход"
            />
            <div class="d-flex justify-end">
              <VBtn
                size="small"
                color="error"
                variant="tonal"
                @click="removeExpense(i)"
                >Удалить</VBtn
              >
            </div>
          </VCard>
          <VBtn size="small" color="secondary" @click="addExpense"
            >Добавить расход</VBtn
          >
        </div>
        <div class="mt-12 d-flex flex-column">
          <VBtn @click="createTrip">Рассчитать</VBtn>
          <VBtn
            v-if="readableDebts.length"
            class="mt-4"
            color="error"
            variant="tonal"
            @click="clear"
            >Очистить результат</VBtn
          >
        </div>
      </div>
    </div>

    <ResultDialog v-model="modelDialog" :result="readableDebts" />
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from "uuid";
import { mdiClose } from "@mdi/js";
import type { Balance, Expense, Participant, Trip } from "~/type/common";
import type { VTextField } from "vuetify/components";

const form = ref<{
  name: string;
  participants: Participant[];
  expenses: Expense[];
}>({
  name: "",
  participants: [],
  expenses: [],
});

const fieldRefs = ref<(InstanceType<typeof VTextField> | null)[]>([]);

const modelDialog = ref(false);

const setFieldRef = (
  el: Element | ComponentPublicInstance | null,
  index: number
) => {
  if (el) {
    fieldRefs.value[index] = el as InstanceType<typeof VTextField> | null;
  }
};

const addParticipant = () => {
  form.value.participants.push({ id: uuidv4(), name: "" });
  nextTick(() => {
    const lastIndex = form.value.participants.length - 1;
    fieldRefs.value[lastIndex]?.focus();
  });
};

const removeParticipant = (i: number) => {
  form.value.participants.splice(i, 1);
};

const readableDebts = ref<string[]>([]);

const createTrip = () => {
  const trip: Trip = {
    id: uuidv4(),
    name: form.value.name,
    participants: form.value.participants,
    expenses: form.value.expenses,
    createdAt: new Date().toISOString(),
  };

  const rawBalance = calculateBalance(trip);
  const simplified = simplifyBalance(rawBalance);
  readableDebts.value = formatBalanceToText(simplified, trip.participants);

  modelDialog.value = true;
};

const addExpense = () => {
  form.value.expenses.push({
    id: uuidv4(),
    title: "",
    amount: null,
    paidBy: form.value.participants[0].id,
    sharedWith: [],
    createdAt: new Date().toISOString(),
  });
};

const removeExpense = (i: number) => {
  form.value.expenses.splice(i, 1);
};

const itemsPaidBy = computed(() => {
  return form.value.participants;
});

const calculateBalance = (trip: Trip): Balance => {
  const balance: Balance = {};

  for (const expense of trip.expenses) {
    const { amount, paidBy, sharedWith } = expense;
    const share = Number(amount) / sharedWith.length;

    for (const userId of sharedWith) {
      if (userId === paidBy) continue;

      // Инициализируем вложенные объекты
      if (!balance[userId]) balance[userId] = {};
      if (!balance[userId][paidBy]) balance[userId][paidBy] = 0;

      balance[userId][paidBy] += share;
    }
  }

  // Округлим до 2 знаков
  for (const debtor in balance) {
    for (const creditor in balance[debtor]) {
      balance[debtor][creditor] =
        Math.round(balance[debtor][creditor] * 100) / 100;
    }
  }

  return balance;
};

const simplifyBalance = (balance: Balance): Balance => {
  const simplified: Balance = {};

  for (const debtorId in balance) {
    for (const creditorId in balance[debtorId]) {
      const amount = balance[debtorId][creditorId];
      if (amount <= 0) continue;

      const reverseAmount = balance[creditorId]?.[debtorId] || 0;
      const net = amount - reverseAmount;

      if (net > 0) {
        if (!simplified[debtorId]) simplified[debtorId] = {};
        simplified[debtorId][creditorId] = Math.round(net * 100) / 100;
      } else if (net < 0) {
        if (!simplified[creditorId]) simplified[creditorId] = {};
        simplified[creditorId][debtorId] = Math.round(-net * 100) / 100;
      }
      // если net === 0 — ничего не сохраняем
    }
  }

  return simplified;
};

const formatBalanceToText = (
  balance: Balance,
  participants: Participant[]
): string[] => {
  const getNameById = (id: string) =>
    participants.find((p) => p.id === id)?.name || id;

  const result: string[] = [];

  for (const debtorId in balance) {
    for (const creditorId in balance[debtorId]) {
      const amount = balance[debtorId][creditorId];
      if (amount <= 0) continue;

      const debtorName = getNameById(debtorId);
      const creditorName = getNameById(creditorId);

      result.push(`${debtorName} → ${creditorName}: ${amount} ₽`);
    }
  }

  return result;
};

const clear = () => {
  form.value.name = "";
  form.value.participants = [];
  form.value.expenses = [];
};
</script>

<style lang="css" scoped>
.wrapper {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;

  @media screen and (min-width: 600px) {
    grid-template-columns: 2fr 1fr;
  }

  @media screen and (min-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: flex-start;
}
</style>
