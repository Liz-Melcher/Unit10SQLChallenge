DROP DATABASE IF EXISTS business_db;

CREATE DATABASE business_db; 

\c business_db; 

CREATE TABLE departments (
    dept_id SERIAL PRIMARY KEY,
    dept_name (VARCHAR 100),
);

CREATE TABLE roles (  
    job_title VARCHAR (100),
    role_id SERIAL PRIMARY KEY,
    salary INTEGER, 
    FOREIGN KEY (dept_name)
    REFERENCES departments(dept_name)
    ON DELETE SET NULL

); 

CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR (30),
    last_name VARCHAR (30),
    role_id INTEGER,
    dept_id INTEGER, 
    manager_id INTEGER
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE SET NULL
    FOREIGN KEY (manager_id) REFERENCES employees(employee_id) ON DELETE SET NULL
)

