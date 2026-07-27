type Goal =
  | "calc" // успешный расчёт
  | "calc_invalid" // нажали «Рассчитать», но форма не заполнена
  | "copy_result" // скопировали результат в буфер
  | "share_result" // отправили результат через системное «Поделиться»
  | "example_open" // открыли пример расчёта
  | "install_app" // нажали «Установить приложение»
  | "donate_click"; // кликнули по ссылке на донат

export const useMetrikaGoal = () => {
  const config = useRuntimeConfig();

  return (goal: Goal, params?: Record<string, unknown>) => {
    // в dev метрика не подключается модулем — цели не шлём
    if (import.meta.server || import.meta.dev) return;

    window.ym?.(
      Number(config.public.yandexMetrika.id),
      "reachGoal",
      goal,
      params,
    );
  };
};

declare global {
  interface Window {
    ym?: (
      id: number,
      action: string,
      goal?: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}
