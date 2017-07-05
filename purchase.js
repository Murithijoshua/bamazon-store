 const mysql = require('mysql');

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
  }
  console.log('Connection as '+ connection.threadID);
});
 
 let invoice = "CREATE TABLE invoice (" +  
                    "product_name    VARCHAR(30) NOT NULL," +      
                    "product_price   FLOAT(12,2) NOT NULL,"+
                    "quantity             INT (3) NOT NULL," +
                    "total           INT(12) NOT NULL )";
 
          connection.query(invoice, function(err, results, fields) {
            if (err) {
            console.log(err.message);
           }  
          })

connection.end();
        //   connection.query("INSERT INTO invoice SET ?",
        // {
        //   item_name:      item,
        //   product_price:  price,
        //   quantity:       qty,
        //   total:          total
        // },
        // function(err) {
        //   if (err) throw err;
        // });