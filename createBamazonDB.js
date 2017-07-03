const mysql = require('mysql');
//const dotenv = require('dotenv');
// const password = process.env.password;
// dotenv.load();


var connection = mysql.createConnection ({
   host: 'localhost',
   user: 'root',
   port: '3306',
   password: 'T0bydogg' 
})

connection.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection as '+ connection.threadID);
});

 connection.query("CREATE DATABASE IF NOT EXISTS bamazon", function (err, result) {
     if (err) throw err;
     console.log("Database created");
   });

    connection.changeUser({
    database : 'bamazon'
  }, function(err) {
    if (err) {
      console.log('error in changing database', err);
      return;
    }
  })

 let createProducts = "create table if not exists products(" +
                    "item_id         INT (3) PRIMARY KEY AUTO_INCREMENT NOT NULL," +
                    "product_name    VARCHAR(30) NOT NULL," +      
                    "department_name    VARCHAR(30) NOT NULL," +
                    "product_price   FLOAT(12,2) NOT NULL,"+
                    "stock_quantity  INT(3) NOT NULL )";
 
  connection.query(createProducts, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });

  var insertProducts = "INSERT INTO products (product_name, department_name, product_price, stock_quantity) VALUES ?";
  var values =
  [
    ['USS Enterprice', 'UFP', 983000, 6],
    ['Battlestar Galactica', 'Twelve Colonies', 1237550, 12],
    ['Star Destroyer', 'Empire', 45257138, 160]
  ];
  connection.query(insertProducts, [values], function (err, result) {
    if (err) throw err;
    console.log("Inserted " + result.affectedRows + " new rows");
  });


connection.end();