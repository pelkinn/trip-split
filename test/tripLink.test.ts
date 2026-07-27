import { describe, expect, it } from "vitest";
import { buildTripLink, decodeTrip, encodeTrip } from "../src/utils/tripLink";
import type { TripDraft } from "../src/composables/useTripDraft";

const draft = (): TripDraft => ({
  name: "Дача",
  participants: [
    { id: "id-1", name: "Маша" },
    { id: "id-2", name: "Саша" },
    { id: "id-3", name: "Петя" },
  ],
  expenses: [
    {
      id: "e-1",
      title: "Билеты",
      amount: 900,
      paidBy: "id-1",
      sharedWith: ["id-1", "id-2", "id-3"],
      createdAt: "",
    },
    {
      id: "e-2",
      title: "Хот-доги",
      amount: 500,
      paidBy: "id-2",
      sharedWith: ["id-1", "id-2"],
      createdAt: "",
    },
  ],
});

describe("encodeTrip / decodeTrip", () => {
  it("восстанавливает расчёт без потерь", async () => {
    const source = draft();
    const restored = await decodeTrip(await encodeTrip(source));

    expect(restored).not.toBeNull();
    expect(restored!.name).toBe("Дача");
    expect(restored!.participants.map((p) => p.name)).toEqual([
      "Маша",
      "Саша",
      "Петя",
    ]);
    expect(restored!.expenses.map((e) => [e.title, e.amount])).toEqual([
      ["Билеты", 900],
      ["Хот-доги", 500],
    ]);
  });

  it("сохраняет связи участник — расход после смены id", async () => {
    const source = draft();
    const restored = (await decodeTrip(await encodeTrip(source)))!;

    const nameById = new Map(
      restored.participants.map((p) => [p.id, p.name] as const),
    );

    // id генерируются заново, но кто платил и кто делит — те же люди
    expect(nameById.get(restored.expenses[0].paidBy)).toBe("Маша");
    expect(restored.expenses[1].sharedWith.map((id) => nameById.get(id))).toEqual([
      "Маша",
      "Саша",
    ]);
  });

  it("переживает дробные суммы", async () => {
    const source = draft();
    source.expenses[0].amount = 333.33;

    const restored = (await decodeTrip(await encodeTrip(source)))!;

    expect(restored.expenses[0].amount).toBe(333.33);
  });

  it("сжимает: ссылка короче исходного JSON", async () => {
    const encoded = await encodeTrip(draft());

    expect(encoded.length).toBeLessThan(JSON.stringify(draft()).length);
  });

  it("возвращает null на мусоре вместо падения", async () => {
    expect(await decodeTrip("не-ссылка")).toBeNull();
    expect(await decodeTrip("")).toBeNull();
    expect(await decodeTrip("9abc")).toBeNull();
    // валидный base64, но не наш JSON
    expect(await decodeTrip("0eyJhIjoxfQ")).toBeNull();
  });

  it("собирает ссылку с hash, а не с query", async () => {
    const link = await buildTripLink(draft(), "https://trip-split.ru");

    expect(link.startsWith("https://trip-split.ru/#c=")).toBe(true);
    expect(link).not.toContain("?");
  });

  it("остаётся компактной на большой компании", async () => {
    const big: TripDraft = {
      name: "Корпоратив",
      participants: Array.from({ length: 8 }, (_, i) => ({
        id: `id-${i}`,
        name: `Участник ${i}`,
      })),
      expenses: Array.from({ length: 15 }, (_, i) => ({
        id: `e-${i}`,
        title: `Расход номер ${i}`,
        amount: 1234.56,
        paidBy: `id-${i % 8}`,
        sharedWith: Array.from({ length: 8 }, (_, j) => `id-${j}`),
        createdAt: "",
      })),
    };

    const link = await buildTripLink(big, "https://trip-split.ru");

    expect(link.length).toBeLessThan(1000);
    expect((await decodeTrip(await encodeTrip(big)))!.expenses).toHaveLength(15);
  });
});
