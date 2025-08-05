<template>
  <div>
    <div class="d-flex justify-center img-wrapper">
      <img src="~/assets/img/logo.png" alt="" />
    </div>

    <div class="wrapper">
      <h1>TripSplit - калькулятор совместынх расходов</h1>
      <div class="text-h5 text-center mb-2">
        Никакой путаницы в совместных расходах
      </div>
      <p class="text-body-2 text-center mb-10">
        Добавляйте участников и расходы за пару кликов, мгновенно получайте, кто
        кому сколько должен, и копируйте результат в чат одним нажатием.
      </p>
      <div class="grid">
        <div>
          <VTextField v-model="form.name" label="Название поездки" />
        </div>

        <div>
          <p class="text-h6 mb-4 font-weight-bold">УЧАСТНИКИ</p>
          <VTextField
            v-for="(participant, index) in form.participants"
            :key="participant.id"
            :ref="(el) => setFieldRef(el, index)"
            v-model="form.participants[index].name"
            label="Имя участника"
            class="mb-2"
            :class="index === form.participants.length - 1 ? 'mb-5' : 'mb-2'"
          >
            <template #append
              ><VIcon
                :icon="mdiCloseThick"
                color="primary"
                @click="removeParticipant(index)" /></template
          ></VTextField>
          <VBtn
            :prepend-icon="mdiPlusThick"
            color="secondary"
            @click="addParticipant"
            >Добавить участника</VBtn
          >
        </div>

        <div>
          <p class="text-h6 mb-4 font-weight-bold">РАСХОДЫ</p>
          <VCard
            v-for="(expense, i) in form.expenses"
            :key="expense.id"
            class="pa-8 mb-4"
            variant="outlined"
            rounded="xl"
            color="white"
          >
            <VTextField
              v-model="form.expenses[i].title"
              class="mb-2"
              label="Описание"
            />
            <VTextField
              v-model="form.expenses[i].amount"
              class="mb-2"
              label="Сумма"
              type="number"
            />
            <VSelect
              v-model="form.expenses[i].paidBy"
              :items="itemsPaidBy"
              item-title="name"
              item-value="id"
              label="Кто заплатил"
              class="mb-2"
            />
            <VSelect
              v-model="form.expenses[i].sharedWith"
              multiple
              :items="itemsPaidBy"
              item-title="name"
              item-value="id"
              label="Кто делит расход"
              class="mb-4"
            />
            <div class="d-flex justify-end">
              <VBtn
                color="primary"
                block
                :prepend-icon="mdiCloseThick"
                variant="outlined"
                @click="removeExpense(i)"
                >Удалить</VBtn
              >
            </div>
          </VCard>
          <VBtn
            :prepend-icon="mdiPlusThick"
            color="secondary"
            :disabled="!form.participants.length"
            @click="addExpense"
            >Добавить расход</VBtn
          >
        </div>
        <div class="d-flex flex-column">
          <VBtn
            color="black"
            :disabled="disabledBtnCalculate"
            @click="createTrip"
            >Рассчитать</VBtn
          >
          <VBtn
            v-if="readableDebts?.items.length"
            class="mt-4"
            variant="outlined"
            color="black"
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
import { mdiCloseThick, mdiPlusThick } from "@mdi/js";
import type {
  Balance,
  Expense,
  Participant,
  Result,
  Trip,
} from "~/type/common";
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
  const removedId = form.value.participants[i].id;
  form.value.participants.splice(i, 1);

  form.value.expenses.forEach((expense) => {
    expense.sharedWith = expense.sharedWith.filter((id) => id !== removedId);
    if (expense.paidBy === removedId) {
      expense.paidBy = null;
    }
  });
};

const readableDebts = ref<Result>({
  items: [],
  forCopy: [],
});

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
    sharedWith: form.value.participants.map((item) => item.id),
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
): Result => {
  const getNameById = (id: string) =>
    participants.find((p) => p.id === id)?.name || id;

  const result: Result = {
    items: [],
    forCopy: [],
  };

  result.forCopy.push(form.value.name);
  result.forCopy.push("");

  for (const debtorId in balance) {
    for (const creditorId in balance[debtorId]) {
      const amount = balance[debtorId][creditorId];
      if (amount <= 0) continue;

      const debtorName = getNameById(debtorId);
      const creditorName = getNameById(creditorId);

      result.forCopy.push(`${debtorName} → ${creditorName}:  ${amount} ₽`);

      result.items.push({
        debtorName,
        creditorName,
        amount,
      });
    }
  }

  return result;
};

const clear = () => {
  form.value.name = "";
  form.value.participants = [];
  form.value.expenses = [];
};

const disabledBtnCalculate = computed(() => {
  return !form.value.participants.length && !form.value.expenses.length;
});
</script>

<style lang="scss" scoped>
@use "sass:map";
@use "vuetify/settings" as v;

.wrapper {
  max-width: 640px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 44px;
  align-items: flex-start;
}

.img-wrapper {
  margin-bottom: 40px;

  @media #{map.get(v.$display-breakpoints, 'sm-and-up')} {
    margin-bottom: 60px;
  }

  img {
    max-width: 100px;

    @media #{map.get(v.$display-breakpoints, 'sm-and-up')} {
      max-width: 135px;
    }
  }
}

h1 {
  opacity: 0;
  height: 0;
  width: 0;
}
</style>
