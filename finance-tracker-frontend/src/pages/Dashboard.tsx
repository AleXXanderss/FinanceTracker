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
      .catch(() => window.location.href = "/login");
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <>
      <Navbar />

      <Container style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <Card style={{ flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary">Income</Typography>
              <Typography variant="h5">
                {data.total_income}
              </Typography>
            </CardContent>
          </Card>

          <Card style={{ flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary">Expense</Typography>
              <Typography variant="h5">
                {data.total_expense}
              </Typography>
            </CardContent>
          </Card>

          <Card style={{ flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary">Balance</Typography>
              <Typography variant="h5">
                {data.balance}
              </Typography>
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}