import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button
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
      alert("Login failed");
    }
  };

  return (
    <Container
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Card style={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" align="center">
            Login
          </Typography>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="contained" onClick={handleLogin}>
              Login
            </Button>

            <Button onClick={() => navigate("/register")}>
              Go to Register
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}