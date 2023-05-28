const express = require("express");
//initialize the app
const app = express();
const PORT = process.env.PORT || 3003;
const middleware = require('./middleware'); 
const path = require('path'); 
const bodyParser = require('body-parser');  
const mongoose = require('./database'); 
const session = require('express-session');



//instance of our app, takes two parameters port and a callback function
const server = app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
const io = require("socket.io")(server, {pingTimeout: 60000}); 

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
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');
const notificationsRoute = require('./routes/notificationRoutes');

//API routes
const postsApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages'); 
const notificationsApiRoute = require('./routes/api/notifications'); 

app.use("/login", loginRoute); 
app.use("/register", registerRoute); 
app.use("/logout", logoutRoute); 
app.use("/posts", middleware.requireLogin, postRoute); 
app.use("/profile", middleware.requireLogin, profileRoute); 
app.use("/uploads",  uploadRoute); 
app.use("/search",  middleware.requireLogin, searchRoute); 
app.use("/messages",  middleware.requireLogin, messagesRoute); 
app.use("/notification",  middleware.requireLogin, notificationsRoute); 


app.use("/api/posts", postsApiRoute); 
app.use("/api/users", usersApiRoute); 
app.use("/api/chats", chatsApiRoute); 
app.use("/api/messages", messagesApiRoute); 
app.use("/api/notifications", notificationsApiRoute); 

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


io.on("connection", (socket) => {
  
  socket.on("setup", userData => {
      socket.join(userData._id); 
      socket.emit("connected"); 
  })

  socket.on("join room", room => socket.join(room)); 
  socket.on("typing", room => socket.in(room).emit("typing")); 
  socket.on("stop typing", room => socket.in(room).emit("stop typing")); 
  socket.on("notification received", room => socket.in(room).emit("notification received")); 


  socket.on("new message", newMessage => {
      var chat = newMessage.chat; 

      if(!chat.users) return console.log("Chat.users are not defined"); 

      chat.users.forEach(user => {
        if(user._id == newMessage.sender._id) return; 
        socket.in(user._id).emit("message received", newMessage); 
      })
  }); 

})

