DROP DATABASE IF EXISTS preparacao_db;

CREATE DATABASE preparacao_db;

USE preparacao_db;

CREATE TABLE usuario (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,

    PRIMARY KEY (id)
);

CREATE TABLE produto (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    custo DECIMAL(10,2) NOT NULL,
    quantidade_estoque INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 0,

    PRIMARY KEY (id)
);

CREATE TABLE producao (
    id INT NOT NULL AUTO_INCREMENT,
    produto_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    quantidade INT NOT NULL,
    data DATE NOT NULL,

    PRIMARY KEY (id),

    FOREIGN KEY (produto_id)
        REFERENCES produto(id),

    FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
);

INSERT INTO usuario (nome, email, senha) VALUES
('Administrador', 'admin@gmail.com', '123456'),
('João Silva', 'joao@gmail.com', '123456'),
('Maria Santos', 'maria@gmail.com', '123456');

INSERT INTO produto
(nome, descricao, custo, quantidade_estoque, estoque_minimo)
VALUES
(
    'Caixa Organizadora MDF',
    'Caixa organizadora produzida em MDF.',
    25.90,
    15,
    5
),
(
    'Porta-Retrato MDF',
    'Porta-retrato decorativo produzido em MDF.',
    18.50,
    10,
    4
),
(
    'Suporte para Celular MDF',
    'Suporte de mesa para celular produzido em MDF.',
    12.90,
    20,
    6
);

INSERT INTO producao
(produto_id, usuario_id, tipo, quantidade, data)
VALUES
(1, 1, 'FABRICADO', 10, '2026-09-01'),
(2, 2, 'PEDIDO', 3, '2026-09-01'),
(3, 3, 'FABRICADO', 8, '2026-09-02');

-- Teste
SELECT * FROM usuario;

SELECT * FROM produto;

SELECT * FROM producao;

SELECT
    producao.id,
    produto.nome AS produto,
    usuario.nome AS usuario,
    producao.tipo,
    producao.quantidade,
    producao.data
FROM producao
INNER JOIN produto
    ON producao.produto_id = produto.id
INNER JOIN usuario
    ON producao.usuario_id = usuario.id;