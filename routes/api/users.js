const express = require("express");
const app = express();
const router = express.Router(); 
const bodyParser = require('body-parser'); 
const User = require('../../schemas/UserSchema'); 
const Post = require('../../schemas/PostsSchema'); 


app.use(bodyParser.urlencoded({extended: false}));

//handlers

router.put("/:userId/follow", async(req, res, next) => {
   console.log("user: ", req.params.userId); 
   
   var userId = req.params.userId; 

   var user = await User.findById(userId);

   if(user == null){
      res.sendStatus(404); 
   } 

   var isFollowing = user.followers && user.followers.includes(req.session.user._id); 
   var option = isFollowing ? "$pull" : "$addToSet"; 

   req.session.user = await User.findByIdAndUpdate(req.session.user._id, {[option]: {following: userId}}, {new :true}) 
   // {new: true} gives new updated object (record)
   //[option] we need to include brackets[], if we want to have variables in a mongoose query
   .catch(error =>{
     console.log(error); 
     res.sendStatus(400); 
   })

   //update followers list 
   User.findByIdAndUpdate(userId, {[option]: {followers: req.session.user._id}}) 
   .catch(error =>{
     console.log(error); 
     res.sendStatus(400); 
   })

   res.status(200).send(req.session.user); 

});

router.get("/:userId/following", async(req, res, next) => {
    User.findById(req.params.userId)
    .populate("following")
    .then(results => {
       res.status(200).send(results);
    })
    .catch(error => {
      console.log(error); 
      res.sendStatus(400); 
    })

});

router.get("/:userId/followers", async(req, res, next) => {
  User.findById(req.params.userId)
  .populate("followers")
  .then(results => {
     res.status(200).send(results);
  })
  .catch(error => {
    console.log(error); 
    res.sendStatus(400); 
  })

});


module.exports = router; 