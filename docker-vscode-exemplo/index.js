const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "🐳 Docker + VS Code funcionando!",
    timestamp: new Date().toISOString(),
    ambiente: process.env.NODE_ENV || "production",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📝 Acesse: http://localhost:${PORT}`);
});
