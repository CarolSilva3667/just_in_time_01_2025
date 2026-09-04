const express = require("express");
const cors = require("cors");
const session = require("express-session");

const loginRoutes = require("./src/routes/login.routes");
const produtoRoutes = require("./src/routes/produto.routes");
const producaoRoutes = require("./src/routes/producao.routes");

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(
    session({
        secret: "segredo-jit",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false
        }
    })
);

app.use("/", loginRoutes);
app.use("/produtos", produtoRoutes);
app.use("/producao", producaoRoutes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "Servidor funcionando!"
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
