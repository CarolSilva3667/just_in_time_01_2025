const API_URL = "http://localhost:3000";
const usuario = JSON.parse(
    localStorage.getItem("usuario")
);

if (!usuario) {
window.location.href = "login.html";
}
document.getElementById("nomeUsuario").textContent =
    usuario.nome;

async function carregarProdutos() {
try {
    const resposta = await fetch(
        `${ API_URL }/produtos`
    );
    const produtos = await resposta.json();
    exibirProdutos(produtos);

} catch (erro) {
    console.error(erro);
    alert(
        "Erro ao carregar os produtos."
    );
}

}

function exibirProdutos(produtos) {
const tabela =
    document.getElementById("tabelaProdutos");
tabela.innerHTML = "";
document.getElementById("totalProdutos").textContent =
    `${produtos.length} produto(s) cadastrado(s)`;
produtos.forEach(produto => {
    const tr = document.createElement("tr");
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
        <td>${produto.id}</td>
        <td><strong>${produto.nome}</strong></td>
        <td>${produto.descricao || "-"}</td>

        <td> R$ ${Number(produto.custo).toFixed(2).replace(".", ",")}</td>
        <td>${produto.quantidade_estoque}</td>
        <td>${produto.estoque_minimo}</td>
        <td>${status}</td>
        <td><button class="btn-editar" onclick='editarProduto(${JSON.stringify(produto)})'>Editar</button>
            <button class="btn-excluir" onclick="excluirProduto(${produto.id})">Excluir</button>
        </td>
    `;
    tabela.appendChild(tr);
});
}

document.getElementById("produtoForm").addEventListener("submit", async function(event) {
event.preventDefault();

const id =
    document.getElementById("produtoId").value;

const nome =
    document.getElementById("nome").value.trim();


const descricao =
    document.getElementById("descricao").value.trim();
const custo =
    Number(
        document.getElementById("custo").value
    );

const quantidade =
    Number(
        document.getElementById("quantidade").value
    );

const estoqueMinimo =
    Number(
        document.getElementById("estoqueMinimo").value
    );
if (!nome) {
    alert(
        "Informe o nome do produto."
    );
    return;
}

if (custo < 0 || isNaN(custo)) {
    alert(
        "Informe um custo válido."
    );
    return;
}

if (
    quantidade < 0 ||
    !Number.isInteger(quantidade)
) {
    alert(
        "Informe uma quantidade de estoque válida."
    );
    return;
}

if (
    estoqueMinimo < 0 ||
    !Number.isInteger(estoqueMinimo)
) {
    alert(
        "Informe um estoque mínimo válido."
    );
    return;
}

const produto = {
    nome,
    descricao,
    custo,
    quantidade_estoque: quantidade,
    estoque_minimo: estoqueMinimo

};

try {
    let resposta;
    if (id) {
        resposta = await fetch(
            `${API_URL}/produtos/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(produto)
            }
        );
    } else {
        resposta = await fetch(
            `${API_URL}/produtos`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(produto)
            }
        );

    }

    const dados =
        await resposta.json();
    if (!resposta.ok) {
        alert(
            dados.mensagem ||
            "Erro ao salvar produto."
        );
        return;
    }

    alert(
        id
            ? "Produto atualizado com sucesso!"
            : "Produto cadastrado com sucesso!"
    );

    limparFormulario();
    carregarProdutos();

} catch (erro) {
    console.error(erro);
    alert(
        "Erro ao conectar ao servidor."
    );
}
});

function editarProduto(produto) {
document.getElementById("produtoId").value =
    produto.id;
document.getElementById("nome").value =
    produto.nome;
document.getElementById("descricao").value =
    produto.descricao || "";
document.getElementById("custo").value =
    produto.custo;
document.getElementById("quantidade").value =
    produto.quantidade_estoque;
document.getElementById("estoqueMinimo").value =
    produto.estoque_minimo;
document.getElementById("tituloFormulario").textContent =
    "Editar Produto";
window.scrollTo({
    top: 0,
    behavior: "smooth"
});

}

async function excluirProduto(id) {
const confirmar = confirm(
    "Tem certeza que deseja excluir este produto?"
);

if (!confirmar) {
    return;
}

try {
    const resposta = await fetch(
        `${API_URL}/produtos/${id}`,
        {
            method: "DELETE"
        }
    );

    const dados =
        await resposta.json();
    if (!resposta.ok) {
        alert(
            dados.mensagem ||
            "Não foi possível excluir o produto."
        );
        return;
    }

    alert(
        "Produto excluído com sucesso!"
    );

    carregarProdutos();

} catch (erro) {
    console.error(erro);
    alert(
        "Erro ao conectar ao servidor."
    );

}

}

async function buscarProdutos() {
const termo =
    document
        .getElementById("campoBusca")
        .value
        .trim();

if (!termo) {
    carregarProdutos();
    return;
}

try {
    const resposta = await fetch(
        `${API_URL}/produtos?busca=${encodeURIComponent(termo)}`
    );

    const produtos =
        await resposta.json();

    exibirProdutos(produtos);

} catch (erro) {
    console.error(erro);
    alert(
        "Erro ao realizar a busca."
    );

}

}

function limparFormulario() {
document
    .getElementById("produtoForm")
    .reset();
document.getElementById("produtoId").value =
    "";
document.getElementById("tituloFormulario").textContent =
    "Cadastrar Produto";
}

function logout() {
localStorage.removeItem("usuario");
window.location.href =
    "login.html";
}
carregarProdutos();
