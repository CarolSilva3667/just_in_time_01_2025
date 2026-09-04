const mysql = require("mysql2/promise");

const conection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "preparacao_db"
});
module.exports = conection;