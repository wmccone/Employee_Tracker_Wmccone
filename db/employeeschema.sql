DROP DATABASE IF EXISTS office_employeesDB;
CREATE database office_employeesDB;

USE office_employeesDB;

CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NULL,
  PRIMARY KEY (id)
);


INSERT INTO department (name)
VALUES("Sales");

INSERT INTO department (name)
VALUES("Engineering");

INSERT INTO department (name)
VALUES("Customer Service");

CREATE TABLE role (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(50) NULL,
    salary decimal(10,2) NULL,
    department_id INT,
    INDEX par_ind (department_id),
    CONSTRAINT fk_department FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    PRIMARY KEY (id)
);

INSERT INTO role (title, salary, department_id)
VALUES("Account Executive", 100000.00, 1);

INSERT INTO role (title, salary, department_id)
VALUES("Senior Engineer", 120000.00, 2);

INSERT INTO role (title, salary, department_id)
VALUES("Customer Success Representative", 45000.00, 3);

CREATE TABLE employee (
    id INT NOT NULL AUTO_INCREMENT,
	first_name VARCHAR(30) NULL,
    last_name VARCHAR(30) NULL,
    role_id INT,
    manager_id INT NULL,
	INDEX par_ind (role_id),
    CONSTRAINT fk_role FOREIGN KEY (role_id)
    REFERENCES role(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    PRIMARY KEY (id)
);

INSERT INTO employee (first_name, last_name, role_id)
VALUES("William", "Riker", 1);

INSERT INTO employee (first_name, last_name, role_id)
VALUES("Geordi", "La Forge", 2);

INSERT INTO employee (first_name, last_name, role_id)
VALUES("Deanna", "Troi", 3);
