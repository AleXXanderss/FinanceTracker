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

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await api.post("/users/", {
        username,
        email,
        password,
      });
    } catch (err: any) {
      console.log(err?.response?.data);
      alert("Не удалось зарегистрироваться");
      return;
    }

    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);

      const loginRes = await api.post("/auth/login", form, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      localStorage.setItem("token", loginRes.data.access_token);
      navigate("/");
    } catch (err: any) {
      console.log(err?.response?.data);
      alert("Аккаунт создан, но войти автоматически не удалось. Войдите вручную.");
      navigate("/login");
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
              "linear-gradient(145deg, rgba(255, 250, 242, 0.94) 0%, rgba(251, 191, 36, 0.16) 100%)",
          }}
        >
          <Chip
            label="Новый кабинет"
            color="secondary"
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <Typography variant="h3" sx={{ maxWidth: 440 }}>
            Соберите понятную картину по финансам с первого дня.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 460 }}>
            Создайте аккаунт, чтобы сразу фиксировать операции, отслеживать
            доходы и расходы по месяцам и видеть изменение баланса в одном месте.
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h4">Регистрация</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Заполните поля ниже, и после регистрации вы сразу попадёте в аккаунт.
          </Typography>

          <Stack spacing={2} sx={{ mt: 4 }}>
            <TextField
              label="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="Электронная почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              type="password"
              label="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="contained" size="large" onClick={handleRegister}>
              Зарегистрироваться
            </Button>

            <Button variant="text" onClick={() => navigate("/login")}>
              Назад ко входу
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
