import { useEffect, useState } from "react";
import api from "../api/client";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/analytics/summary")
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        alert("Not authorized");
        window.location.href = "/login";
      });
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>Dashboard</h2>

      <p>Income: {data.total_income}</p>
      <p>Expense: {data.total_expense}</p>
      <p>Balance: {data.balance}</p>
    </div>
  );
}