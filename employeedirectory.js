const mysql = require('mysql');
const inquirer = require('inquirer')
require('dotenv').config();
const cTable = require('console.table');
const figlet = require('figlet');

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
  return connection.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
    if (err) {
      console.log(err)
    }
    else {
      return res
    }
  })
};
let roles;

const selectRoles = () => {
  return connection.query('SELECT id, title, salary FROM role', (err, res) => {
    if (err) {
      console.log(err)
    }
    else {
      roles = res
    }
  })
};

const selectDepartment = () => {
  const choiceArray = [];
  connection.query('SELECT * FROM department', (err, res) => {
    if (err) {
      console.log(err)
    }
    else {
      console.log(res)
      // // for(let i=0;i<res.length;i++){
      // //   choiceArray.push(res.name.toString());
      // // }

      res.forEach(({ name }) => {
        choiceArray.push(name);
      })
      // return res
    }
  })
  return choiceArray
};






//Going to take the Users input and apply an action depending on what they select
const taskOperation = (data) => {
  //
  switch (data.databasetask) {
    //If the user chooses to view all employees the app will list all employees in the database
    case 'View all employees':
      console.clear()
      connection.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
        console.log('Here are the employees in your organization')
        console.table(res)
        dataBaseQuestion();
      });
      break;

    case 'View all employees by department':
      console.clear()
      connection.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
        let query = 'SELECT department.name, role.title, employee.first_name, employee.last_name ';
        query += 'FROM department INNER JOIN role ON (department.id = role.department_id) INNER JOIN employee ON (employee.role_id = role.id)';
        query += 'WHERE department.name = ?'
        inquirer.prompt([
          {
            name: 'department',
            type: 'list',
            choices() {
              const choiceArray = []
              results.forEach(({ name }) => {
                choiceArray.push(name);
              });
              return choiceArray;

            },
            message: 'Which department would you like to view?'
          }
        ])

          .then((results) => {
            console.clear()
            connection.query(query, [results.department], (err, res) => {
              console.log(`Here are the employees in ${results.department}`)
              console.table(res)
              // res.forEach(({ first_name, last_name, role, department }) => {
              //   console.log(`Department: ${department} || Role: ${role} || Full Name: ${first_name} ${last_name}`)
              // })
              dataBaseQuestion();
            })
          }
          )
      })
      break;
    case 'View all employees by manager':

      break;

    case 'Add Employee':
      console.clear()
      connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
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
            name: 'role',
            type: 'list',
            choices() {
              const choiceArray = [];
              results.forEach(({ id, title }) => {
                choiceArray.push(`${id} ${title}`);
              });
              return choiceArray;
            },
            message: 'What is the employees role ID?'
          }
 
        ])
          .then((data) => {
            const roleArr = data.role.split(' ')

            connection.query('INSERT INTO employee SET ?',
              {
                first_name: data.firstName,
                last_name: data.lastName,
                role_id: roleArr[0],
              },
              (err, res) => {
                if (err) throw err;
                console.log(`${res.affectedRows} employee inserted!\n`);
                // Call updateProduct AFTER the INSERT completes
                dataBaseQuestion()
              });
          })
      })
      break;

    case 'Update an employees role':
      console.clear()
      let query = 'SELECT role.title, role.id, employee.id, employee.first_name, employee.last_name, employee.role_id ';
      query += 'FROM role INNER JOIN employee ON (employee.role_id = role.id)';
      connection.query(query, async (err, results) => {
        if (err) throw err;
        //Going to ask the questions regarding the employee to change and the role to update to
        // const roles = await selectRoles()
        await selectRoles()
        console.log(roles)
        inquirer
          .prompt([
            {
              name: 'employee',
              type: 'list',
              choices() {
                //Creates the choice array
                const choiceArray = []
                //pulls the employees from the employee table
                //populates the employee information into the array
                results.forEach(({ id, first_name, last_name }) => {
                  choiceArray.push(`${id} ${first_name} ${last_name}`);
                })

                return choiceArray

              },
              message: 'Which employee would you like to update?'
            },
            {
              name: 'newRole',
              type: 'list',
              choices() {
                //Creates the choice array
                const choiceArray = []
                //pulls the roles from the role table

                //populates the roles into the choice array
                roles.forEach(({ id, title }) => {
                  choiceArray.push(`${id} ${title}`);
                })

                return choiceArray
              },
              message: 'Which role would you like to switch the employee to?'
            },
          ])

          .then((data) => {
            const employeeArr = data.employee.split(' ')
            const roleArr = data.newRole.split(' ')
            //going to update the employee role ID on the employee page
            connection.query('UPDATE employee SET ? WHERE?',

              [
                { role_id: roleArr[0] },
                { id: employeeArr[0] }
              ],
              (error) => {
                if (error) throw err;
                console.log('Employees role updated successfully!');
                dataBaseQuestion();
              }
            );
          });
      })
      break;

    case 'Remove employee'  :
      console.clear()
      connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        inquirer.prompt([
          {
            name: 'employee',
            type: 'list',
            choices() {
              //Creates the choice array
              const choiceArray = []
              //populates the roles into the choice array
              results.forEach(({ id, first_name, last_name }) => {
                choiceArray.push(`${id} ${first_name} ${last_name}`);
              })

              return choiceArray
            },
            message: 'Which role would you like to remove?'
          }
        ])
          .then((data) => {
            const employeeArr = data.employee.split(' ')
            connection.query('DELETE FROM employee WHERE ?',
              {
                id: employeeArr[0]
              },
              (err, res) => {
                if (err) throw err;
                console.log(`${res.affectedRows} employee deleted!\n`);
                // Call dataBaseQuestion AFTER the DELETE completes
                dataBaseQuestion();
              }
            )
          })
      })
      break;
    case 'View departments':
      console.clear()
      connection.query('SELECT id, name FROM department', (err, res) => {
        console.log('Here are the departments for your organization')
        console.table(res)
        dataBaseQuestion();
      });
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
      console.clear()
      connection.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
        inquirer.prompt([
          {
            name: 'department',
            type: 'list',
            choices() {
              //Creates the choice array
              const choiceArray = []
              //pulls the departments from the department table
              results.forEach(({ name }) => {
                choiceArray.push(name);
              });
              return choiceArray;
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
      })
      break;

    case 'View roles':
      console.clear()
      connection.query('SELECT id, title, salary FROM role', (err, res) => {
        console.log('Here are the roles for your organization')
        console.table(res)
        dataBaseQuestion();
      });
      break;

    case 'Add a role':
      console.clear()
      connection.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
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
          name: 'department',
          type: 'list',
          choices(){
            //Creates the choice array
            const choiceArray = []
            //pulls the departments from the department table
            results.forEach(({ id, name }) => {
              choiceArray.push(`${id} ${name}`);
            });
            return choiceArray;
          },
          message: 'What is the roles department?'
        }
      ])
        .then((data) => {
          const departmentArr = data.department.split(' ')
          connection.query('INSERT INTO role SET ?',
            {
              title: data.title,
              salary: data.salary,
              department_id: departmentArr[0],
            },
            (err, res) => {
              if (err) throw err;
              console.log(`${res.affectedRows} role inserted!\n`);
              // Call updateProduct AFTER the INSERT completes
              dataBaseQuestion()
            });
        })
      });
      break;

    case 'Remove a role':
      console.clear()
      connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
        inquirer.prompt([
          {
            name: 'role',
            type: 'list',
            choices() {
              //Creates the choice array
              const choiceArray = []
              //populates the roles into the choice array
              results.forEach(({ title }) => {
                choiceArray.push(title);
              })

              return choiceArray
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
      })
      break;
    default:
      connection.end()
      break;
  }
}

//Going to query the user on which action they would like to take in the employee directory application
const dataBaseQuestion = () => {
  
  // figlet('Employee Tracker', function(err, data) {
  //     if (err) {
  //         console.log('Something went wrong...');
  //         console.dir(err);
  //         return;
  //     }
  //     console.log(data)
  //   });
  // console.clear()
  console.log('Welcome to the Employee Directory')
  inquirer.
  prompt([
    {
      name: 'databasetask',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        'View all employees',
        'View all employees by department',
        'Add Employee',
        'Remove employee',
        'Update an employees role',
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

connection.connect ((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  dataBaseQuestion();
});