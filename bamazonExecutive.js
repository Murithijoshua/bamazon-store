const mysql = require('mysql');
const Table = require('cli-table');
const number = require('accounting')
const inquirer = require('inquirer');
const colors = require('colors');
const env = require('./.env');
var item, qty, updateQTY, grandTotal = 0, itemsPurchased = 0;

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
         Console.log('Goodbye');
          connection.end();
           
       }

  })
}

function viewSales () {

    let query =  "SELECT department.department_id, department.department_name, department.overhead_costs, ";            query +=  "products.product_sales ";
        query +=  "FROM department ";
        query += "LEFT JOIN department ON department.department_name = products.department_name ";
        query += "GROUP BY department.department_name ";
        query += "ORDER BY products.product_sales";  
        console.log (query)
  connection.query(query, function (error, response){
      console.log(response.length);  
    let table = new Table ({ 
      head: ['Department ID', 'Department Name', 'Overhead Costs', 'Product Sales'],  
    });

    for (let i = 0; i < response.length; i++) {
      table.push([response[i].department_id, response[i].department_name, '$' + response[i].overhead_costs, '$' + response[i].product_sales])   
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