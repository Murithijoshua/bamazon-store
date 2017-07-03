const mysql = require('mysql');
const Table = require('cli-table');
const jquery = require('jquery');
const number = require('accounting')
const term = require('terminal-kit').terminal;
const inquirer = require('inquirer');

number.settings = {
	currency: {
		precision : 2   // decimal places
	}
}

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
  console.log('Connected!');
});

function displayProducts() {
  
  connection.query('SELECT * FROM products', function (error, response){
        
    var table = new Table ({ 
      head: ['Item ID', 'Product Name', 'Department', 'Price (billions)', 'Quantity']
    });
    for (var i = 0; i < response.length; i++) {
      table.push([response[i].item_id, response[i].product_name, response[i].department_name, response[i].product_price, response[i].stock_quantity])   
    }
    console.log(table.toString());
   
    selectItem();
  })
}

function selectItem () {
  var pickItem = [
      {
          name: "item",
          type: "input",
          message: "Which item would you like to purchase?",
          validate: function(value) {
          var valid = !isNaN(parseInt(value));
          return valid || 'Please enter the item id ';
        }
      }];
    
    var pickQty = [
      {
          name: "qty",
          type: "input",
          message: "How many would you like to purchase?",
          validate: function(value) {
          var valid = !isNaN(parseInt(value));
          return valid || 'Please enter the item id ';
        }
      }
  ];  
    inquirer.prompt(pickItem, function processPickItem (pickItem) {
      var item = parseInt(answer.item);
      var query = ("SELECT item_id, product_name, stock_quantity FROM products WHERE item_id =?");
      connection.query(query, [answer.item], function(err, response) {
        if (err) {
         console.log(err);
         inputPrompt();
        } 
        else if(response.length < 1) {
          console.log("That is not an item for sale or there are no quantities available ")
          inputPrompt();
        }
        else if (response[0].stock_quantity <= 0){
            console.log("unforunately, we are out of stock at the moment")
            inputPrompt();
        }
        else {
          console.log ("We have  "+ response[0].stock_quantity + " " + response[0].product_name + " available");
           connection.end();
        }
      })
    })
}

function replay () {
  connection.query("SELECT * FROM products WHERE item_id = '4'", function (err, result) {
    if (err) throw err;
    console.log(result);
  });
}

displayProducts();
//replay();

