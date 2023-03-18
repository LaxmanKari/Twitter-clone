const express = require("express");
const app = express();
const router = express.Router(); 
const bodyParser = require('body-parser'); 
const User = require('../../schemas/UserSchema'); 
const Post = require('../../schemas/PostsSchema'); 


app.use(bodyParser.urlencoded({extended: false}));

//handlers

router.get("/", (req, res, next) => {
   
   
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

module.exports = router; 