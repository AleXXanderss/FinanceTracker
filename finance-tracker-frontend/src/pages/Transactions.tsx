import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem
} from "@mui/material";

import api from "../api/client";
import Navbar from "../components/layout/Navbar";
import type { Transaction, Category, TransactionCreate } from "../types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState<TransactionCreate>({
    amount: 0,
    description: "",
    type: "expense",
    category_id: 0
  });

  // загрузка данных
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    loadData();
  }, []);

  // установка категории по умолчанию
  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories.filter(c => c.type === form.type);

      if (filtered.length > 0) {
        setForm(prev => ({
          ...prev,
          category_id: filtered[0].id
        }));
      }
    }
  }, [categories, form.type]);

  const loadData = () => {
    api.get("/transactions/").then(res => setTransactions(res.data));
    api.get("/categories/").then(res => setCategories(res.data));
  };

  const filteredCategories = categories.filter(
    (c) => c.type === form.type
  );

  const createTransaction = async () => {
    try {
      await api.post("/transactions/", form);
      resetForm();
      loadData();
    } catch {
      alert("Error creating transaction");
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await api.delete(`/transactions/${id}`);
      loadData();
    } catch {
      alert("Error deleting");
    }
  };

  const resetForm = () => {
    setForm({
      amount: 0,
      description: "",
      type: "expense",
      category_id: 0
    });
  };

  return (
    <>
      <Navbar />

      <Container style={{ marginTop: 20 }}>
        <Typography variant="h4">Transactions</Typography>

        {/* === ФОРМА === */}
        <Card style={{ padding: 20, marginTop: 20 }}>
          <Typography variant="h6">Create Transaction</Typography>

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />

            <Select
              fullWidth
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as any })
              }
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </Select>
          </div>

          <TextField
            fullWidth
            label="Description"
            style={{ marginTop: 10 }}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <Select
            fullWidth
            style={{ marginTop: 10 }}
            value={form.category_id}
            onChange={(e) =>
              setForm({ ...form, category_id: Number(e.target.value) })
            }
          >
            {filteredCategories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            fullWidth
            style={{ marginTop: 10 }}
            onClick={createTransaction}
          >
            Create Transaction
          </Button>
        </Card>

        {/* === СПИСОК ТРАНЗАКЦИЙ === */}
        {transactions.map((t) => (
          <Card key={t.id} style={{ marginTop: 10 }}>
            <CardContent>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <Typography variant="h6">
                    {t.description || "No description"}
                  </Typography>

                  <Typography color="text.secondary">
                    {t.type.toUpperCase()}
                  </Typography>

                  <Typography style={{ marginTop: 5 }}>
                    Amount: {t.amount}
                  </Typography>
                </div>

                <Button
                  color="error"
                  onClick={() => deleteTransaction(t.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </Container>
    </>
  );
}