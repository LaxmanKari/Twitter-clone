//The require('mongoose') call returns a Singleton Object.
//It means that the first time you call require('mongoose'), it 
//is creating an instance of the Mongoose class and returning it. 
//On subsequent calls, it will return the same instance that was
//created and returned to you the first time because of how module
//import/export works in ES6.

const mongoose = require("mongoose");
mongoose.set('strictQuery', true);

class Database {

  constructor (){
    this.connect(); 
  }



  connect() {
    mongoose
      .connect(
        "mongodb+srv://laxmanKari:dblaxman@twitterclonecluster.lc9unxb.mongodb.net/?retryWrites=true&w=majority"
      )
      .then(() => {
        console.log("database connection successfull");
      })
      .catch(() => {
        console.log("database connection error" + err);
      });
  }
}

module.exports = new Database(); 

