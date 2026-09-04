const conection = require("../data/conection");

async function listarProducao(req, res) {
    try {
        const [producoes] = await conection.query(`
            SELECT
                p.id,
                p.produto_id,
                pr.nome AS produto_nome,
                p.usuario_id,
                u.nome AS usuario_nome,
                p.tipo,
                p.quantidade,
                p.data
            FROM producao p
            INNER JOIN produto pr
                ON p.produto_id = pr.id
            INNER JOIN usuario u
                ON p.usuario_id = u.id
            ORDER BY p.data DESC, p.id DESC
        `);

        res.json(producoes);
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            mensagem: "Erro ao buscar produção."
        });
    }
}

async function registrarMovimentacao(req, res) {
    const conexao = await conection.getConnection();

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

        if (
            tipo !== "FABRICADO" &&
            tipo !== "PEDIDO"
        ) {
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
            `
            SELECT
                quantidade_estoque,
                estoque_minimo
            FROM produto
            WHERE id = ?
            FOR UPDATE
            `,
            [produto_id]
        );

        if (produtos.length === 0) {

            await conexao.rollback();

            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        const estoqueAtual =
            Number(produtos[0].quantidade_estoque);

        const estoqueMinimo =
            Number(produtos[0].estoque_minimo);

        let novoEstoque;

        if (tipo === "FABRICADO") {

            novoEstoque =
                estoqueAtual + Number(quantidade);

        }

        else {

            if (Number(quantidade) > estoqueAtual) {

                await conexao.rollback();

                return res.status(400).json({
                    mensagem:
                        "Quantidade solicitada maior que o estoque disponível."
                });
            }

            novoEstoque =
                estoqueAtual - Number(quantidade);
        }

        await conexao.query(
            `
            UPDATE produto
            SET quantidade_estoque = ?
            WHERE id = ?
            `,
            [
                novoEstoque,
                produto_id
            ]
        );

        await conexao.query(
            `
            INSERT INTO producao
            (
                produto_id,
                usuario_id,
                tipo,
                quantidade,
                data
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                produto_id,
                req.session.usuario.id,
                tipo,
                Number(quantidade),
                data
            ]
        );

        await conexao.commit();

        const estoqueBaixo =
            novoEstoque <= estoqueMinimo;

        res.status(201).json({
            mensagem:
                "Movimentação registrada com sucesso!",

            estoque_atual:
                novoEstoque,

            estoque_minimo:
                estoqueMinimo,

            estoque_baixo:
                estoqueBaixo
        });

    } catch (erro) {
        await conexao.rollback();
        console.error(erro);

        res.status(500).json({
            mensagem:
                "Erro ao registrar movimentação."
        });

    } finally {
        conexao.release();
    }
}

module.exports = {
    listarProducao,
    registrarMovimentacao
};