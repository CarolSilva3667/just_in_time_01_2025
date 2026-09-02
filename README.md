# Sistema Just in Time — Gestão da Produção

Sistema Web Full Stack desenvolvido para o gerenciamento da produção e do estoque de uma fábrica de produtos em MDF, utilizando o conceito de **Just in Time**, com o objetivo de produzir conforme a demanda e manter o estoque dentro de níveis adequados.

## Sobre o projeto

O sistema foi desenvolvido como parte da avaliação de desenvolvimento de sistemas, tendo como objetivo informatizar o processo de controle de pedidos, produção e estoque de uma fabricante de produtos em MDF.

A aplicação permite o gerenciamento de produtos, autenticação de usuários e registro das movimentações de estoque, diferenciando produtos **fabricados**, que representam entradas no estoque, de **pedidos**, que representam saídas.

O sistema também deverá realizar a verificação do estoque mínimo configurado para cada produto, permitindo identificar quando determinado produto está abaixo do nível mínimo.

# Objetivo
Desenvolver um sistema Web Full Stack capaz de:

* Realizar autenticação de usuários;
* Cadastrar produtos;
* Listar produtos cadastrados;
* Pesquisar produtos;
* Editar produtos;
* Excluir produtos;
* Controlar a quantidade disponível em estoque;
* Definir estoque mínimo para cada produto;
* Registrar produtos fabricados;
* Registrar pedidos realizados;
* Atualizar automaticamente o estoque;
* Registrar a data das movimentações;
* Identificar o usuário responsável por cada movimentação;
* Alertar quando o estoque estiver abaixo do mínimo configurado.

# Tecnologias utilizadas

## Frontend
* HTML
* CSS
* JavaScript
* API
* LocalStorage

## Backend
* Node.js
* Express
* CORS
* Dotenv
* Express-session

## Banco de dados
* MySQL
* XAMPP
* phpMyAdmin

# Autenticação

A aplicação possui uma interface de login que solicita:

* E-mail;
* Senha.

Após uma autenticação válida, o usuário é direcionado para a interface principal.

O usuário autenticado é armazenado no `localStorage` para que as demais páginas possam identificar o usuário conectado.

Em caso de falha na autenticação, uma mensagem de erro deverá ser apresentada ao usuário.

# Como executar o projeto

## 1. Banco de dados
Abra o XAMPP e inicie, depois acesse o phpMyAdmin e execute o arquivo:
```text
banco/preparacao_db.sql
```

O banco:
```text
preparacao_db
```
será criado automaticamente.

---

## 2. Backend
Após a implementação do backend, será necessário acessar a pasta:

```text
backend/
```
Instalar as dependências:
```bash
npm install
```
E iniciar o servidor:
```bash
node server.js
```
O servidor será executado localmente, inicialmente, em:
```text
http://localhost:3000
```
---
## 3. Frontend
Com o backend em execução, abra a interface:
```text
frontend/login.html
```
A partir dela, o usuário poderá realizar o login e acessar as demais funcionalidades.
---

# 👤 Usuário para teste
O banco possui usuários cadastrados para testes.
Exemplo:
```text
E-mail: admin@gmail.com
Senha: 123456
```

# Autora
Caroline Vitória - SESI/SENAI 3º Ano B - Ensino Médio
