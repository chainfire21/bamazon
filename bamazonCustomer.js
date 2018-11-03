const inquirer = require("inquirer");
require("dotenv").config();
const mysql = require('mysql');
const cTable = require('console.table');
let regex;

const connection = mysql.createConnection({
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
    readProducts();
});

function readProducts() {
    connection.query("SELECT item_id,product_name,department_name,price FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        regex = new RegExp(`^([1-9]|${res.length})$`);
        start();
    });
}

function start() {
    inquirer.prompt([
        {
            type: "input",
            name: "buy",
            message: "Input the ID of what you would like to buy",
            validate: function (value) {
                const pass = value.match(regex);
                if (pass) {
                    return true;
                }
                return "Please select a valid ID";
            }
        },
        {
            type: "input",
            name: "amt",
            message: "How many?"
        }
    ]).then((ans) => {
        connection.query(
            "SELECT * FROM products WHERE ?",
            {
                item_id: parseInt(ans.buy)
            },
            function (err, res) {
                if (err) throw err;
                if (parseInt(res[0].stock_quantity) < parseInt(ans.amt)) {
                    console.log("Insufficient quantity!");
                    return readProducts();
                }
                updateProduct(res[0].stock_quantity - parseInt(ans.amt), parseInt(ans.buy), res[0].price * parseInt(ans.amt)+res[0].product_sales);

            }
        );
    });
}

function end() {
    connection.end(function (err) {
        console.log("BYE");
    });
}

function updateProduct(toSet, whatId, cost) {
    connection.query("UPDATE products SET ? WHERE ?",[
            {
                stock_quantity: toSet,
                product_sales: cost
            },
            {
                item_id: whatId
            },
        ],
        function (err, res) {
            if (err) throw err;
            console.log("\n" + cost + " dollars is how much you spent!\n");
            inquirer.prompt([
                {
                    type: "confirm",
                    name: "restart",
                    message: "Buy something else?"
                }
            ]).then(ans => {
                if (ans.restart)
                    return readProducts();
                return end();
            });
        }
    );
}