const mysql = require('mysql');
const inquirer = require('inquirer')
require('dotenv').config();


const connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3306
    port: 3001,
  
    // Your username
    user: process.env.DB_USER,
  
    // Your password
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });


  connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    runDataBase();
  });