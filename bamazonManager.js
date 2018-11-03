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
    readProducts();
});

function start() {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        },
        {
            type: "input",
            name: "addId",
            message: "What is the id of the product?",
            when: function (answers) {
                return answers.choice === "Add to Inventory";
            },
            validate: function (value) {
                const pass = value.match(/^([1-9][0-9]?)$/);
                if (pass) {
                    return true;
                }
                return "Please select a valid ID";
            }
        },
        {
            type: "input",
            name: "addInv",
            message: "How many of the product are you adding?",
            when: function (answers) {
                return answers.choice === "Add to Inventory";
            }
        },
        {
            type: "input",
            name: "newName",
            message: "What is the name of the product?",
            when: function (answers) {
                return answers.choice === "Add New Product";
            }
        },
        {
            type: "input",
            name: "newDept",
            message: "What is the department of the product?",
            when: function (answers) {
                return answers.choice === "Add New Product";
            }
        },
        {
            type: "input",
            name: "newPrice",
            message: "What is the price of the product?",
            when: function (answers) {
                return answers.choice === "Add New Product";
            }
        },
        {
            type: "input",
            name: "newStock",
            message: "How much of the product is in stock?",
            when: function (answers) {
                return answers.choice === "Add New Product";
            }
        },
    ]).then((ans) => {
        switch (ans.choice) {
            case "View Products for Sale":
                readProducts();
                break;
            case "View Low Inventory":
                viewLow();
                break;
            case "Add to Inventory":
                checkAdd(ans.addId);
                connection.query(
                    "SELECT * FROM products WHERE ?",
                    {
                        item_id: parseInt(ans.addId)
                    },
                    function (err, res) {
                        if (err) throw err;
                        updateProduct(res[0].stock_quantity + parseInt(ans.addInv), parseInt(ans.addId));

                    }
                );
                break;
            case "Add New Product":
                createProduct(ans.newName,ans.newDept,parseInt(ans.newPrice),parseInt(ans.newStock));
                break;
        }
    });
}

function checkAdd(num){
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        if(num>res.length){
            console.log("Please select a valid ID");
            return start();
        }
    });
}

function updateProduct(toSet, whatId) {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: toSet
            },
            {
                item_id: whatId
            }
        ],
        function (err, res) {
            if (err) throw err;
            console.log("Added stock!");
            reset();
        }
    );
}

function readProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function viewLow() {
    connection.query(
        "SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
            if (err) throw err;
            console.table(res);
            reset();
        }
    );
}

function createProduct(name, dept, price, stock) {
    connection.query(
        "INSERT INTO products SET ?",{
            product_name: name,
            department_name: dept,
            price: price,
            stock_quantity: stock,
            product_sales: 0,
        },
        function (err, res) {
            if(err) throw err;
            console.log("New product made!\n");
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
    connection.end(function (err) {
        console.log("BYE");
    });
}