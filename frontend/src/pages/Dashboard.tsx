import { useEffect, useState } from "react";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import Navbar from "../components/layout/Navbar";
import type {
  AnalyticsSummary,
  CategoryAnalytics,
  MonthlyAnalytics,
  Transaction,
} from "../types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString("ru-RU", {
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics[]>([]);
  const [categories, setCategories] = useState<CategoryAnalytics[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    let isMounted = true;

    Promise.all([
      api.get("/analytics/summary"),
      api.get("/analytics/monthly", { params: { months: 6 } }),
      api.get("/analytics/by-category"),
      api.get("/transactions/"),
    ])
      .then(([summaryRes, monthlyRes, categoryRes, transactionRes]) => {
        if (!isMounted) {
          return;
        }

        setSummary(summaryRes.data);
        setMonthly(monthlyRes.data);
        setCategories(categoryRes.data);
        setRecentTransactions(transactionRes.data.slice(0, 5));
      })
      .catch((requestError: { response?: { status?: number } }) => {
        if (requestError.response?.status === 401) {
          navigate("/login");
          return;
        }

        setError("Не удалось загрузить данные главной страницы.");
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading || !summary) {
    return (
      <>
        <Navbar />
        <Container sx={{ py: 10, display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            {loading ? <CircularProgress color="primary" /> : null}
            <Typography color="text.secondary">
              {loading ? "Загрузка главной страницы..." : error || "Нет данных для отображения."}
            </Typography>
          </Stack>
        </Container>
      </>
    );
  }

  const maxFlow = Math.max(
    1,
    ...monthly.flatMap((item) => [item.income, item.expense])
  );

  const balanceTone = summary.balance >= 0 ? "success.main" : "error.main";
  const balanceLabel = summary.balance >= 0 ? "Баланс в хорошем состоянии" : "Нужен контроль расходов";
  const topCategories = categories.slice(0, 4);
  const latestMonth = monthly[monthly.length - 1];
  const savingsRate = summary.total_income
    ? Math.round((summary.balance / summary.total_income) * 100)
    : 0;

  const stats = [
    {
      label: "Доходы",
      value: formatCurrency(summary.total_income),
      helper: "Все зафиксированные поступления",
      icon: <TrendingUpRoundedIcon />,
      accent: "rgba(21, 128, 61, 0.12)",
      color: "success.main",
    },
    {
      label: "Расходы",
      value: formatCurrency(summary.total_expense),
      helper: "Все зафиксированные списания",
      icon: <TrendingDownRoundedIcon />,
      accent: "rgba(185, 28, 28, 0.12)",
      color: "error.main",
    },
    {
      label: "Баланс",
      value: formatCurrency(summary.balance),
      helper: balanceLabel,
      icon: <AccountBalanceWalletRoundedIcon />,
      accent: "rgba(15, 118, 110, 0.12)",
      color: balanceTone,
    },
    {
      label: "Операции",
      value: summary.transaction_count.toString(),
      helper: "Общее количество записей",
      icon: <ReceiptLongRoundedIcon />,
      accent: "rgba(217, 119, 6, 0.12)",
      color: "secondary.main",
    },
  ];

  return (
    <>
      <Navbar />

      <Container sx={{ py: { xs: 3, md: 5 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            overflow: "hidden",
            position: "relative",
            background:
              "linear-gradient(135deg, rgba(15, 118, 110, 0.96) 0%, rgba(17, 94, 89, 0.96) 52%, rgba(217, 119, 6, 0.92) 100%)",
            color: "common.white",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: "auto -10% -30% auto",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
            }}
          />

          <Stack spacing={2} sx={{ position: "relative" }}>
            <Chip
              label="Главная сводка"
              sx={{
                width: "fit-content",
                bgcolor: "rgba(255, 255, 255, 0.14)",
                color: "common.white",
              }}
            />

            <Typography variant="h3" sx={{ maxWidth: 620 }}>
              Доходы, расходы и баланс по месяцам в одном окне.
            </Typography>

            <Typography sx={{ maxWidth: 620, opacity: 0.9 }}>
              Главная страница показывает динамику денежных потоков по месяцам,
              чтобы вы быстрее замечали изменения и держали бюджет под контролем.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              useFlexGap
            >
              <Chip
                label={`Норма сбережений: ${savingsRate}%`}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.14)", color: "common.white" }}
              />
              {latestMonth ? (
                <Chip
                  label={`Последний месяц: ${formatMonthLabel(latestMonth.month)}`}
                  sx={{ bgcolor: "rgba(255, 255, 255, 0.14)", color: "common.white" }}
                />
              ) : null}
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            mb: 3,
          }}
        >
          {stats.map((item) => (
            <Paper key={item.label} sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography color="text.secondary">{item.label}</Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {item.helper}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "16px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: item.accent,
                    color: item.color,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.6fr) minmax(320px, 1fr)",
            },
            alignItems: "start",
          }}
        >
          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Box>
                <Typography variant="h5">Движение по месяцам</Typography>
                <Typography color="text.secondary">
                  Доходы и расходы за последние шесть месяцев.
                </Typography>
              </Box>

              <Button variant="outlined" onClick={() => navigate("/transactions")}>
                Открыть транзакции
              </Button>
            </Stack>

            <Stack spacing={2}>
              {monthly.map((item) => (
                <Paper
                  key={item.month}
                  sx={{
                    p: 2,
                    bgcolor: "rgba(255, 255, 255, 0.72)",
                    borderRadius: 4,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                  >
                    <Box sx={{ minWidth: 140 }}>
                      <Typography variant="subtitle1">
                        {formatMonthLabel(item.month)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={item.balance >= 0 ? "success.main" : "error.main"}
                      >
                        Баланс: {formatCurrency(item.balance)}
                      </Typography>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                        Доходы
                      </Typography>
                      <Box
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          bgcolor: "rgba(21, 128, 61, 0.12)",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(item.income / maxFlow) * 100}%`,
                            height: "100%",
                            borderRadius: 999,
                            bgcolor: "success.main",
                          }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ my: 0.75 }}>
                        Расходы
                      </Typography>
                      <Box
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          bgcolor: "rgba(185, 28, 28, 0.12)",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            width: `${(item.expense / maxFlow) * 100}%`,
                            height: "100%",
                            borderRadius: 999,
                            bgcolor: "error.main",
                          }}
                        />
                      </Box>
                    </Box>

                    <Stack spacing={0.75} sx={{ minWidth: 150 }}>
                      <Typography variant="body2">
                        + {formatCurrency(item.income)}
                      </Typography>
                      <Typography variant="body2">
                        - {formatCurrency(item.expense)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Stack spacing={2}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <InsightsRoundedIcon color="primary" />
                <Typography variant="h5">Главные категории расходов</Typography>
              </Stack>

              <Stack spacing={1.5}>
                {topCategories.length > 0 ? (
                  topCategories.map((item, index) => (
                    <Box key={item.category}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography>
                          {index + 1}. {item.category}
                        </Typography>
                        <Typography color="text.secondary">
                          {formatCurrency(item.total)}
                        </Typography>
                      </Stack>
                      {index < topCategories.length - 1 ? <Divider sx={{ mt: 1.5 }} /> : null}
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    Пока нет категорий расходов.
                  </Typography>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Полезные сигналы
              </Typography>

              <Stack spacing={1.5}>
                <Box>
                  <Typography color="text.secondary">Средний доход за операцию</Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.average_income)}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography color="text.secondary">Средний расход за операцию</Typography>
                  <Typography variant="h6">
                    {formatCurrency(summary.average_expense)}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography color="text.secondary">Чистый поток за последний месяц</Typography>
                  <Typography
                    variant="h6"
                    color={latestMonth && latestMonth.balance < 0 ? "error.main" : "success.main"}
                  >
                    {formatCurrency(latestMonth?.balance ?? 0)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Последние операции
              </Typography>

              <Stack spacing={1.5}>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <Box key={transaction.id}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Box>
                          <Typography>
                            {transaction.description || "Без описания"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString("ru-RU")}
                          </Typography>
                        </Box>
                        <Typography
                          color={transaction.type === "income" ? "success.main" : "error.main"}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </Stack>
                      {index < recentTransactions.length - 1 ? (
                        <Divider sx={{ mt: 1.5 }} />
                      ) : null}
                    </Box>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    Пока нет сохранённых операций.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
