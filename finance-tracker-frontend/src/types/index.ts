export interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: "income" | "expense";
  category_id: number;
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
}