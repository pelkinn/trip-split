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
          <VBtn color="black" @click="createTrip">Рассчитать</VBtn>
          <VBtn
            v-if="
              readableDebts?.items.length ||
              (readableDebts?.forCopy && readableDebts.forCopy.length > 2)
            "
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
    <ExampleDialog v-model="modelExampleDialog" />

    <div class="d-flex justify-center">
      <VBtn
        color="black"
        size="small"
        variant="outlined"
        class="mt-4"
        @click="modelExampleDialog = true"
        >Пример расчета</VBtn
      >
    </div>

    <div v-if="canInstallApp" class="d-flex justify-center mt-14 mb-6">
      <VBtn
        color="primary"
        rounded="pill"
        :loading="installingApp"
        class="text-white"
        @click="installApp"
        >Установить приложение</VBtn
      >
    </div>

    <!-- Snackbar для уведомлений об ошибках -->
    <VSnackbar
      v-model="showErrorSnackbar"
      color="error"
      timeout="5000"
      location="top"
    >
      {{ errorMessage }}

      <template #actions>
        <VBtn
          color="white"
          variant="text"
          size="small"
          @click="showErrorSnackbar = false"
        >
          Закрыть
        </VBtn>
      </template>
    </VSnackbar>
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

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const deferredInstallPrompt = ref<BeforeInstallPromptEvent | null>(null);
const installingApp = ref(false);
const canInstallApp = computed(() => Boolean(deferredInstallPrompt.value));

const onBeforeInstallPrompt = (event: Event) => {
  const installEvent = event as BeforeInstallPromptEvent;
  installEvent.preventDefault();
  deferredInstallPrompt.value = installEvent;
};

const onAppInstalled = () => {
  deferredInstallPrompt.value = null;
};

onMounted(() => {
  window.addEventListener(
    "beforeinstallprompt",
    onBeforeInstallPrompt as EventListener,
  );
  window.addEventListener("appinstalled", onAppInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener(
    "beforeinstallprompt",
    onBeforeInstallPrompt as EventListener,
  );
  window.removeEventListener("appinstalled", onAppInstalled);
});

async function installApp() {
  const prompt = deferredInstallPrompt.value;
  if (!prompt) return;
  installingApp.value = true;
  try {
    await prompt.prompt();
    await prompt.userChoice;
  } finally {
    installingApp.value = false;
    deferredInstallPrompt.value = null;
  }
}

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
const modelExampleDialog = ref(false);
// Переменные для уведомлений об ошибках
const showErrorSnackbar = ref(false);
const errorMessage = ref("");

const setFieldRef = (
  el: Element | ComponentPublicInstance | null,
  index: number,
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
      expense.paidBy = "";
    }
  });
};

const readableDebts = ref<Result>({
  items: [],
  forCopy: [],
});

// Функция валидации формы
const validateForm = (): { isValid: boolean; message: string } => {
  // Проверяем, что есть хотя бы один участник
  if (!form.value.participants.length) {
    return {
      isValid: false,
      message: "Добавьте хотя бы одного участника",
    };
  }

  // Проверяем, что все участники имеют имена
  const emptyParticipantIndex = form.value.participants.findIndex(
    (participant) => !participant.name.trim(),
  );
  if (emptyParticipantIndex !== -1) {
    return {
      isValid: false,
      message: `Заполните имя участника №${emptyParticipantIndex + 1}`,
    };
  }

  // Проверяем, что есть хотя бы один расход
  if (!form.value.expenses.length) {
    return {
      isValid: false,
      message: "Добавьте хотя бы один расход",
    };
  }

  // Проверяем, что все расходы заполнены корректно
  for (let i = 0; i < form.value.expenses.length; i++) {
    const expense = form.value.expenses[i];

    // Проверяем сумму
    if (!expense.amount || expense.amount <= 0) {
      return {
        isValid: false,
        message: `Введите сумму больше 0 для расхода №${i + 1}`,
      };
    }

    // Проверяем, кто заплатил
    if (!expense.paidBy) {
      return {
        isValid: false,
        message: `Выберите, кто заплатил за расход №${i + 1}`,
      };
    }

    // Проверяем, что есть хотя бы один участник для разделения расхода
    if (!expense.sharedWith || expense.sharedWith.length === 0) {
      return {
        isValid: false,
        message: `Выберите участников для разделения расхода №${i + 1}`,
      };
    }
  }

  return { isValid: true, message: "" };
};

const createTrip = () => {
  // Валидируем форму
  const validation = validateForm();

  if (!validation.isValid) {
    errorMessage.value = validation.message;
    showErrorSnackbar.value = true;
    return;
  }

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
  participants: Participant[],
): Result => {
  const getNameById = (id: string) =>
    participants.find((p) => p.id === id)?.name || id;

  const result: Result = {
    items: [],
    forCopy: [],
  };

  // Проверяем количество участников
  if (participants.length === 1) {
    result.forCopy.push("Никаких долгов нет - все расходы свои!");
    return result;
  }

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
