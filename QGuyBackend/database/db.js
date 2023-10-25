// db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "testerSQL10",
  database: "dripQ_0",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// To check the connection, you can get a single connection from the pool and then release it
pool
  .getConnection()
  .then((connection) => {
    console.log("Connected to MySQL database");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to MySQL:", err);
  });

module.exports = pool;
