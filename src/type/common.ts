export interface Trip {
  id: string; // уникальный ID поездки
  name: string; // название поездки (например, "Турция 2025")
  participants: Participant[]; // список участников
  expenses: Expense[]; // список расходов
  createdAt: string; // дата создания
}

export interface Participant {
  id: string; // уникальный ID участника
  name: string; // имя (например, "Аня")
}

export interface Expense {
  id: string; // уникальный ID расхода
  title: string; // описание (например, "Жильё")
  amount: number | null; // сумма
  paidBy: string; // id участника, который заплатил
  sharedWith: string[]; // массив id участников, которые делят этот расход
  createdAt: string;
}

export interface Balance {
  [debtorId: string]: {
    [creditorId: string]: number; // сколько debtor должен creditor
  };
}

export interface Debt {
  from: string; // participant.id
  to: string; // participant.id
  amount: number;
}

export interface Result {
  items: {
    debtorName: string;
    creditorName: string;
    amount: number;
  }[];
  forCopy: string[];
}
