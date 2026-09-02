const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

app.get("/", (req, res) => {
    res.json({
        mensagem: "Backend do Sistema Just in Time funcionando!"
    });
});

app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe o e-mail e a senha."
            });
        }

        const [usuarios] = await pool.query(
            "SELECT id, nome, email FROM usuario WHERE email = ? AND senha = ?",
            [email, senha]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        const usuario = usuarios[0];

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        res.json({
            mensagem: "Login realizado com sucesso!",
            usuario: req.session.usuario
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao realizar login."
        });
    }
});

app.get("/me", (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    res.json({
        usuario: req.session.usuario
    });
});

app.post("/logout", (req, res) => {

    req.session.destroy((erro) => {

        if (erro) {
            return res.status(500).json({
                mensagem: "Erro ao sair."
            });
        }

        res.json({
            mensagem: "Logout realizado com sucesso!"
        });
    });
});

app.get("/produtos", async (req, res) => {
    try {
        const busca = req.query.busca || "";
        const [produtos] = await pool.query(
            `SELECT *
             FROM produto
             WHERE nome LIKE ?
                OR descricao LIKE ?
             ORDER BY nome ASC`,
            [`%${busca}%`, `%${busca}%`]
        );

        res.json(produtos);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar produtos."
        });
    }
});

app.post("/produtos", async (req, res) => {
    try {
        const {
            nome,
            descricao,
            custo,
            quantidade_estoque,
            estoque_minimo
        } = req.body;

        if (!nome || custo === undefined) {
            return res.status(400).json({
                mensagem: "Nome e custo são obrigatórios."
            });
        }

        if (Number(custo) < 0) {
            return res.status(400).json({
                mensagem: "O custo não pode ser negativo."
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO produto
            (nome, descricao, custo, quantidade_estoque, estoque_minimo)
            VALUES (?, ?, ?, ?, ?)`,
            [
                nome,
                descricao || "",
                Number(custo),
                Number(quantidade_estoque) || 0,
                Number(estoque_minimo) || 0
            ]
        );

        res.status(201).json({
            mensagem: "Produto cadastrado com sucesso!",
            id: resultado.insertId
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar produto."
        });
    }
});

app.put("/produtos/:id", async (req, res) => {

    try {
        const { id } = req.params;
        const {
            nome,
            descricao,
            custo,
            quantidade_estoque,
            estoque_minimo
        } = req.body;

        if (!nome || custo === undefined) {
            return res.status(400).json({
                mensagem: "Nome e custo são obrigatórios."
            });
        }

        if (Number(custo) < 0) {
            return res.status(400).json({
                mensagem: "O custo não pode ser negativo."
            });
        }

        const [resultado] = await pool.query(
            `UPDATE produto
             SET nome = ?,
                 descricao = ?,
                 custo = ?,
                 quantidade_estoque = ?,
                 estoque_minimo = ?
             WHERE id = ?`,
            [
                nome,
                descricao || "",
                Number(custo),
                Number(quantidade_estoque) || 0,
                Number(estoque_minimo) || 0,
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        res.json({
            mensagem: "Produto atualizado com sucesso!"
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar produto."
        });
    }
});

app.delete("/produtos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [resultado] = await pool.query(
            "DELETE FROM produto WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        res.json({
            mensagem: "Produto excluído com sucesso!"
        });

    } catch (erro) {
        console.error(erro);

        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({
                mensagem: "Não é possível excluir este produto porque existem movimentações relacionadas."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao excluir produto."
        });
    }
});

app.get("/producao", async (req, res) => {
    try {
        const [producoes] = await pool.query(
            `SELECT
                p.id,
                p.produto_id,
                pr.nome AS produto_nome,
                p.usuario_id,
                u.nome AS usuario_nome,
                p.tipo,
                p.quantidade,
                p.data
             FROM producao p
             INNER JOIN produto pr ON p.produto_id = pr.id
             INNER JOIN usuario u ON p.usuario_id = u.id
             ORDER BY p.data DESC, p.id DESC`
        );
        res.json(producoes);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao buscar produção."
        });
    }
});

app.post("/producao", async (req, res) => {
    const conexao = await pool.getConnection();
    try {

        if (!req.session.usuario) {
            return res.status(401).json({
                mensagem: "Usuário não autenticado."
            });
        }

        const {
            produto_id,
            tipo,
            quantidade,
            data
        } = req.body;

        if (!produto_id || !tipo || !quantidade || !data) {
            return res.status(400).json({
                mensagem: "Preencha todos os campos."
            });
        }

        if (tipo !== "FABRICADO" && tipo !== "PEDIDO") {
            return res.status(400).json({
                mensagem: "Tipo de movimentação inválido."
            });
        }

        if (Number(quantidade) <= 0) {
            return res.status(400).json({
                mensagem: "A quantidade deve ser maior que zero."
            });
        }

        await conexao.beginTransaction();

        const [produtos] = await conexao.query(
            `SELECT quantidade_estoque, estoque_minimo
             FROM produto
             WHERE id = ?
             FOR UPDATE`,
            [produto_id]
        );
        if (produtos.length === 0) {
            await conexao.rollback();
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }
        const estoqueAtual = produtos[0].quantidade_estoque;
        const estoqueMinimo = produtos[0].estoque_minimo;

        let novoEstoque;

        if (tipo === "FABRICADO") {

            novoEstoque = estoqueAtual + Number(quantidade);
        } else {
            if (Number(quantidade) > estoqueAtual) {
                await conexao.rollback();
                return res.status(400).json({
                    mensagem: "Quantidade solicitada maior que o estoque disponível."
                });
            }
            novoEstoque = estoqueAtual - Number(quantidade);
        }

        await conexao.query(
            `UPDATE produto
             SET quantidade_estoque = ?
             WHERE id = ?`,
            [novoEstoque, produto_id]
        );

        await conexao.query(
            `INSERT INTO producao
            (produto_id, usuario_id, tipo, quantidade, data)
            VALUES (?, ?, ?, ?, ?)`,
            [
                produto_id,
                req.session.usuario.id,
                tipo,
                Number(quantidade),
                data
            ]
        );
        await conexao.commit();
        const estoqueBaixo = novoEstoque <= estoqueMinimo;
        res.status(201).json({
            mensagem: "Movimentação registrada com sucesso!",
            estoque_atual: novoEstoque,
            estoque_minimo: estoqueMinimo,
            estoque_baixo: estoqueBaixo
        });
    } catch (erro) {
        await conexao.rollback();
        console.error(erro);
        res.status(500).json({
            mensagem: "Erro ao registrar movimentação."
        });
    } finally {
        conexao.release();
    }
});

app.listen(PORT, () => {
    console.log(`
 Sistema Just in Time
 Backend iniciado!
Servidor: http://localhost:${PORT}
Banco: ${process.env.DB_NAME}
`);
});