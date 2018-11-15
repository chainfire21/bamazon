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
    connection.query("SELECT item_id,product_name,department_name,price,stock_quantity FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
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
                const pass = value.match(/^([1-9][0-9]?)$/);
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
        buyProduct(parseInt(ans.buy), parseInt(ans.amt));
    });
}

function buyProduct(buy, amt) {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        if (buy > res.length) {
            console.log("Please select a valid ID");
            return start();
        }
        else
        connection.query(
            "SELECT * FROM products WHERE ?",
            {
                item_id: buy
            },
            function (err, res) {
                if (err) throw err;
                if (parseInt(res[0].stock_quantity) < amt) {
                    console.log("\nInsufficient quantity!\n");
                    return readProducts();
                }
                updateProduct(res[0].stock_quantity - amt, buy, res[0].price * amt,res[0].price * amt+res[0].product_sales);

            }
        );
    });
}

function end() {
    connection.end(function (err) {
        console.log("BYE");
    });
}

function updateProduct(toSet, whatId, cost, prodSales) {
    connection.query("UPDATE products SET ? WHERE ?", [
        {
            stock_quantity: toSet,
            product_sales: prodSales
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