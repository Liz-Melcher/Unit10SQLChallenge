-- Connect to the correct database
\c business_db;

-- Clear existing data before inserting new records
TRUNCATE employees, roles, departments RESTART IDENTITY CASCADE;

-- Insert departments
INSERT INTO departments (name) VALUES
    ('Engineering'),
    ('Human Resources'),
    ('Finance'),
    ('Marketing'),
    ('Sales');

-- Insert roles
INSERT INTO roles (title, salary, department_id) VALUES
    ('Software Engineer', 90000, 1),
    ('HR Manager', 75000, 2),
    ('Accountant', 70000, 3),
    ('Marketing Specialist', 65000, 4),
    ('Sales Representative', 60000, 5),
    ('CTO', 150000, 1),
    ('CFO', 150000, 3);

-- Insert employees
INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES
    ('Alice', 'Johnson', 6, NULL),  -- CTO, no manager
    ('Bob', 'Smith', 7, NULL),  -- CFO, no manager
    ('Charlie', 'Davis', 1, 1), -- Software Engineer under CTO
    ('Diana', 'Lopez', 2, NULL), -- HR Manager, no manager
    ('Edward', 'Brown', 3, 2), -- Accountant under CFO
    ('Fiona', 'Miller', 4, NULL), -- Marketing Specialist, no manager
    ('George', 'Anderson', 5, NULL); -- Sales Rep, no manager
