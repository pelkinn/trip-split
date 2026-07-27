import type { Participant, Result, Trip } from "~/type/common";

/**
 * Все расчёты идут в копейках (целых числах), чтобы не терять деньги
 * на округлении: 1000 / 3 в рублях даёт 333.33 * 3 = 999.99.
 */
const CENTS_IN_RUBLE = 100;

export const toCents = (amount: number | string | null): number =>
  Math.round(Number(amount ?? 0) * CENTS_IN_RUBLE);

export const toRubles = (cents: number): number => cents / CENTS_IN_RUBLE;

/**
 * Итоговый баланс каждого участника в копейках:
 * больше нуля — ему должны, меньше нуля — должен он.
 *
 * Неделимый остаток раздаётся по одной копейке первым участникам,
 * поэтому сумма долей всегда равна сумме расхода.
 */
export const calculateNetBalances = (trip: Trip): Record<string, number> => {
  const balances: Record<string, number> = {};

  for (const participant of trip.participants) {
    balances[participant.id] = 0;
  }

  for (const expense of trip.expenses) {
    const total = toCents(expense.amount);
    const sharedWith = expense.sharedWith.filter((id) => id in balances);

    if (!total || !sharedWith.length) continue;

    const share = Math.floor(total / sharedWith.length);
    const remainder = total - share * sharedWith.length;

    sharedWith.forEach((id, index) => {
      balances[id] -= share + (index < remainder ? 1 : 0);
    });

    if (expense.paidBy in balances) {
      balances[expense.paidBy] += total;
    }
  }

  return balances;
};

/**
 * Минимальный набор переводов, гасящий все долги.
 *
 * Жадно сводим самого крупного должника с самым крупным кредитором:
 * на каждом шаге хотя бы один из них закрывается полностью, поэтому
 * переводов получается не больше, чем участников с ненулевым балансом,
 * минус один. Никто не платит транзитом через третьего.
 */
export const settleDebts = (
  balances: Record<string, number>,
): { from: string; to: string; amount: number }[] => {
  // сортировка по сумме, при равенстве по id — чтобы результат не «прыгал»
  const byAmountThenId = (
    a: [string, number],
    b: [string, number],
    sign: number,
  ) => (b[1] - a[1]) * sign || a[0].localeCompare(b[0]);

  const debtors = Object.entries(balances)
    .filter(([, value]) => value < 0)
    .sort((a, b) => byAmountThenId(a, b, -1));

  const creditors = Object.entries(balances)
    .filter(([, value]) => value > 0)
    .sort((a, b) => byAmountThenId(a, b, 1));

  const transfers: { from: string; to: string; amount: number }[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const [debtorId, debt] = debtors[debtorIndex];
    const [creditorId, credit] = creditors[creditorIndex];

    const amount = Math.min(-debt, credit);

    if (amount > 0) {
      transfers.push({ from: debtorId, to: creditorId, amount });
    }

    debtors[debtorIndex] = [debtorId, debt + amount];
    creditors[creditorIndex] = [creditorId, credit - amount];

    if (debtors[debtorIndex][1] === 0) debtorIndex++;
    if (creditors[creditorIndex][1] === 0) creditorIndex++;
  }

  return transfers;
};

export const formatMoney = (cents: number): string => {
  const rubles = toRubles(cents);

  return Number.isInteger(rubles) ? String(rubles) : rubles.toFixed(2);
};

export const formatTransfers = (
  transfers: { from: string; to: string; amount: number }[],
  participants: Participant[],
  tripName = "",
): Result => {
  const getNameById = (id: string) =>
    participants.find((participant) => participant.id === id)?.name || id;

  const result: Result = { items: [], forCopy: [] };

  if (tripName.trim()) {
    result.forCopy.push(tripName.trim());
  }

  for (const transfer of transfers) {
    const debtorName = getNameById(transfer.from);
    const creditorName = getNameById(transfer.to);
    const amount = formatMoney(transfer.amount);

    result.items.push({ debtorName, creditorName, amount });
    result.forCopy.push(`${debtorName} → ${creditorName}: ${amount} ₽`);
  }

  if (!transfers.length) {
    result.forCopy.push("Никто никому ничего не должен");
  }

  return result;
};

export const calculateTrip = (trip: Trip): Result =>
  formatTransfers(
    settleDebts(calculateNetBalances(trip)),
    trip.participants,
    trip.name,
  );
