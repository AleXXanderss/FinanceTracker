import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  Container,
  Divider,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import Navbar from "../components/layout/Navbar";
import type { Transaction, Category, TransactionCreate } from "../types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function getLocalDateTimeValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export default function TransactionsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<TransactionCreate>({
    amount: 0,
    description: "",
    type: "expense",
    category_id: 0,
    date: getLocalDateTimeValue(),
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    loadData();
  }, [navigate]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const filtered = categories.filter((category) => category.type === form.type);

    if (filtered.length > 0 && !filtered.some((category) => category.id === form.category_id)) {
      setForm((prev) => ({
        ...prev,
        category_id: filtered[0].id,
      }));
    }
  }, [categories, form.category_id, form.type]);

  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.all([api.get("/transactions/"), api.get("/categories/")])
      .then(([transactionRes, categoryRes]) => {
        setTransactions(transactionRes.data);
        setCategories(categoryRes.data);
      })
      .catch((error: { response?: { status?: number } }) => {
        if (error.response?.status === 401) {
          navigate("/login");
          return;
        }

        setError("Сейчас не удалось загрузить транзакции.");
      })
      .finally(() => setLoading(false));
  };

  const filteredCategories = categories.filter((category) => category.type === form.type);
  const categoryMap = Object.fromEntries(
    categories.map((category) => [category.id, category.name])
  );

  const createTransaction = async () => {
    if (!form.category_id) {
      setError("Выберите категорию перед сохранением.");
      return;
    }

    try {
      await api.post("/transactions/", form);
      resetForm();
      loadData();
    } catch {
      setError("Не удалось создать транзакцию.");
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await api.delete(`/transactions/${id}`);
      loadData();
    } catch {
      setError("Не удалось удалить транзакцию.");
    }
  };

  const resetForm = () => {
    setForm({
      amount: 0,
      description: "",
      type: "expense",
      category_id: 0,
      date: getLocalDateTimeValue(),
    });
  };

  const incomeTotal = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenseTotal = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return (
    <>
      <Navbar />

      <Container sx={{ py: { xs: 3, md: 5 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            background:
              "linear-gradient(145deg, rgba(255, 250, 242, 0.88) 0%, rgba(255, 255, 255, 0.82) 100%)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={3}
          >
            <Box>
              <Typography variant="h3">Транзакции</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 620 }}>
                Добавляйте доходы и расходы в более понятном формате, управляйте
                датой операции и быстрее отслеживайте движение денег.
              </Typography>
            </Box>

            <Stack direction={{ xs: "row", md: "column" }} spacing={1.5}>
              <Chip color="success" label={`Доходы: ${formatCurrency(incomeTotal)}`} />
              <Chip color="error" label={`Расходы: ${formatCurrency(expenseTotal)}`} />
              <Chip
                color="primary"
                variant="outlined"
                label={`Записей: ${transactions.length}`}
              />
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(320px, 420px) minmax(0, 1fr)",
            },
            alignItems: "start",
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5">Создать транзакцию</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Добавьте новую операцию, чтобы месячная аналитика оставалась точной.
            </Typography>

            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth
                  label="Сумма"
                  type="number"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm({ ...form, amount: Number(e.target.value) })
                  }
                />

                <Select
                  fullWidth
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as "income" | "expense" })
                  }
                >
                  <MenuItem value="income">Доход</MenuItem>
                  <MenuItem value="expense">Расход</MenuItem>
                </Select>
              </Stack>

              <TextField
                fullWidth
                label="Описание"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <TextField
                fullWidth
                label="Дата и время"
                type="datetime-local"
                value={form.date || ""}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value || null })
                }
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <Select
                fullWidth
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: Number(e.target.value) })
                }
              >
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value={0} disabled>
                    Нет категорий для этого типа
                  </MenuItem>
                )}
              </Select>

              {error ? (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              ) : null}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={createTransaction}
                >
                  Сохранить транзакцию
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={resetForm}
                >
                  Сбросить форму
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography variant="h5">История операций</Typography>
                <Typography color="text.secondary">
                  Транзакции отсортированы от новых к старым.
                </Typography>
              </Box>

              <Button variant="text" onClick={loadData}>
                Обновить список
              </Button>
            </Stack>

            {loading ? (
              <Typography color="text.secondary">Загрузка транзакций...</Typography>
            ) : transactions.length === 0 ? (
              <Typography color="text.secondary">
                Пока нет транзакций. Добавьте первую через форму слева.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {transactions.map((transaction, index) => (
                  <Box key={transaction.id}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ py: 1 }}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                          <Typography variant="h6">
                            {transaction.description || "Без описания"}
                          </Typography>
                          <Chip
                            size="small"
                            label={transaction.type === "income" ? "Доход" : "Расход"}
                            color={transaction.type === "income" ? "success" : "error"}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={categoryMap[transaction.category_id] || "Категория"}
                            variant="filled"
                          />
                        </Stack>

                        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                          {new Date(transaction.date).toLocaleString("ru-RU")}
                        </Typography>
                      </Box>

                      <Stack
                        direction={{ xs: "row", md: "column" }}
                        spacing={1.5}
                        alignItems={{ xs: "center", md: "flex-end" }}
                      >
                        <Typography
                          variant="h6"
                          color={transaction.type === "income" ? "success.main" : "error.main"}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </Typography>

                        <Button
                          color="error"
                          variant="text"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          Удалить
                        </Button>
                      </Stack>
                    </Stack>

                    {index < transactions.length - 1 ? <Divider /> : null}
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Container>
    </>
  );
}
