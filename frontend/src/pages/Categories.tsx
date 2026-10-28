import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import api from "../api/client";
import Navbar from "../components/layout/Navbar";
import type { Category } from "../types";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories/");
      setCategories(res.data);
    } catch (requestError: any) {
      if (requestError?.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Не удалось загрузить категории.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    loadCategories();
  }, [navigate]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Введите название категории.");
      return;
    }

    try {
      await api.post("/categories/", {
        name: name.trim(),
        type,
      });
      setName("");
      setError("");
      await loadCategories();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.detail || "Не удалось создать категорию.");
    }
  };

  return (
    <>
      <Navbar />

      <Container sx={{ py: { xs: 3, md: 5 } }}>
        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h3">Категории</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Удобно группировать доходы, расходы и анализировать финансовые потоки.
              </Typography>
            </Box>

            <Chip
              color={type === "income" ? "success" : "primary"}
              variant="outlined"
              label={type === "income" ? "Доходы" : "Расходы"}
            />
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(280px, 360px) minmax(0, 1fr)",
            },
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Добавить категорию</Typography>

            <Stack spacing={2}>
              <TextField
                label="Название категории"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Select
                value={type}
                onChange={(e) => setType(e.target.value as "income" | "expense")}
              >
                <MenuItem value="expense">Расход</MenuItem>
                <MenuItem value="income">Доход</MenuItem>
              </Select>

              <Button variant="contained" onClick={handleCreate}>
                Создать категорию
              </Button>

              {error ? <Typography color="error.main">{error}</Typography> : null}
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Список категорий</Typography>

            {loading ? (
              <Typography color="text.secondary">Загрузка...</Typography>
            ) : categories.length === 0 ? (
              <Typography color="text.secondary">Категорий пока нет.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {categories.map((category) => (
                  <Box
                    key={category.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.type === "income" ? "Доход" : "Расход"}
                      </Typography>
                    </Box>
                    <Chip
                      color={category.type === "income" ? "success" : "primary"}
                      size="small"
                      label={category.type === "income" ? "income" : "expense"}
                      variant="outlined"
                    />
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
