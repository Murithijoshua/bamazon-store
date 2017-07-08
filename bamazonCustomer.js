
//  Declare global constants and variables
const mysql = require('mysql');
const Table = require('cli-table');
const number = require('accounting')
const inquirer = require('inquirer');
const colors = require('colors');
const env = require('./.env');
var item, qty, updateQTY, total, grandTotal = 0, itemsPurchased = 0;

//create object containing mysql connection values
var connection = mysql.createConnection ({
   host: 'localhost',
   user: 'root',
   port: '3306',
   password: 'T0bydogg',
   database: 'bamazon'
})

//connect to database
connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  };
  console.log('Connected!');
});


//method to display a table of all products
function displayProducts() {
  connection.query('SELECT * FROM products', function (error, response){
        
    let table = new Table ({ 
      head: ['Item ID', 'Product Name', 'Department', 'Price (billions)', 'Quantity']
    });
    for (let i = 0; i < response.length; i++) {
      table.push([response[i].item_id, response[i].product_name, response[i].department_name, '$' + response[i].product_price, response[i].stock_quantity])   
    }
    console.log(table.toString());
   
    selectProduct();    //call method
  })
}

//method to prompt customer to select item for puchase
function selectProduct () {
  inquirer.prompt([
      {
        name: "item",
        type: "input",
        message: "What is the ID of the item you would like to purchase?".yellow,
        validate: function(value) {
          var valid = !isNaN(parseInt(value));
          return valid || 'Please enter the item id ';
        }
      }     
    ])
    .then(function(answer) {
      item = parseInt(answer.item);
      console.log('You chose ' + item);
      let query = ("SELECT item_id, product_name, stock_quantity FROM products WHERE item_id =?");
      connection.query(query, [item], function(err, response) {

		 		if (err) {
         console.log(err);
         selectProduct();
        } 
        else if(response.length < 1) {
          console.log("That is not an item for sale:".green)
          selectProduct();
        }
        else if (response[0].stock_quantity <= 1) {
          console.log ("Sorry, we are currently out of stock on ".green + response[0].product_name .magenta)
          selectProduct();
        }
        else {
          console.log ("We have ".green + response[0].stock_quantity  + " " + response[0].product_name .magenta + "'s ".magenta + "for sale" .green);
           selectQuantity();  //call method
        }      
      })
    })  
}

//method to prompt customer to select quantity for purchase, error check input, 
//output selection to a table, and input selection to an invoice table
function selectQuantity () {
   inquirer.prompt([
      {
        name: "qty",
        type: "input",
        message: "How many would you like to purchase?".yellow,
        validate: function(value) {
          var valid = !isNaN(parseInt(value));
          return valid || 'Please enter the item id ';
        }
      }     
    ])
    .then(function(answer) {
      qty = answer.qty;

      let query = ("SELECT * FROM products WHERE item_id =?");
      connection.query(query, [item], function(err, response) {
        if (err) {
          console.log ("Please input the quantity you would like to purchase".green);
          selectQuantity();
        }
        else if (qty > response[0].stock_quantity) {   
          console.log ("We currently only have ".green + response[0].stock_quantity + " available".green);
          selectQuantity();
        }  
        else {
          itemsPurchased++;
          var price = parseInt(response[0].product_price);
          total = qty * price
          grandTotal = grandTotal + total;
          
          updateQTY = response[0].stock_quantity - qty;

      connection.query(query, [item], function (error, response){

      purchase = new Table ({ 
          head: ['Product Name', 'Price (Billions)', 'Quantity', 'Total']
      });
              
              purchase.push([response[0].product_name, response[0].product_price, qty, '$' + total]);
              
              console.log(purchase.toString());
              updateStock();  //call method
      }); 

         connection.query("INSERT INTO invoice SET ?",
        {
          product_name:   response[0].product_name,
          product_price:  price,
          quantity:       qty,
          total:          total
        },
        function(err) {
          if (err) throw err;
        });
      }
    })
  }) 
}


//method to update stock quanities in products table
function updateStock () {
  
  connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: updateQTY, product_sales: total
      },
      {
        item_id: item
      }
    ],
    function(err, res) { 
      console.log(" inventory reduced to ".blue + updateQTY);
      replay();
    })
  
}

//prompt user to purchase another product or quit
//If quit display invoice table and order grand total and reset invoice table
function replay () {
 inquirer.prompt([
      {
        name: "replay",
        type: "list",
        message: "Would you like to make an additional purchase?".yellow,
        choices: ['Yes', 'No']
        }
          
    ])
    .then(function(answer) {
      if (answer.replay === 'Yes') {
        displayProducts();
      }
      else {
         connection.query('SELECT * FROM invoice', function (error, response){
        
          let receipt = new Table ({ 
          head: ['Product Name', 'Price (Billions)', 'Quantity', 'Total']
     })
    for (let i = 0; i < response.length; i++) {
     receipt.push([response[i].product_name, response[i].product_price, response[i].quantity, '$' + response[i].total]);
    }
    console.log(receipt.toString());
    console.log('Grand Total: '+ number.formatMoney(grandTotal));
    connection.query('DELETE FROM invoice', function (error, response){
        
    })
          connection.end();
               
      })   
    }
  })
}   
    
displayProducts();
