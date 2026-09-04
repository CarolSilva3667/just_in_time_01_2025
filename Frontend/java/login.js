const API_URL = "http://localhost:3000";

const loginForm = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");

loginForm.addEventListener("submit", async function (event) {

event.preventDefault();
const email = document.getElementById("email").value.trim();
const senha = document.getElementById("senha").value;
if (!email || !senha) {
    mostrarMensagem(
        "Preencha o e-mail e a senha.",
        "erro"
    );
    return;
}

try {
    const resposta = await fetch(`${ API_URL }/login`, {
    method: "POST",
        headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: email,
        senha: senha
    })
});

const dados = await resposta.json();
if (!resposta.ok) {
    mostrarMensagem(
        dados.mensagem || "E-mail ou senha inválidos.",
        "erro"
    );
    return;
}

localStorage.setItem(
    "usuario",
    JSON.stringify(dados.usuario)
);
window.location.href = "index.html";
} catch (erro) {
    console.error(erro);
    mostrarMensagem(
        "Não foi possível conectar ao servidor.",
        "erro"
    );
}

});

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}
