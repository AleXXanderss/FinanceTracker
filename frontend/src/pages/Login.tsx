import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";

import api from "../api/client";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const form = new URLSearchParams();

      form.append("username", username);
      form.append("password", password);

      const res = await api.post("/auth/login", form, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", res.data.access_token);

      navigate("/");
    } catch (err: any) {
      console.log(err?.response?.data);
      alert("Не удалось войти");
    }
  };

  return (
    <Container
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        py: 4,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 980,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
        }}
      >
        <Box
          sx={{
            p: { xs: 3.5, md: 5 },
            background:
              "linear-gradient(145deg, rgba(15, 118, 110, 0.98) 0%, rgba(17, 94, 89, 0.94) 58%, rgba(217, 119, 6, 0.9) 100%)",
            color: "common.white",
          }}
        >
          <Chip
            label="Безопасный вход"
            sx={{ bgcolor: "rgba(255, 255, 255, 0.14)", color: "common.white", mb: 2 }}
          />
          <Typography variant="h3" sx={{ maxWidth: 440 }}>
            Контролируйте деньги в спокойном и понятном интерфейсе.
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 460, opacity: 0.92 }}>
            Войдите, чтобы смотреть доходы и расходы по месяцам, ключевые
            показатели и последние операции без лишней рутины.
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h4">Вход</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Укажите данные аккаунта, чтобы открыть главную страницу.
          </Typography>

          <Stack spacing={2} sx={{ mt: 4 }}>
            <TextField
              label="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              type="password"
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="contained" size="large" onClick={handleLogin}>
              Войти
            </Button>

            <Button variant="text" onClick={() => navigate("/register")}>
              Создать аккаунт
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
