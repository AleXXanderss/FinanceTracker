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

      alert("Registration successful");
      navigate("/login");
    } catch (err: any) {
      console.log(err?.response?.data);
      alert("Registration failed");
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
            Register
          </Typography>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 20 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button variant="contained" onClick={handleRegister}>
              Register
            </Button>

            <Button onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}