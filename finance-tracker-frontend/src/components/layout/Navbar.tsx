import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography sx={{ flexGrow: 1 }}>
          Finance Tracker
        </Typography>

        <Button color="inherit" onClick={() => navigate("/")}>
          Dashboard
        </Button>

        <Button color="inherit" onClick={() => navigate("/transactions")}>
          Transactions
        </Button>

        <Button color="inherit" onClick={logout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}