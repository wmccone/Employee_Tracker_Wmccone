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

const selectEmployees = () => {
  connection.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
    if (err) {
      console.log(err)
    }
    else {
      return res
    }
  })
};

const selectRoles = () => {
  connection.query('SELECT id, title, salary FROM role', (err, res) => {
    if (err) {
      console.log(err)
    }
    else {
      return res
    }
  })
};


const selectDepartment = () => {
  connection.query('SELECT id, name FROM department', (err, res) => {
    if (err) {
      console.log(err)
    }
    else {
      return res
    }
  })
};






//Going to take the Users input and apply an action depending on what they select
const taskOperation = (data) => {
  switch (data.databasetask) {
    case 'View all employees':
      connection.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
        res.forEach(({ id, first_name, last_name }) => {
          //Placeholder for table
          console.log(`ID: ${id}|| Full Name: ${first_name} ${last_name}`)
        })
      });
      dataBaseQuestion();
      break;

    case 'View all employees by department':
      let query =
      'SELECT employee.id, employee.first_name, employee.last_name ,role.id ,role.title, department.id, department.name';
      query+=
      'FROM employee INNER JOIN role ON (employee.role_id = role.id) INNER JOIN department ON (role.department_id = department.id)';

      connection.query(query,[results.department],(err,res) => {
        res.forEach(({first_name, last_name, role, department})=> {
          console.log(`Department: ${department} || Role: ${role} || Full Name: ${first_name} ${last_name}`)
        })
        dataBaseQuestion();
      })

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
        .then((data) => {
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
            });
        })
      break;

    case 'Update an employees role':
      //Going to ask the questions regarding the employee to change and the role to update to
      inquirer
        .prompt([
          {
            name: 'employee',
            type: 'rawlist',
            choices() {
              //Creates the choice array
              const choiceArray = []
              //pulls the employees from the employee table
              selectEmployees()
                //populates the employee information into the array
                .then(results.forEach(({ employee }) => {
                  choiceArray.push(employee);
                })
                )
            },
            message: 'Which employee would you like to update?'
          },
          {
            name: 'newRole',
            type: 'rawlist',
            choices() {
              //Creates the choice array
              const choiceArray = []
              //pulls the roles from the role table
              selectRoles()
                //populates the roles into the choice array
                .then(results.forEach(({ role }) => {
                  choiceArray.push(role);
                })
                )
            },
            message: 'Which role would you like to switch the employee to?'
          },
        ])

        .then((results) => {
          //going to update the employee role ID on the employee page
          connection.query('UPDATE employee SET ? WHERE?',
            [
              { role_id: results.newRole.id },
              { id: results.employee.id }
            ],
            (error) => {
              if (error) throw err;
              console.log('Employees role updated successfully!');
              dataBaseQuestion();
            }
          );
        });

      break;

    case 'Update an employee manager':

      break;

    case 'View departments':
      connection.query('SELECT id, name FROM department', (err, res) => {
        res.forEach(({ id, name }) => {
          //Placeholder for table
          console.log(`ID: ${id}|| Name: ${name}`)
        })
      });
      dataBaseQuestion();
      break;
  
    case 'Add a department':
      inquirer.prompt([
        {
          name: 'department',
          type: 'input',
          message: 'What is the departments name?'
        },
      ])
        .then((data) => {
          connection.query('INSERT INTO department SET ?',
            {
              name: data.department,
            },
            (err, res) => {
              if (err) throw err;
              console.log(`${res.affectedRows} department inserted!\n`);
              // Call updateProduct AFTER the INSERT completes
              dataBaseQuestion()
            });
        })
      break;

    case 'Remove a department':
      inquirer.prompt([
        {
          name: 'department',
          type: 'rawlist',
          choices() {
            //Creates the choice array
            const choiceArray = []
            //pulls the departments from the department table
            selectDepartment()
              //populates the departments into the choice array
              .then(results.forEach(({ department }) => {
                choiceArray.push(department);
              })
              )
          },
          message: 'Which department would you like to remove?'
        }
      ])
        .then((results) => {
          connection.query('DELETE FROM department WHERE ?',
            {
              name: results.department
            },
            (err, res) => {
              if (err) throw err;
              console.log(`${res.affectedRows} department deleted!\n`);
              // Call dataBaseQuestion AFTER the DELETE completes
              dataBaseQuestion();
            }
          )
        })
      break;

    case 'View roles':
      connection.query('SELECT id, title, salary FROM role', (err, res) => {
        res.forEach(({ id, title, salary }) => {
          //Placeholder for table
          console.log(`ID: ${id}|| Title: ${title}|| Salary: ${salary}`)
        })
      });
      dataBaseQuestion();
      break;

    case 'Add a role':
      inquirer.prompt([
        {
          name: 'title',
          type: 'input',
          message: 'What is the roles title?'
        },
        {
          name: 'salary',
          type: 'input',
          message: 'What is the roles salary?'
        },
        //placeholder for department logic and database query
        {
          name: 'roleId',
          type: 'input',
          message: 'What is the roles department?'
        }
      ])
        .then((data) => {
          connection.query('INSERT INTO role SET ?',
            {
              title: data.firstName,
              salary: data.lastName,
              role_id: data.roleId,
            },
            (err, res) => {
              if (err) throw err;
              console.log(`${res.affectedRows} role inserted!\n`);
              // Call updateProduct AFTER the INSERT completes
              dataBaseQuestion()
            });
        })
      break;

    case 'Remove a role':
      inquirer.prompt([
        {
          name: 'role',
          type: 'rawlist',
          choices() {
            //Creates the choice array
            const choiceArray = []
            //pulls the roles from the role table
            selectRoles()
              //populates the roles into the choice array
              .then(results.forEach(({ role }) => {
                choiceArray.push(role);
              })
              )
          },
          message: 'Which role would you like to remove?'
        }
      ])
        .then((results) => {
          connection.query('DELETE FROM role WHERE ?',
            {
              title: results.role
            },
            (err, res) => {
              if (err) throw err;
              console.log(`${res.affectedRows} role deleted!\n`);
              // Call dataBaseQuestion AFTER the DELETE completes
              dataBaseQuestion();
            }
          )
        })

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