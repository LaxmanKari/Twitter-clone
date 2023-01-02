const express = require("express");
const app = express();
const router = express.Router(); 
const bodyParser = require('body-parser'); 
const User = require('../schemas/UserSchema'); 


app.set("view engine", "pug");
app.set("views", "views");

//body-parser
app.use(bodyParser.urlencoded({extended: false}));

router.get("/", (req, res, next) => {
   res.status(200).render("register");
});

router.post("/", async (req, res, next) => {
     
    var firstName = req.body.firstName.trim(); 
    var lastName = req.body.lastName.trim();
    var userName = req.body.userName.trim();
    var email = req.body.email.trim();
    var password = req.body.password;

    var payload = req.body; 
    
    if(firstName && lastName && userName && email && password){
        var user = await User.findOne({
            $or: [
                {userName: userName},
                {email: email}
            ]
         })
         console.log(user);

         console.log("Hello"); 
    }
    else{
        payload.errorMessage = "Make sure each field has a valid value."
        res.status(200).render("register", payload);
    }
    console.log(req.body); 
    res.status(200).render("register");
 });
 


module.exports = router; 