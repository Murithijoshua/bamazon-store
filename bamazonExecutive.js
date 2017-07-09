const mysql = require('mysql');
const Table = require('cli-table');
const number = require('accounting')
const inquirer = require('inquirer');
const colors = require('colors');


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
  menu();
});

function menu () {

  inquirer.prompt([
    {
      type: 'list',
      name: 'menu',
      message: 'What would you like to do',
      choices: ["View product sales by department", "Create new department", "Quit"]
    }
  ]).then (function (response) {
        command = response.menu
         switch (command) {
          case "View product sales by department":
           viewSales();
           break;

         case "Create new department":
           createDepartment();
           break;
       
         default:
          console.log('Goodbye');
          connection.end();
          break;
      
       }
  })
}

function viewSales () {

    let query =  "SELECT d.department_id, d.department_name, d.overhead_costs, ";
        query +=  "SUM(p.product_sales) AS sales, ";
        query +=  "p.product_sales - d.overhead_costs AS gross_profit ";
        query +=  "FROM department AS d ";
        query +=  "INNER JOIN products AS p ON d.department_name = p.department_name ";
        query +=  "GROUP BY d.department_name ";
        query +=  "ORDER BY p.product_sales DESC";
       
  connection.query(query, function (error, response){
    if(error) throw error;
      console.log(response.length);  
    let table = new Table ({ 
      head: ['Department ID', 'Department Name', 'Product Sales', 'Overhead Costs', 'Gross Profit' ],  
    });

    for (let i = 0; i < response.length; i++) {
      table.push([response[i].department_id, response[i].department_name, '$' + response[i].sales, '$' + response[i].overhead_costs, '$' + response[i].gross_profit])   
    }
    console.log(table.toString());
     menu();
  })
}

function createDepartment () {
   inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Input department name',
    },
    {
      type: 'input',
      name: 'overhead',
      message: 'Input the overhead costs'
    } 
  ]).then (function (answer) {
     let query = "INSERT INTO department SET ?";
         let values =
         {
           department_name: answer.name,
           overhead_costs: answer.overhead
         }
         connection.query(query, values, function(err, response) {
         console.log(response.affectedRows + " new department created!\n");
         menu();  
        })
    })
}