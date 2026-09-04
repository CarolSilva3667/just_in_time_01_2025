const express = require("express");

const router = express.Router();

const {
    login,
    me,
    logout
} = require("../controller/login.controller");

router.post("/login", login);
router.get("/me", me);
router.post("/logout", logout);

module.exports = router;