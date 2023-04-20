const express = require("express");
const app = express();
const router = express.Router(); 
const bodyParser = require('body-parser'); 
const multer = require('multer'); 
const path = require("path"); 
const fs = require('fs'); 
const upload = multer({dest: "uploads/"}); 
const User = require('../../schemas/UserSchema'); 
const Post = require('../../schemas/PostsSchema'); 


app.use(bodyParser.urlencoded({extended: false}));

//handlers

router.get("/", async(req, res, next) => {
   var searchObj = req.query; 
   console.log("setted searchobj");
   if(req.query.search !== undefined){
     searchObj = {
      //mongodb query to search for items if any of the below matches
        $or : [
          {firstName: { $regex: searchObj.search , $options: "i"}},
          {lastName: { $regex: searchObj.search , $options: "i"}},
          {userName: { $regex: searchObj.search , $options: "i"}}
        ]
     }
   }
   //console.log("setted searchobj"); 
   User.find(searchObj) 
   .then(results => res.status(200).send(results))
   .catch(error => {
      console.log(error); 
      res.sendStatus(400); 
   })
}); 
   



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

router.post("/profilePicture", upload.single("croppedImage"), async(req, res, next) => {
   if(!req.file){
    console.log("No file uploaded with ajax request."); 
    return res.sendStatus(400);
   }
   
   var filePath = `/uploads/images/${req.file.filename}.png`; 
   var tempPath = req.file.path; 
   var targetPath = path.join(__dirname, `../../${filePath}`)

   fs.rename(tempPath, targetPath, async error => {
    
    if(error !=null){
      console.log(error); 
      return res.sendStatus(400); 
    }

    req.session.user = await User.findByIdAndUpdate(req.session.user._id, {profilePic: filePath}, {new:true})//new gives the obj after updated
    res.sendStatus(204); //success but we don't have any data to send 

  })
});

router.post("/coverPhoto", upload.single("croppedImage"), async(req, res, next) => {
  if(!req.file){
   console.log("No file uploaded with ajax request."); 
   return res.sendStatus(400);
  }
  
  var filePath = `/uploads/images/${req.file.filename}.png`; 
  var tempPath = req.file.path; 
  var targetPath = path.join(__dirname, `../../${filePath}`)

  fs.rename(tempPath, targetPath, async error => {
   
   if(error !=null){
     console.log(error); 
     return res.sendStatus(400); 
   }

   req.session.user = await User.findByIdAndUpdate(req.session.user._id, {coverPhoto: filePath}, {new:true})//new gives the obj after updated
   res.sendStatus(204); //success but we don't have any data to send 

 })
});


module.exports = router; 