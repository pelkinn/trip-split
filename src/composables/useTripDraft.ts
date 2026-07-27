import type { Ref } from "vue";
import type { Expense, Participant } from "~/type/common";

export interface TripDraft {
  name: string;
  participants: Participant[];
  expenses: Expense[];
}

const STORAGE_KEY = "tripsplit:draft:v1";

const isDraft = (value: unknown): value is TripDraft => {
  if (!value || typeof value !== "object") return false;

  const draft = value as Partial<TripDraft>;

  return (
    typeof draft.name === "string" &&
    Array.isArray(draft.participants) &&
    Array.isArray(draft.expenses)
  );
};

/**
 * Черновик расчёта переживает перезагрузку вкладки: люди вводят
 * участников и траты в несколько заходов, случайно закрывают страницу
 * и возвращаются — терять введённое нельзя.
 */
export const useTripDraft = (form: Ref<TripDraft>) => {
  const restore = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);
      if (isDraft(parsed)) {
        form.value = parsed;
      }
    } catch {
      // повреждённый черновик не должен ломать страницу
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form.value));
    } catch {
      // приватный режим или переполненное хранилище — не мешаем работе
    }
  };

  onMounted(() => {
    restore();

    watch(form, save, { deep: true });
  });
};
