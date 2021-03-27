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

  // Your username should be pulling from your .env file
  user: process.env.DB_USER,

  // Your password should be pulling from your .env file
  password: process.env.DB_PASSWORD,
  // the database name should already be prepopulated in the .env file if you used the template attached
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

//This is going to create a global roles variable that the select roles function will push to
let roles;

//This function will be used for the update role function to query the databse for role records
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

  // This switch function will give the user 11 functions and 1 default that will exit the application
  switch (data.databasetask) {

    // 1) If the user chooses to view all employees the app will list all employees in the database
    case 'View all employees':
      //clear the console to make the CLI read better
      console.clear()
      //Going to query the ID and name from the employee table
      connection.query('SELECT id, first_name, last_name FROM employee', (err, res) => {
        // This is going to add the data into a table for the user
        console.log('Here are the employees in your organization')
        console.table(res)
        //Return to the main prompt
        dataBaseQuestion();
      });
      break;

    // 2) If the user chooses to view employees by department they will be able to select the department they want to view.
    case 'View all employees by department':
      //clear the console to make the CLI read better
      console.clear()
      // This query will provide department data for the inquirer question below
      connection.query('SELECT * FROM department', (err, results) => {
        if (err) throw err;
        // This is the query that will be called once we have the department selected. It wil pull data from all three tables (Department, Role, and Employee)
        let query = 'SELECT department.name, role.title, employee.first_name, employee.last_name ';
        query += 'FROM department INNER JOIN role ON (department.id = role.department_id) INNER JOIN employee ON (employee.role_id = role.id)';
        query += 'WHERE department.name = ?'
        //Lists all the departments that are avialable in the database
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
          // Once the User selects the department they would like to view, we will pull the query we wrote earlier to populate the data for the user.
          .then((results) => {
            console.clear()
            connection.query(query, [results.department], (err, res) => {
              // Going to push the department data into a table
              console.log(`Here are the employees in ${results.department}`)
              console.table(res)
              //Return to the main prompt
              dataBaseQuestion();
            })
          }
          )
      })
      break;

    // 3) This case will allow the user to add an employee.
    case 'Add Employee':
      console.clear()
      // this query is going to allow us to populate the available roles to the inquirer question below.
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
          {
            name: 'role',
            type: 'list',
            // This is going to populate available roles for the user to select from.
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
            // This array will store the role ID and the role name that the user had selected. We will use the ID later with roleARR[0]
            const roleArr = data.role.split(' ')
            //We are going to insert the new employees name and role ID into the employee table
            connection.query('INSERT INTO employee SET ?',
              {
                first_name: data.firstName,
                last_name: data.lastName,
                role_id: roleArr[0],
              },
              (err, res) => {
                if (err) throw err;
                console.log(`${res.affectedRows} employee inserted!\n`);
                //Return to the main prompt
                dataBaseQuestion()
              });
          })
      })
      break;

    // 4) This case is going to allow the user to update the role for a current employee, we will use the earlier function selectRoles in this function.
    case 'Update an employees role':
      //This is going to clear the console for the user to clean up the console.
      console.clear()
      //This query is going to allow us to select content from both the employee and role tables
      let query = 'SELECT role.title, role.id, employee.id, employee.first_name, employee.last_name, employee.role_id ';
      query += 'FROM role INNER JOIN employee ON (employee.role_id = role.id)';
      connection.query(query, async (err, results) => {
        if (err) throw err;

        //We are going to call the select roles after we have started the previous query to make sure we have all the data available.
        await selectRoles()
        //Going to ask the questions regarding the employee to change and the role to update to
        inquirer
          .prompt([
            {
              name: 'employee',
              type: 'list',
              choices() {
                //Creates the choice array
                const choiceArray = []
                //pulls the employees from the employee table
                results.forEach(({ id, first_name, last_name }) => {
                  choiceArray.push(`${id} ${first_name} ${last_name}`);
                })
                //populates the employee information into the array
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
                roles.forEach(({ id, title }) => {
                  choiceArray.push(`${id} ${title}`);
                })
                //populates the roles into the choice array
                return choiceArray
              },
              message: 'Which role would you like to switch the employee to?'
            },
          ])

          .then((data) => {
            //This is going to allow us to split the employee ID and name into an array we will use the employee ID(employeeARR[0]) later
            const employeeArr = data.employee.split(' ')
            //This is going to allow us to split the role ID and name into an array we will use the role ID(roleARR[0]) later
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
                //Return to the main prompt
                dataBaseQuestion();
              }
            );
          });
      })
      break;

    // 5) This case will allow us to remove employees
    case 'Remove employee':
      console.clear()
      //This will allow us to select all employees from the database
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
            //This is going to allow us to split the employee ID and name into an array we will use the employee ID(employeeARR[0]) later
            const employeeArr = data.employee.split(' ')
            // This is going to use the employee ID to remove the employee from the table
            connection.query('DELETE FROM employee WHERE ?',
              {
                id: employeeArr[0]
              },
              (err, res) => {
                if (err) throw err;
                console.log(`${res.affectedRows} employee deleted!\n`);

                //Return to the main prompt
                dataBaseQuestion();
              }
            )
          })
      })
      break;

    // 6) This case will allow us to view departments in a table
    case 'View departments':
      console.clear()
      connection.query('SELECT id, name FROM department', (err, res) => {
        console.log('Here are the departments for your organization')
        console.table(res)
        dataBaseQuestion();
      });
      break;

    // 7) This case will allow us to add a department to the database.
    case 'Add a department':
      inquirer.prompt([
        {
          name: 'department',
          type: 'input',
          message: 'What is the departments name?'
        },
      ])
        .then((data) => {
          //Going to populate the department name into the table
          connection.query('INSERT INTO department SET ?',
            {
              name: data.department,
            },
            (err, res) => {
              if (err) throw err;
              console.log(`${res.affectedRows} department inserted!\n`);
              //Return to the main prompt
              dataBaseQuestion()
            });
        })
      break;

    // 8) This case will allow us to remove departments
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
            //This is going to remove the selected department from the table
            connection.query('DELETE FROM department WHERE ?',
              {
                name: results.department
              },
              (err, res) => {
                if (err) throw err;
                console.log(`${res.affectedRows} department deleted!\n`);
                //Return to the main prompt
                dataBaseQuestion();
              }
            )
          })
      })
      break;

    // 9) This case will allow us to view roles in a table
    case 'View roles':
      console.clear()
      // This query is going to pull data from the role table and populate it into a table
      connection.query('SELECT id, title, salary FROM role', (err, res) => {
        console.log('Here are the roles for your organization')
        console.table(res)
        dataBaseQuestion();
      });
      break;

    // 10) This case will allow us to add a role to the database.
    case 'Add a role':
      console.clear()
      // This is going to query data from the department table to populate into the question below
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
          {
            name: 'department',
            type: 'list',
            choices() {
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
            //This is going to split the department ID and the name into an array, we will use the ID (departmentArr[0]) below.
            const departmentArr = data.department.split(' ')
            // Inserts the title, salary, and Id into the table
            connection.query('INSERT INTO role SET ?',
              {
                title: data.title,
                salary: data.salary,
                department_id: departmentArr[0],
              },
              (err, res) => {
                if (err) throw err;
                console.log(`${res.affectedRows} role inserted!\n`);
                //Return to the main prompt
                dataBaseQuestion()
              });
          })
      });
      break;

    // 11) This case will allow us to remove roles
    case 'Remove a role':
      console.clear()
      //This will allow us to query the data from role to use in the question below
      connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
        inquirer.prompt([
          {
            name: 'role',
            type: 'list',
            choices() {
              //Creates the choice array
              const choiceArray = []
              results.forEach(({ title }) => {
                choiceArray.push(title);
              })
              //populates the roles into the choice array
              return choiceArray
            },
            message: 'Which role would you like to remove?'
          }
        ])
          .then((results) => {
            //This query will delete the role from the table
            connection.query('DELETE FROM role WHERE ?',
              {
                title: results.role
              },
              (err, res) => {
                if (err) throw err;
                console.log(`${res.affectedRows} role deleted!\n`);
                //Return to the main prompt
                dataBaseQuestion();
              }
            )
          })
      })
      break;

    // 12) Ends the connection if Exit application is selected
    default:
      connection.end()
      break;
  }
}

//Going to query the user on which action they would like to take in the employee directory application
const dataBaseQuestion = () => {

  figlet('Employee Tracker', function(err, data) {
      if (err) {
          console.log('Something went wrong...');
          console.dir(err);
          return;
      }
      console.log(data)
    });
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

connection.connect((err) => {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  dataBaseQuestion();
});