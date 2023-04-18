const express = require("express");
//initialize the app
const app = express();
const port = 3003;
const middleware = require('./middleware'); 
const path = require('path'); 
const bodyParser = require('body-parser');  
const mongoose = require('./database'); 
const session = require('express-session'); 

//instance of our app, takes two parameters port and a callback function
const server = app.listen(port, () => {
  console.log("Server listening on port " + port);
});

//template engine
app.set("view engine", "pug");
app.set("views", "views");

//body-paser 
app.use(bodyParser.urlencoded({extended: false}));

//static files 
app.use(express.static(path.join(__dirname, "public"))); 

app.use(session({
  secret: "bbq chips",
  resave: true,
  saveUninitialized: false
}))

// Routes
const loginRoute = require('./routes/loginRoutes'); 
const registerRoute = require('./routes/registerRoutes'); 
const logoutRoute = require('./routes/logoutRoute');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');

//API routes
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');

app.use("/login", loginRoute); 
app.use("/register", registerRoute); 
app.use("/logout", logoutRoute); 
app.use("/posts", middleware.requireLogin, postRoute); 
app.use("/profile", middleware.requireLogin, profileRoute); 

app.use("/api/posts", postsApiRoute); 
app.use("/api/users", usersApiRoute); 

app.get("/", middleware.requireLogin, (req, res, next) => {
  var payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
    //the above line is included to make this req.session.user value to the pug template
    // as the first two are not available in a page, these are only available when the page first render's
  };

  res.status(200).render("home", payload);
});
