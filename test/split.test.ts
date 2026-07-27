import { describe, expect, it } from "vitest";
import {
  calculateNetBalances,
  calculateTrip,
  settleDebts,
  toCents,
} from "../src/utils/split";
import type { Expense, Trip } from "../src/type/common";

const participant = (id: string) => ({ id, name: id });

const expense = (
  amount: number,
  paidBy: string,
  sharedWith: string[],
): Expense => ({
  id: `${paidBy}-${amount}`,
  title: "",
  amount,
  paidBy,
  sharedWith,
  createdAt: "",
});

const trip = (participantIds: string[], expenses: Expense[]): Trip => ({
  id: "trip",
  name: "",
  participants: participantIds.map(participant),
  expenses,
  createdAt: "",
});

describe("calculateNetBalances", () => {
  it("считает баланс: заплатил минус своя доля", () => {
    const balances = calculateNetBalances(
      trip(["Маша", "Саша"], [expense(100, "Маша", ["Маша", "Саша"])]),
    );

    expect(balances).toEqual({ Маша: toCents(50), Саша: toCents(-50) });
  });

  it("не теряет копейки при неделимой сумме", () => {
    const balances = calculateNetBalances(
      trip(
        ["Маша", "Саша", "Петя"],
        [expense(1000, "Маша", ["Маша", "Саша", "Петя"])],
      ),
    );

    // сумма всех балансов всегда ноль — деньги не испаряются
    expect(Object.values(balances).reduce((sum, v) => sum + v, 0)).toBe(0);
    // лишняя копейка достаётся первому в списке делящих — это Маша,
    // поэтому её доля 333.34, а вернуть ей должны 666.66
    expect(balances["Маша"]).toBe(toCents(666.66));
  });

  it("учитывает расход, который делят не все", () => {
    const balances = calculateNetBalances(
      trip(
        ["Маша", "Саша", "Петя"],
        [expense(500, "Саша", ["Маша", "Саша"])],
      ),
    );

    expect(balances["Петя"]).toBe(0);
    expect(balances["Саша"]).toBe(toCents(250));
    expect(balances["Маша"]).toBe(toCents(-250));
  });

  it("игнорирует расходы без суммы и без участников", () => {
    const balances = calculateNetBalances(
      trip(
        ["Маша", "Саша"],
        [expense(0, "Маша", ["Маша", "Саша"]), expense(100, "Маша", [])],
      ),
    );

    expect(balances).toEqual({ Маша: 0, Саша: 0 });
  });
});

describe("settleDebts", () => {
  it("гасит долг одним переводом", () => {
    const transfers = settleDebts({ Маша: toCents(50), Саша: toCents(-50) });

    expect(transfers).toEqual([
      { from: "Саша", to: "Маша", amount: toCents(50) },
    ]);
  });

  it("не гоняет деньги транзитом через третьего", () => {
    // старый алгоритм на этих данных выдавал 3 перевода,
    // причём Петя платил больше своего долга и добирал разницу с Саши
    const balances = calculateNetBalances(
      trip(
        ["Маша", "Саша", "Петя"],
        [
          expense(1000, "Маша", ["Маша", "Саша", "Петя"]),
          expense(500, "Саша", ["Маша", "Саша"]),
          expense(300, "Петя", ["Маша", "Саша", "Петя"]),
        ],
      ),
    );

    const transfers = settleDebts(balances);

    expect(transfers).toHaveLength(2);
    expect(transfers.every((t) => t.to === "Маша")).toBe(true);

    // каждый отдаёт ровно свой долг, ни рублём больше
    for (const transfer of transfers) {
      expect(transfer.amount).toBe(-balances[transfer.from]);
    }
  });

  it("переводов не больше, чем участников минус один", () => {
    const balances = calculateNetBalances(
      trip(
        ["a", "b", "c", "d", "e", "f"],
        [
          expense(600, "a", ["a", "b", "c", "d", "e", "f"]),
          expense(300, "b", ["b", "c"]),
          expense(150, "c", ["a", "c"]),
          expense(90, "d", ["d", "e", "f"]),
          expense(1200, "e", ["a", "b", "c", "d", "e", "f"]),
        ],
      ),
    );

    const transfers = settleDebts(balances);

    expect(transfers.length).toBeLessThanOrEqual(5);
    // балансы полностью погашены
    const settled = { ...balances };
    for (const transfer of transfers) {
      settled[transfer.from] += transfer.amount;
      settled[transfer.to] -= transfer.amount;
    }
    expect(Object.values(settled).every((value) => value === 0)).toBe(true);
  });

  it("возвращает пустой список, когда все в расчёте", () => {
    expect(settleDebts({ Маша: 0, Саша: 0 })).toEqual([]);
  });
});

describe("calculateTrip", () => {
  it("форматирует суммы: целые без копеек, дробные с двумя знаками", () => {
    const result = calculateTrip(
      trip(
        ["Маша", "Саша", "Петя"],
        [expense(1000, "Маша", ["Маша", "Саша", "Петя"])],
      ),
    );

    expect(result.items).toHaveLength(2);
    expect(result.items.map((item) => item.amount)).toEqual([
      "333.33",
      "333.33",
    ]);
  });

  it("ставит название поездки первой строкой для копирования", () => {
    const source = trip(
      ["Маша", "Саша"],
      [expense(100, "Маша", ["Маша", "Саша"])],
    );
    source.name = "Дача";

    expect(calculateTrip(source).forCopy).toEqual([
      "Дача",
      "Саша → Маша: 50 ₽",
    ]);
  });

  it("совпадает с примером расчёта из ExampleDialog.vue", () => {
    const result = calculateTrip(
      trip(
        ["Маша", "Саша", "Петя"],
        [
          expense(900, "Маша", ["Маша", "Саша", "Петя"]), // билеты
          expense(500, "Саша", ["Маша", "Саша"]), // хот-доги
          expense(300, "Петя", ["Маша", "Саша", "Петя"]), // газировка
        ],
      ),
    );

    expect(result.items).toEqual([
      { debtorName: "Саша", creditorName: "Маша", amount: "150" },
      { debtorName: "Петя", creditorName: "Маша", amount: "100" },
    ]);
  });

  it("сообщает, когда никто никому не должен", () => {
    const result = calculateTrip(
      trip(["Маша", "Саша"], [expense(100, "Маша", ["Маша"])]),
    );

    expect(result.items).toEqual([]);
    expect(result.forCopy).toEqual(["Никто никому ничего не должен"]);
  });
});
