import express from 'express';
//import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import inquirer from 'inquirer';
const PORT = process.env.PORT || 3001;
const app = express();
// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
async function init() {
    try {
        await connectToDb(); // Ensure DB connection before running anything
        console.log("Database connected successfully.");
        // Start Express server (if needed)
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
    catch (err) {
        console.error("Error connecting to database:", err);
    }
}
async function startCLI() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'How would you like to start?',
            choices: [
                'View all departments',
                'View all roles',
                'View all employees',
                'Add a department',
                'Add a role',
                'Add an employee',
                'Update an employee role',
                'Exit'
            ]
        }
    ]);
    switch (action) {
        case 'View all departments':
            await viewDepartments();
            break;
        case 'View all roles':
            await viewRoles();
            break;
        case 'View all employees':
            await viewEmployees();
            break;
        case 'Add a department':
            await addDepartment();
            break;
        case 'Add a role':
            await addRole();
            break;
        case 'Add an employee':
            await addEmployee();
            break;
        case 'Update an employee role':
            await updateEmployeeRole();
            break;
        case 'Exit':
            console.log("Exiting program...");
            process.exit();
    }
    startCLI();
}
//viewDepartments 
async function viewDepartments() {
    try {
        const result = await pool.query("SELECT * FROM departments;");
        console.table(result.rows);
    }
    catch (err) {
        console.error("Error fetching department:", err);
    }
}
//viewRoles
async function viewRoles() {
    try {
        const result = await pool.query(`
            SELECT roles.id, roles.title, roles.salary, departments.name AS department
            FROM roles
            JOIN departments ON roles.department_id = departments.id;
        `);
        console.table(result.rows);
    }
    catch (err) {
        console.error("Error fetching roles:", err);
    }
}
//viewEmployees
async function viewEmployees() {
    try {
        const result = await pool.query(`
            SELECT employees.id, employees.first_name, employees.last_name, 
                   roles.title AS job_title, departments.name AS department, 
                   roles.salary, 
                   COALESCE(manager.first_name || ' ' || manager.last_name, 'None') AS manager
            FROM employees
            JOIN roles ON employees.role_id = roles.id
            JOIN departments ON roles.department_id = departments.id
            LEFT JOIN employees AS manager ON employees.manager_id = manager.id;
        `);
        console.table(result.rows);
    }
    catch (err) {
        console.error("Error fetching employees:", err);
    }
}
//addDepartment
async function addDepartment() {
    const { name } = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the name of the department:'
        }
    ]);
    try {
        await pool.query("Insert into departments (name) VALUES ($1)", [name]);
        console.log(`Department "${name} added successfully.`);
    }
    catch (err) {
        console.error("Error adding department:", err);
    }
}
//addRole
async function addRole() {
    const departments = await pool.query("SELECT * FROM departments");
    const departmentChoices = departments.rows.map(dep => ({
        name: dep.name,
        value: dep.id
    }));
    const { title, salary, department_id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the name of the role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for this role:'
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Select the department for this role:',
            choices: departmentChoices
        }
    ]);
    try {
        await pool.query("INSERT INTO roles (title, salary, department_id) VALUES ($1, $2, $3)", [title, salary, department_id]);
        console.log(`Role "${title}" added successfully`);
    }
    catch (err) {
        console.error("Error adding role:", err);
    }
}
//addEmployee
async function addEmployee() {
    const roles = await pool.query("SELECT * FROM roles;");
    const employees = await pool.query("SELECT * FROM employees;");
    const roleChoices = roles.rows.map(role => ({
        name: role.title,
        value: role.id
    }));
    const managerChoices = employees.rows.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
    }));
    managerChoices.unshift({ name: 'None', value: null });
    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter the first name of the employee:'
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter the last name of the employee:'
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'Select the employee\'s role:',
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'manager_id',
            message: 'Select the employee\'s manager:',
            choices: managerChoices
        }
    ]);
    try {
        await pool.query("INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)", [first_name, last_name, role_id, manager_id]);
        console.log(`Employee "${first_name} ${last_name}" added successfully.`);
    }
    catch (err) {
        console.error("Error adding employee:", err);
    }
}
//updateEmployeeRole
async function updateEmployeeRole() {
    const employees = await pool.query("SELECT * FROM employees;");
    const roles = await pool.query("SELECT * FROM roles;");
    const employeeChoices = employees.rows.map(emp => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id
    }));
    const roleChoices = roles.rows.map(role => ({
        name: role.title,
        value: role.id
    }));
    const { employee_id, new_role_id } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee whose role you want to update:',
            choices: employeeChoices
        },
        {
            type: 'list',
            name: 'new_role_id',
            message: 'Select the new role:',
            choices: roleChoices
        }
    ]);
    try {
        await pool.query("UPDATE employees SET role_id = $1 WHERE id = $2", [new_role_id, employee_id]);
        console.log("Employee role updated successfully.");
    }
    catch (err) {
        console.error("Error updating employee role:", err);
    }
}
init();
startCLI();
