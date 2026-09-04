const conection = require("../data/conection");

async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                mensagem: "Informe o e-mail e a senha."
            });
        }

        const [usuarios] = await conection.query(
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
}

function me(req, res) {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensagem: "Usuário não autenticado."
        });
    }

    res.json({
        usuario: req.session.usuario
    });
}

function logout(req, res) {
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
}

module.exports = {
    login,
    me,
    logout
};