const mysql = require('mysql');
const inquirer = require('inquirer')
require('dotenv').config();

//Creates the connection to the database
const connection = mysql.createConnection({
  host: 'localhost',

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: process.env.DB_USER,

  // Your password
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//Going to take the Users input and apply an action depending on what they select
const taskOperation = (data) => {
  switch (data.databasetask) {
    case 'View all employees':
      connection.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
        res.forEach(({id, first_name, last_name})=> {
          //Placeholder for table
          console.log(`ID: ${id}|| Full Name: ${first_name} ${last_name}`)
        })
      });
      dataBaseQuestion();
      break;
    case 'View all employees by department':

      break;
    case 'View all employees by manager':

      break;
    case 'Add Employee':
      inquirer.prompt([
        {
          name: 'firstName',
          type: 'input',
          message: 'What is the employees first name?'
        },
        {
          name: 'lastName',
          type: 'input',
          message: 'What is the employees last name?'
        },
        //placeholder for role logic and database query
        {
          name: 'roleId',
          type: 'input',
          message: 'What is the employees role ID?'
        },
        //placeholder for manager logic and database query
        {
          name: 'managerId',
          type: 'input',
          message: 'What is the employees managers ID?'
        }
      ])
      .then((data)=>{
        connection.query('INSERT INTO employee SET ?',
        {
          first_name: data.firstName,
          last_name: data.lastName,
          role_id: data.roleId,
          manager_id: data.managerId
        },
        (err, res) => {
          if (err) throw err;
          console.log(`${res.affectedRows} employee inserted!\n`);
          // Call updateProduct AFTER the INSERT completes
          dataBaseQuestion()
      })
    })
      break;
    case 'Update an employees role':

      break;
    case 'Update an employee manager':

      break;
    case 'View departments':
      connection.query('SELECT id, name FROM department', (err, res) => {
        res.forEach(({id, name})=> {
          //Placeholder for table
          console.log(`ID: ${id}|| Name: ${name}`)
        })
      });
      dataBaseQuestion();
      break;
    case 'Add a department':

      break;
    case 'Remove a department':

      break;
    case 'View roles':
      connection.query('SELECT id, name FROM role', (err, res) => {
        res.forEach(({id, title, salary})=> {
          //Placeholder for table
          console.log(`ID: ${id}|| Title: ${title}|| Salary: ${salary}`)
        })
      });
      dataBaseQuestion();
      break;
    case 'Add a role':

      break;
    case 'Remove a role':

      break;
    default:
      connection.end()
      break;
  }
}

//Going to query the user on which action they would like to take in the employee directory application
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
          'View roles',
          'Add a role',
          'Remove a role',
          'Exit Application'
        ]
      },
    ])

    .then((data) => {
      taskOperation(data)
    })
}
// Going to initialize the application
const runDataBase = () => {
  dataBaseQuestion()
}

connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  runDataBase();
});