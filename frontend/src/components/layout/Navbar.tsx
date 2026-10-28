import { AppBar, Toolbar, Typography, Button, Box, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar
        sx={{
          gap: 2,
          minHeight: 78,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              color: "common.white",
              background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
              boxShadow: "0 12px 30px rgba(15, 118, 110, 0.28)",
            }}
          >
            FT
          </Box>

          <Box>
            <Typography variant="h6">
              Финансовый трекер
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Личный центр управления деньгами
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Chip
            label="Живая сводка"
            color="primary"
            variant="outlined"
            sx={{ borderRadius: "999px", bgcolor: "rgba(15, 118, 110, 0.05)" }}
          />

          <Button color="inherit" onClick={() => navigate("/")}>
            Главная
          </Button>

          <Button color="inherit" onClick={() => navigate("/transactions")}>
            Транзакции
          </Button>

          <Button color="inherit" onClick={() => navigate("/categories")}>
            Категории
          </Button>

          <Button
            color="inherit"
            variant="outlined"
            onClick={logout}
            sx={{ borderColor: "rgba(31, 41, 55, 0.16)" }}
          >
            Выйти
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
