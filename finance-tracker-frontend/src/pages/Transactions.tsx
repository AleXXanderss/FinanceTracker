import { useEffect, useState } from "react";
import { Container, Typography, Card, CardContent } from "@mui/material";
import api from "../api/client";
import Navbar from "../components/layout/Navbar";
import type { Transaction } from "../types";

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    api.get("/transactions/")
      .then(res => setData(res.data))
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  return (
    <>
      <Navbar />

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4">Transactions</Typography>

        {data.map(t => (
          <Card key={t.id} sx={{ mt: 2 }}>
            <CardContent>
              <Typography>{t.description}</Typography>
              <Typography>{t.amount}</Typography>
              <Typography>{t.type}</Typography>
            </CardContent>
          </Card>
        ))}
      </Container>
    </>
  );
}