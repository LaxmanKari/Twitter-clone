const express = require("express");
const app = express();
const router = express.Router(); 
const bodyParser = require('body-parser'); 
const User = require('../../schemas/UserSchema'); 
const Post = require('../../schemas/PostsSchema'); 


app.use(bodyParser.urlencoded({extended: false}));

//handlers

router.get("/", (req, res, next) => {
   Post.find() 
   .populate("postedBy")
   .sort({"createdAt": -1})
   // if we have only one argument and only one line of excecution we can remove () & {} 
   .then( results => res.status(200).send(results)) 
   .catch(error => {
     console.log(error); 
     res.sendStatus(400); 
   })
   return; 
});

router.post("/", async(req, res, next) => {

    if(!req.body.content){
      console.log("content param not sent with request"); 
      res.sendStatus(400); 
      return; 
    }
    
    var postData = {
      content: req.body.content,
      postedBy: req.session.user
    }
    Post.create(postData)
    .then(async (newPost) =>{
       newPost = await User.populate(newPost, {path: "postedBy"})
        
       res.status(201).send(newPost);
    })
    .catch((error) =>{
       console.log(error); 
       res.sendStatus(400); 
    })

     

    
});

router.post("/", async(req, res, next) => {

  
});

router.put("/:id/like", async(req, res, next) => {
    
  var postId = req.params.id; 
  var userId = req.session.user._id; 
  
  
  var isLiked = req.session.user.likes && req.session.user.likes.includes(postId); 
  
  var option = isLiked ? "$pull" : "$addToSet"; 

  
  //insert user like
  req.session.user = await User.findByIdAndUpdate(userId, {[option]: {likes: postId}}, {new :true}) 
  // {new: true} gives new updated object (record)
  //[option] we need to include brackets[], if we want to have variables in a mongoose query
  .catch(error =>{
    console.log(error); 
    res.sendStatus(400); 
  })

  //insert post like
  var post = await Post.findByIdAndUpdate(postId, {[option]: {likes: userId}}, {new :true})
  .catch(error =>{
    console.log(error); 
    res.sendStatus(400); 
  })
  

  res.status(200).send(post); 
  
});

module.exports = router; 