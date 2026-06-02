export interface Transaction {
  id: number;
  amount: number;
  description: string | null;
  type: "income" | "expense";
  category_id: number;
  date: string;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
}

export interface TransactionCreate {
  amount: number;
  description: string;
  type: "income" | "expense";
  category_id: number;
  date?: string | null;
}

export interface AnalyticsSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
  average_income: number;
  average_expense: number;
}

export interface MonthlyAnalytics {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryAnalytics {
  category: string;
  total: number;
}
