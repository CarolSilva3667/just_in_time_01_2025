const express = require("express");

const router = express.Router();

const {
    listarProdutos,
    cadastrarProduto,
    atualizarProduto,
    excluirProduto
} = require("../controller/produto.controller");

router.get("/", listarProdutos);
router.post("/", cadastrarProduto);
router.put("/:id", atualizarProduto);
router.delete("/:id", excluirProduto);

module.exports = router;