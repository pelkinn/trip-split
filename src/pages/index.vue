<template>
  <div>
    <h1 class="text-center mb-12">TripSplit</h1>
    <div class="wrapper">
      <div class="grid">
        <VCard flat>
          <p class="text-h6 mb-4">Название поездки</p>
          <VTextField v-model="form.name" label="Название поездки" />
        </VCard>

        <VCard flat>
          <p class="text-h6 mb-4">Участники</p>
          <VTextField
            v-for="(participant, index) in form.participants"
            :key="participant.id"
            v-model="form.participants[index].name"
            label="Имя участника"
            :append-icon="index ? mdiClose : ''"
            focused
            @click:append="removeParticipant(index)"
          />
          <VBtn size="small" color="secondary" @click="addParticipant"
            >Добавить участника</VBtn
          >
        </VCard>

        <VCard flat>
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
        </VCard>
        <VBtn class="mt-12" @click="createTrip">Рассчитать</VBtn>
      </div>
      <div>
        <p class="text-h6 mb-4">Результат</p>
        <div v-for="item in readableDebts" :key="item">{{ item }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidv4 } from "uuid";
import { mdiClose } from "@mdi/js";
import type { Balance, Expense, Participant, Trip } from "~/type/common";

const form = ref<{
  name: string;
  participants: Participant[];
  expenses: Expense[];
}>({
  name: "",
  participants: [],
  expenses: [],
});

const addParticipant = () => {
  form.value.participants.push({ id: uuidv4(), name: "" });
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
</script>

<style lang="css" scoped>
.wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  align-items: flex-start;
}
</style>
