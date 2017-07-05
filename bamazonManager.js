const mysql = require('mysql');
const Table = require('cli-table');
const number = require('accounting')
const inquirer = require('inquirer');
const colors = require('colors');
const connect = require('./config');

var connection = mysql.createConnection ({
   host: 'localhost',
   user: 'root',
   port: '3306',
   password: 'T0bydogg',
   database: 'bamazon'
})

connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  };
});

function menu() {
    inquirer.prompt([
    {
        type: "list",
        name: "menu",
        message: "What would you like to do?".yellow,
        choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new products", "quit",]
    }

    ]).then(function(response) {
    
        var command = response.menu;
        
        switch (command) {
            case "View products for sale":
            displayProducts();
            break;

            case "View low inventory": 
            lowStock();
            break;

            case "Add to inventory":
            restock();
            break;

            case "Add new products":
            addNew();
            break;

            default:
            console.log("Goodbye".red);
            connection.end();    
       };
    })
}

function displayProducts() {
  
  connection.query('SELECT * FROM products', function (error, response){
        
    let table = new Table ({ 
      head: ['Item ID', 'Product Name', 'Department', 'Price (billions)', 'Quantity']
    });
    for (let i = 0; i < response.length; i++) {
      table.push([response[i].item_id, response[i].product_name, response[i].department_name, response[i].product_price, response[i].stock_quantity])   
    }
    console.log(table.toString());
     menu();
  })
}

function lowStock () {
    let query = ("SELECT * FROM products WHERE stock_quantity <= 5")
     connection.query(query, function(err, response) {
    if (err) throw err;

    let table = new Table ({ 
      head: ['Item ID', 'Product Name', 'Department', 'Price (billions)', 'Quantity']
    });
    for (let i = 0; i < response.length; i++) {
      table.push([response[i].item_id, response[i].product_name, response[i].department_name, response[i].product_price, response[i].stock_quantity])   
    }
    console.log(table.toString());
    menu();
    })
}

function restock() {
    connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
  
    inquirer.prompt([
        {
          name: "item",
          type: "rawlist",
          choices: function() {
            var itemArray = [];
            for (var i = 0; i < results.length; i++) {
              itemArray.push(results[i].product_name);
            }
            return itemArray;
          },
          message: "Which product to adjust stock level?"
        },
        
        {
          name: "qty",
          type: "input",
          message: "Input new inventory level"
        }
      ])
      .then(function(answer) {
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.item) {
            chosenItem = results[i];
          }  
        }

      
      connection.query( 
        "UPDATE products SET ? WHERE ?",
      [
        {
           stock_quantity: answer.qty
        },
        {
          item_id: chosenItem.item_id
        }
      ],
      function(err, res) { 
        if (err) throw err;
        console.log(chosenItem.product_name .blue + "inventory adjusted to ".blue + answer.qty .red);
        menu(); 
      })  
    })
  })
}    

function addNew () {
inquirer.prompt(
  [
    {
      name: "item",
      type: "input",
      message: "Enter the Item Name"
    },
    {
      name: "department",
      type: "input",
      message: "Enter the department"
    },
    {
      name: "price",
      type: "input",
      message: "Enter the item selling price"
    },
    {
      name: "quantity",
      type: "input",
      message: "Enter the inventory quantity"
    }
  ]) .then(function(answer) {
        console.log(answer.item, answer.department, answer.price, answer.quantity);
         let query = "INSERT INTO products SET ?";
         let values =
         {
           product_name: answer.item,
           department_name: answer.department,
           product_price: answer.price,
           stock_quantity: answer.quantity
         }
         
      connection.query(query, values, function(err, response) {
         console.log(response.affectedRows + " product inserted!\n");
         menu();
      })
    })
}

menu();