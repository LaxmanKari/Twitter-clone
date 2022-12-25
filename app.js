const express = require('express'); 
//initialize the app 
const app = express();
const port = 3003; 

//instance of our app, takes two parameters port and a callback function
const server = app.listen(port, () => {
    console.log("Server listening on port " + port);
})

//template engine
app.set("view engine", "pug");
app.set("views", "views");

app.get("/", (req,res,next) => {

    var payload = {
        pageTitle: "Home"
    }


    res.status(200).render("home", payload); 
})