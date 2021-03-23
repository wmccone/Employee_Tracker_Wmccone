const mysql = require('mysql');
const inquirer = require('inquirer')
require('dotenv').config();


const connection = mysql.createConnection({
    host: 'localhost',
  
    // Your port; if not 3301
    port: 3001,
  
    // Your username
    user: process.env.DB_USER,
  
    // Your password
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const dataBaseQuestion = () => {

    inquirer.
    prompt([
      {
        name: 'databasetask',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View all employees',
          'View all employees by department',
          'View all employees by manager',
          'Add Employee',
          'Remove employee',
          'Update an employees role',
          'Update an employee manager',
          'View departments',
          'Add a department',
          'Remove a department',
          'View Roles',
          'Add a role',
          'Remove a role',
          'Exit Application'
        ]
      },
    ])
  }

  const runDataBase = () => {

  }

  connection.connect((err) => {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    runDataBase();
  });