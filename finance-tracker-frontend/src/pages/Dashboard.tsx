import { useEffect, useState } from "react";
import { Container, Card, CardContent, Typography } from "@mui/material";
import api from "../api/client";
import Navbar from "../components/layout/Navbar";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    api.get("/analytics/summary")
      .then(res => setData(res.data))
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Dashboard</Typography>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography>Income: {data.total_income}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography>Expense: {data.total_expense}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography>Balance: {data.balance}</Typography>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}