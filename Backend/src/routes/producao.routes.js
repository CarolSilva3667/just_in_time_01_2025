const express = require("express");

const router = express.Router();

const {
    listarProducao,
    registrarMovimentacao
} = require("../controller/producao.controller");

router.get("/", listarProducao);
router.post("/", registrarMovimentacao);

module.exports = router;