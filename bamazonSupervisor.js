const inquirer = require("inquirer");
require("dotenv").config();
var mysql = require('mysql');
const cTable = require('console.table');

var connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_DATABSE || "bamazon_db",
});

connection.connect(function (err) {
    if (err) {
        throw ('error connecting: ' + err.stack);
    }
    console.log("");
    start();
});

function start() {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: ["View Product Sales by Department", "Create New Department",]
        },
        {
            type: "input",
            name: "newName",
            message: "Department name?",
            when: function (answers) {
                return answers.choice === "Create New Department";
            }
        },
        {
            type: "input",
            name: "newPrice",
            message: "What was the over head cost?",
            when: function (answers) {
                return answers.choice === "Create New Department";
            }
        },
    ]).then((ans) => {
        switch (ans.choice) {
            case "View Product Sales by Department":
                readProducts();
                break;
            case "Create New Department":
                newDept(ans.newName, ans.newPrice);
                break;
        }
    });
}

function readProducts() {
    connection.query(`SELECT departments.department_name, departments.over_head_costs, SUM(products.product_sales) as product_sales, 
            departments.over_head_costs-SUM(products.product_sales) as total_profit 
            FROM departments 
                INNER JOIN products on departments.department_name = products.department_name
                group by department_name`, 
            function (err, res) {
        if (err) throw err;
        console.log("");
        console.table(res);
        connection.end(err=>{if (err) throw err});
        start();
    });
}

function newDept(name, cost) {
    connection.query(
        "INSERT INTO departments SET ?",{
            department_name: name,
            over_head_costs: cost,
        },
        function (err, res) {
            if(err) throw err;
            console.log("New department made!\n");
            reset();
        }
    );
}

function reset() {
    inquirer.prompt([
        {
            type: "confirm",
            name: "restart",
            message: "Do something else?"
        }
    ]).then(ans => {
        if (ans.restart)
            return start();
        return end();
    });
}

function end() {
    console.log("BYE");
    connection.destory();
}