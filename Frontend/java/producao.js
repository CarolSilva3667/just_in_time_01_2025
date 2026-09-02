const API_URL = "http://localhost:3000";
const usuario = JSON.parse(
    localStorage.getItem("usuario")
);
if (!usuario) {
window.location.href =
    "login.html";
}

document.getElementById("nomeUsuario").textContent =
    usuario.nome;
const selectProduto =
    document.getElementById("produto");
const tipo =
    document.getElementById("tipo");
const quantidade =
    document.getElementById("quantidade");
const data =
    document.getElementById("data");
const informacaoEstoque =
    document.getElementById("informacaoEstoque");

const hoje = new Date();
const ano = hoje.getFullYear();
const mes =
    String(hoje.getMonth() + 1)
        .padStart(2, "0");
const dia =
    String(hoje.getDate())
        .padStart(2, "0");
data.value =
    `${ano}-${mes}-${dia}`;

async function carregarProdutos() {
try {
    const resposta =
        await fetch(
            `${ API_URL }/produtos`
        );

    let produtos =
        await resposta.json();
    produtos.sort(
        (a, b) =>
            a.nome.localeCompare(
                b.nome,
                "pt-BR"
            )
    );

    preencherSelect(produtos);
    exibirTabela(produtos);
} catch (erro) {
    console.error(erro);
    alert(
        "Erro ao carregar os produtos."
    );
}

}

function preencherSelect(produtos) {
selectProduto.innerHTML = `
    <option value="">
        Selecione um produto
    </option>
`;

produtos.forEach(produto => {
    const option =
        document.createElement("option");
    option.value =
        produto.id;
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

tabela.innerHTML = "";
produtos.forEach(produto => {
    const tr =
        document.createElement("tr");
    const estoqueBaixo =
        produto.quantidade_estoque <
        produto.estoque_minimo;

    const status = estoqueBaixo
        ? `<span class="status status-alerta">
            ⚠ Abaixo do mínimo
           </span>`
        : `<span class="status status-ok">
            ✓ Estoque normal
           </span>`;

    tr.innerHTML = `
        <td>
            <strong>
                ${produto.nome}
            </strong>
        </td>
        <td>
            R$ ${Number(produto.custo)
            .toFixed(2)
            .replace(".", ",")}
        </td>
        <td>
            ${produto.quantidade_estoque}
        </td>
        <td>
            ${produto.estoque_minimo}
        </td>
        <td>
            ${status}
        </td>
    `;
    tabela.appendChild(tr);
});

}

selectProduto.addEventListener(
"change",
atualizarInformacaoEstoque
);

function atualizarInformacaoEstoque() {
const option =
    selectProduto.options[
    selectProduto.selectedIndex
    ];

if (!option.value) {
    informacaoEstoque.textContent =
        "Selecione um produto para visualizar o estoque.";

    return;
}

const estoque =
    Number(
        option.dataset.estoque
    );

const minimo =
    Number(
        option.dataset.minimo
    );

if (estoque < minimo) {
    informacaoEstoque.innerHTML = `
        ⚠️ <strong>
            Estoque abaixo do mínimo!
        </strong>
        <br>
        Estoque atual:
        ${estoque}
        | Mínimo:
        ${minimo}
    `;
} else {
    informacaoEstoque.innerHTML = `
        Estoque atual:
        <strong>${estoque}</strong>
        |
        Estoque mínimo:
        <strong>${minimo}</strong>
    `;

}

}

document
.getElementById("producaoForm")
.addEventListener(
"submit",
registrarMovimentacao
);

async function registrarMovimentacao(event) {
event.preventDefault();
const produtoId =
    Number(
        selectProduto.value
    );
const tipoMovimentacao =
    tipo.value;
const quantidadeMovimentada =
    Number(
        quantidade.value
    );
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
    Number(
        option.dataset.estoque
    );

if (
    tipoMovimentacao === "PEDIDO" &&
    quantidadeMovimentada > estoqueAtual
) {
    alert(
        `Estoque insuficiente!
Estoque disponível: ${ estoqueAtual }
Quantidade solicitada: ${ quantidadeMovimentada }`
);
    return;
}

const dados = {
    produto_id: produtoId,
    usuario_id: usuario.id,
    tipo: tipoMovimentacao,
    quantidade:
        quantidadeMovimentada,
    data:
        dataMovimentacao

};

try {
    const resposta =
        await fetch(
            `${API_URL}/producao`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(dados)

            }
        );

    const resultado =
        await resposta.json();
    if (!resposta.ok) {
        alert(
            resultado.mensagem ||
            "Erro ao registrar movimentação."
        );
        return;
    }

    alert(
        tipoMovimentacao === "FABRICADO"
            ? "Produção registrada! O estoque foi aumentado."
            : "Pedido registrado! O estoque foi reduzido."
    );

    if (
        resultado.estoque_atual <
        resultado.estoque_minimo
    ) {
        alert(
            `⚠️ ATENÇÃO!

O estoque do produto está abaixo do mínimo.

Estoque atual:
${ resultado.estoque_atual }

Estoque mínimo:
${ resultado.estoque_minimo } `
);

    }
document.getElementById("producaoForm")
        .reset();
    data.value =
        `${ano}-${mes}-${dia}`;
    carregarProdutos();
    carregarHistorico();

} catch (erro) {
    console.error(erro);
    alert(
        "Erro ao conectar ao servidor."
    );
}

}

async function carregarHistorico() {
try {
    const resposta =
        await fetch(
            `${API_URL}/producao`
        );
    const producoes =
        await resposta.json();
    const tabela =
        document.getElementById(
            "tabelaHistorico"
        );

    tabela.innerHTML = "";
    producoes.forEach(producao => {
        const tr =
            document.createElement("tr");
        const tipoTexto =
            producao.tipo === "FABRICADO"
                ? `<span class="status status-ok">
                    Entrada
                   </span>`
                : `<span class="status status-alerta">
                    Saída
                   </span>`;

        tr.innerHTML = `
            <td>
                ${producao.produto}
            </td>
            <td>
                ${producao.usuario}
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
    console.error(erro);
}

}

function formatarData(data) {

const partes =
    data.split("-");

if (partes.length !== 3) {
    return data;
}

return `${partes[2]}/${partes[1]}/${partes[0]}`;
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