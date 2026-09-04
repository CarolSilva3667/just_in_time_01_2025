const conection = require("../data/conection");

async function listarProdutos(req, res) {
    try {
        const [produtos] = await conection.query(`
            SELECT
                id,
                nome,
                custo,
                quantidade_estoque,
                estoque_minimo
            FROM produto
            ORDER BY nome ASC
        `);

        res.json(produtos);

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar produtos."
        });
    }
}

async function cadastrarProduto(req, res) {
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

        const [resultado] = await conection.query(
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
}

async function atualizarProduto(req, res) {
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

        const [resultado] = await conection.query(
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
}

async function excluirProduto(req, res) {
    try {
        const { id } = req.params;
        const [resultado] = await conection.query(
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
                mensagem:
                    "Não é possível excluir este produto porque existem movimentações relacionadas."
            });
        }

        res.status(500).json({
            mensagem: "Erro ao excluir produto."
        });
    }
}

module.exports = {
    listarProdutos,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
};