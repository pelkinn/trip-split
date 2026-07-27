import { v4 as uuidv4 } from "uuid";
import { toCents, toRubles } from "~/utils/split";
import type { TripDraft } from "~/composables/useTripDraft";

/**
 * Расчёт целиком помещается в ссылку — бэкенда у проекта нет.
 *
 * Формат: [название, [имена], [[описание, сумма в копейках, индекс
 * плательщика, индексы делящих]]]. Участники хранятся индексами, а не
 * uuid: так ссылка короче в разы.
 *
 * Данные кладутся в hash (#c=...), а он не уходит на сервер — имена и
 * суммы не попадают в логи nginx и в статистику.
 */
type CompactExpense = [string, number, number, number[]];
type CompactTrip = [string, string[], CompactExpense[]];

const VERSION_PLAIN = "0"; // base64url(utf8)
const VERSION_DEFLATE = "1"; // base64url(deflate-raw(utf8))

export const LINK_HASH_KEY = "c";

/** Дальше ссылка становится неудобной для чата, предупреждаем пользователя */
export const MAX_LINK_LENGTH = 4000;

const canCompress = () =>
  typeof CompressionStream !== "undefined" &&
  typeof DecompressionStream !== "undefined";

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64UrlToBytes = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return bytes;
};

const pipeThrough = async (
  bytes: Uint8Array,
  transform: CompressionStream | DecompressionStream,
): Promise<Uint8Array> => {
  const stream = new Blob([bytes]).stream().pipeThrough(transform);

  return new Uint8Array(await new Response(stream).arrayBuffer());
};

export const encodeTrip = async (draft: TripDraft): Promise<string> => {
  const ids = draft.participants.map((participant) => participant.id);

  const compact: CompactTrip = [
    draft.name,
    draft.participants.map((participant) => participant.name),
    draft.expenses.map((expense) => [
      expense.title,
      toCents(expense.amount),
      ids.indexOf(expense.paidBy),
      expense.sharedWith
        .map((id) => ids.indexOf(id))
        .filter((index) => index >= 0),
    ]),
  ];

  const bytes = new TextEncoder().encode(JSON.stringify(compact));

  if (!canCompress()) {
    return VERSION_PLAIN + bytesToBase64Url(bytes);
  }

  const deflated = await pipeThrough(
    bytes,
    new CompressionStream("deflate-raw"),
  );

  return VERSION_DEFLATE + bytesToBase64Url(deflated);
};

const isCompactTrip = (value: unknown): value is CompactTrip =>
  Array.isArray(value) &&
  value.length === 3 &&
  typeof value[0] === "string" &&
  Array.isArray(value[1]) &&
  value[1].every((name) => typeof name === "string") &&
  Array.isArray(value[2]) &&
  value[2].every(
    (expense: unknown) =>
      Array.isArray(expense) &&
      expense.length === 4 &&
      typeof expense[0] === "string" &&
      typeof expense[1] === "number" &&
      typeof expense[2] === "number" &&
      Array.isArray(expense[3]) &&
      expense[3].every((index: unknown) => typeof index === "number"),
  );

export const decodeTrip = async (value: string): Promise<TripDraft | null> => {
  try {
    const version = value.slice(0, 1);
    const payload = base64UrlToBytes(value.slice(1));

    if (version !== VERSION_PLAIN && version !== VERSION_DEFLATE) return null;
    if (version === VERSION_DEFLATE && !canCompress()) return null;

    const bytes =
      version === VERSION_DEFLATE
        ? await pipeThrough(payload, new DecompressionStream("deflate-raw"))
        : payload;

    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (!isCompactTrip(parsed)) return null;

    const [name, names, expenses] = parsed;

    const participants = names.map((participantName) => ({
      id: uuidv4(),
      name: participantName,
    }));

    const idByIndex = (index: number) => participants[index]?.id ?? "";

    return {
      name,
      participants,
      expenses: expenses.map(([title, amount, paidBy, sharedWith]) => ({
        id: uuidv4(),
        title,
        amount: toRubles(amount),
        paidBy: idByIndex(paidBy),
        sharedWith: sharedWith
          .map(idByIndex)
          .filter((id): id is string => Boolean(id)),
        createdAt: new Date().toISOString(),
      })),
    };
  } catch {
    // битая или обрезанная ссылка — просто не открываем расчёт
    return null;
  }
};

export const buildTripLink = async (
  draft: TripDraft,
  origin: string,
): Promise<string> =>
  `${origin}/#${LINK_HASH_KEY}=${await encodeTrip(draft)}`;
