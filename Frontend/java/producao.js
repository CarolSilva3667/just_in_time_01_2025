const API_URL = "http://localhost:3000";

const usuario = JSON.parse(
    localStorage.getItem("usuario")
);

if (!usuario) {
    window.location.href = "login.html";
}

const nomeUsuario = document.getElementById("nomeUsuario");
const selectProduto = document.getElementById("produto");
const tipo = document.getElementById("tipo");
const quantidade = document.getElementById("quantidade");
const data = document.getElementById("data");
const informacaoEstoque = document.getElementById("informacaoEstoque");
const mensagem = document.getElementById("mensagem");
const producaoForm = document.getElementById("producaoForm");

if (nomeUsuario) {
    nomeUsuario.textContent = usuario.nome;
}

const hoje = new Date();

const ano = hoje.getFullYear();

const mes = String(
    hoje.getMonth() + 1
).padStart(2, "0");

const dia = String(
    hoje.getDate()
).padStart(2, "0");

const dataAtual = `${ano}-${mes}-${dia}`;

if (data) {
    data.value = dataAtual;
}

async function carregarProdutos() {

    try {

        const resposta = await fetch(
            `${API_URL}/produtos`,
            {
                credentials: "include"
            }
        );

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar produtos."
            );
        }

        const produtos = await resposta.json();

        produtos.sort((a, b) =>
            String(a.nome).localeCompare(
                String(b.nome),
                "pt-BR"
            )
        );

        preencherSelect(produtos);
        exibirTabela(produtos);

    } catch (erro) {
        console.error(
            "Erro ao carregar produtos:",
            erro
        );

        if (mensagem) {
            mensagem.textContent =
                "Erro ao carregar os produtos.";
        }
    }
}

function preencherSelect(produtos) {

    if (!selectProduto) {
        return;
    }

    selectProduto.innerHTML = "";

    const opcaoInicial =
        document.createElement("option");

    opcaoInicial.value = "";
    opcaoInicial.textContent =
        "Selecione um produto";

    selectProduto.appendChild(
        opcaoInicial
    );

    produtos.forEach(produto => {

        const option =
            document.createElement("option");

        option.value = produto.id;

        option.textContent =
            `${produto.nome} - Estoque: ${produto.quantidade_estoque}`;

        option.dataset.estoque =
            produto.quantidade_estoque;

        option.dataset.minimo =
            produto.estoque_minimo;

        selectProduto.appendChild(
            option
        );
    });
}

function exibirTabela(produtos) {

    const tabela =
        document.getElementById(
            "tabelaProducao"
        );

    if (!tabela) {
        return;
    }

    tabela.innerHTML = "";

    produtos.forEach(produto => {

        const tr =
            document.createElement("tr");

        const estoque =
            Number(produto.quantidade_estoque);

        const minimo =
            Number(produto.estoque_minimo);

        const estoqueBaixo =
            estoque <= minimo;

        const status = estoqueBaixo
            ? `
                <span class="status status-alerta">
                    ⚠ Abaixo do mínimo
                </span>
              `
            : `
                <span class="status status-ok">
                    ✓ Estoque normal
                </span>
              `;

        tr.innerHTML = `
            <td>
                <strong>
                    ${produto.nome}
                </strong>
            </td>

            <td>
                R$ ${Number(produto.custo || 0)
                .toFixed(2)
                .replace(".", ",")}
            </td>

            <td>
                ${estoque}
            </td>

            <td>
                ${minimo}
            </td>

            <td>
                ${status}
            </td>
        `;

        tabela.appendChild(tr);
    });
}

if (selectProduto) {

    selectProduto.addEventListener(
        "change",
        atualizarInformacaoEstoque
    );
}

function atualizarInformacaoEstoque() {

    if (!selectProduto || !informacaoEstoque) {
        return;
    }

    const option =
        selectProduto.options[
        selectProduto.selectedIndex
        ];

    if (!option || !option.value) {

        informacaoEstoque.textContent =
            "Selecione um produto para visualizar o estoque.";

        return;
    }

    const estoque =
        Number(option.dataset.estoque || 0);

    const minimo =
        Number(option.dataset.minimo || 0);

    if (estoque <= minimo) {

        informacaoEstoque.innerHTML = `
            ⚠️
            <strong>
                Estoque abaixo do mínimo!
            </strong>
            <br>
            Estoque atual:
            ${estoque}
            |
            Mínimo:
            ${minimo}
        `;

    } else {
        informacaoEstoque.innerHTML = `
            Estoque atual:
            <strong>
                ${estoque}
            </strong>
            |
            Estoque mínimo:
            <strong>
                ${minimo}
            </strong>
        `;
    }
}

if (producaoForm) {

    producaoForm.addEventListener(
        "submit",
        registrarMovimentacao
    );
}

async function registrarMovimentacao(event) {
    event.preventDefault();

    const produtoId =
        Number(selectProduto.value);

    const tipoMovimentacao =
        tipo.value;

    const quantidadeMovimentada =
        Number(quantidade.value);

    const dataMovimentacao =
        data.value;

    if (!produtoId) {

        alert(
            "Selecione um produto."
        );

        return;
    }

    if (!tipoMovimentacao) {

        alert(
            "Selecione o tipo de movimentação."
        );

        return;
    }

    if (
        !quantidadeMovimentada ||
        quantidadeMovimentada <= 0
    ) {

        alert(
            "Informe uma quantidade válida."
        );

        return;
    }

    if (!dataMovimentacao) {

        alert(
            "Informe a data da movimentação."
        );

        return;
    }

    const option =
        selectProduto.options[
        selectProduto.selectedIndex
        ];

    const estoqueAtual =
        Number(option.dataset.estoque || 0);

    if (
        tipoMovimentacao === "PEDIDO" &&
        quantidadeMovimentada > estoqueAtual
    ) {

        alert(
            `Estoque insuficiente!

Estoque disponível: ${estoqueAtual}
Quantidade solicitada: ${quantidadeMovimentada}`
        );

        return;
    }

    const dados = {
        produto_id: produtoId,
        tipo: tipoMovimentacao,
        quantidade: quantidadeMovimentada,
        data: dataMovimentacao
    };

    console.log(
        "Dados enviados:",
        dados
    );

    try {
        const resposta = await fetch(
            `${API_URL}/producao`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials: "include",

                body: JSON.stringify(dados)
            }
        );

        const resultado =
            await resposta.json();

        console.log(
            "Resposta da API:",
            resultado
        );

        if (!resposta.ok) {

            alert(
                resultado.mensagem ||
                "Erro ao registrar movimentação."
            );

            return;
        }

        if (
            tipoMovimentacao === "FABRICADO"
        ) {

            alert(
                "Produção registrada! O estoque foi aumentado."
            );

        } else {

            alert(
                "Pedido registrado! O estoque foi reduzido."
            );
        }

        if (resultado.estoque_baixo) {

            alert(
                `⚠️ ATENÇÃO!

O estoque do produto está abaixo do mínimo.

Estoque atual:
${resultado.estoque_atual}

Estoque mínimo:
${resultado.estoque_minimo}`
            );
        }

        producaoForm.reset();
        data.value = dataAtual;
        informacaoEstoque.textContent =
            "Selecione um produto para visualizar o estoque.";

        await carregarProdutos();
        await carregarHistorico();

    } catch (erro) {
        console.error(
            "Erro ao registrar movimentação:",
            erro
        );

        alert(
            "Erro ao conectar ao servidor."
        );
    }
}

async function carregarHistorico() {
    try {
        const resposta =
            await fetch(
                `${API_URL}/producao`,
                {
                    credentials: "include"
                }
            );

        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar histórico."
            );
        }

        const producoes =
            await resposta.json();

        const tabela =
            document.getElementById(
                "tabelaHistorico"
            );

        if (!tabela) {
            return;
        }

        tabela.innerHTML = "";

        producoes.forEach(producao => {

            const tr =
                document.createElement("tr");

            const tipoTexto =
                producao.tipo === "FABRICADO"
                    ? `
                        <span class="status status-ok">
                            Entrada
                        </span>
                      `
                    : `
                        <span class="status status-alerta">
                            Saída
                        </span>
                      `;

            tr.innerHTML = `
                <td>
                    ${producao.produto_nome || ""}
                </td>

                <td>
                    ${producao.usuario_nome || ""}
                </td>

                <td>
                    ${tipoTexto}
                </td>

                <td>
                    ${producao.quantidade}
                </td>

                <td>
                    ${formatarData(
                producao.data
            )}
                </td>
            `;

            tabela.appendChild(tr);
        });

    } catch (erro) {
        console.error(
            "Erro ao carregar histórico:",
            erro
        );
    }
}

function formatarData(data) {

    if (!data) {
        return "";
    }
    if (
        typeof data === "string" &&
        data.includes("-")
    ) {

        const partes =
            data.substring(0, 10)
                .split("-");

        if (partes.length === 3) {

            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }

    return data;
}

function logout() {
    localStorage.removeItem(
        "usuario"
    );

    window.location.href =
        "login.html";
}

carregarProdutos();
carregarHistorico();
