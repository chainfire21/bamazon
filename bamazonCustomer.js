const inquirer = require("inquirer");
require("dotenv").config();
var mysql = require('mysql');

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
    console.log('connected as id ' + connection.threadId);

    connection.query('SELECT * FROM `products`', (error, results)=> {
        // error will be an Error if one occurred during the query
        if(error) throw error;
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)
        results.forEach((row)=>console.log(row.product_name));
      });



    connection.end(function (err) {
        console.log("BYE");
    
    });
});


function createProduct() {
    console.log("Inserting a new product...\n");
    var query = connection.query(
        "INSERT INTO products SET ?",
        {
            title: "Highway to Hell",
            artist: "AC/DC",
            genre: "metal"
        },
        function (err, res) {
            if(err) throw err;
            console.log(res.affectedRows + " product inserted!\n");
            // Call updateProduct AFTER the INSERT completes
        }
    );
    console.log(query.sql);
}


function updateProduct() {
    console.log("Updating all ???????????...\n");
    var query = connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
          genre: "metal"
        },
        {
          artist: "weezer"
        }
      ],
      function(err, res) {
          if(err) throw err;
        console.log(res.affectedRows + " products updated!\n");
      }
    );
  
    // logs the actual query being run
    console.log(query.sql);
  }
  

function deleteProduct() {
    console.log("Deleting all metal songs...\n");
    connection.query(
        "DELETE FROM products WHERE ?",
        {
            genre: "metal"
        },
        function (err, res) {
            if(err) throw err;
            console.log(res.affectedRows + " songs deleted!\n");
        }
    );
}

function readProducts() {
    console.log("Selecting all products...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.log(res);
        connection.end();
    });
}

