const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
    window.location.href = "login.html";
} else {
    document.getElementById("nomeUsuario").textContent = usuario.nome;
    document.getElementById("nomeUsuarioPrincipal").textContent = usuario.nome;
}

function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}
