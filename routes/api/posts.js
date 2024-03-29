const express = require("express");
const app = express();
const router = express.Router(); 
const bodyParser = require('body-parser'); 
const User = require('../../schemas/UserSchema'); 
const Post = require('../../schemas/PostsSchema'); 
const Notification = require('../../schemas/NotificationSchema'); 

app.use(bodyParser.urlencoded({extended: false}));

//handlers

router.get("/", async(req, res, next) => {

  var searchObj = req.query; 

  if(searchObj.isReply !== undefined){
    var isReply = searchObj.isReply == 'true'; 
    searchObj.replyTo = { $exists: isReply}; 
    delete searchObj.isReply; //delete object 
  }

  //for searching feature 
  if(searchObj.search !== undefined){
    searchObj.content = { $regex: searchObj.search , $options: "i"} //$options: "i" (not case sensitive)
    delete searchObj.search;
  }

  if(searchObj.followingOnly !== undefined){
    var followingOnly = searchObj.followingOnly == 'true';

    if(followingOnly){
      var objectIds = [] ; 
      
      if(!req.session.following){
        req.session.following = [];
      }
      req.session.user.following.forEach(user =>{
          objectIds.push(user);
      })

      objectIds.push(req.session.user._id); //add our own posts on the feed also 
  
      searchObj.postedBy = { $in: objectIds}; //find all the posts where postedBy is anyways in this objectIds array 
    }
    
    delete searchObj.followingOnly; //delete object

  }

  var results = await getPosts(searchObj); 
  
  res.status(200).send(results);
});

//:id is the placeholder 
router.get("/:id", async(req, res, next) => {

  var postId = req.params.id; 

  var postData = await getPosts({_id: postId}); 
  postData = postData[0];

  var results = {
    postData: postData
  }

  if(postData.replyTo !== undefined){
    results.replyTo = postData.replyTo; 
  }

  results.replies = await getPosts({replyTo: postId}); 
  
  res.status(200).send(results);
  
  
});

router.post("/", async(req, res, next) => {

    if(!req.body.content){
      console.log("content param not sent with request"); 
      res.sendStatus(400); 
      return; 
    }
    
    var postData = {
      content: req.body.content,
      postedBy: req.session.user,
      pinned: false
    }
    
    if(req.body.replyTo){
      postData.replyTo = req.body.replyTo;
    }

    Post.create(postData)
    .then(async (newPost) =>{
       newPost = await User.populate(newPost, {path: "postedBy"})
       newPost = await Post.populate(newPost, {path: "replyTo"})
      
      //Notification 
      if(newPost.replyTo !== undefined){
          await Notification.insertNotification(newPost.replyTo.postedBy, req.session.user._id, "reply", newPost._id); 
      }
        
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

  //Notification 
  if(!isLiked){
    await Notification.insertNotification(post.postedBy, userId, "postLike", post._id); 
  }
  

  res.status(200).send(post); 
  
});


router.post("/:id/retweet", async(req, res, next) => {

  var postId = req.params.id; 
  var userId = req.session.user._id; 
  
  
  //Try and delete retweet 
  var deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId})
  .catch(error =>{
    console.log(error); 
    res.sendStatus(400); 
  })


  var option = deletedPost !=null ? "$pull" : "$addToSet"; 

  var repost = deletedPost; 

  if(repost == null){
    repost = await Post.create({ postedBy: userId, retweetData: postId})
    .catch(error =>{
      console.log(error); 
      res.sendStatus(400); 
    })
  }

  
  //insert user like
  req.session.user = await User.findByIdAndUpdate(userId, {[option]: {retweets: repost._id}}, {new :true}) 
  // {new: true} gives new updated object (record)
  //[option] we need to include brackets[], if we want to have variables in a mongoose query
  .catch(error =>{
    console.log(error); 
    res.sendStatus(400); 
  })

  //insert post like
  var post = await Post.findByIdAndUpdate(postId, {[option]: {retweetUsers: userId}}, {new :true})
  .catch(error =>{
    console.log(error); 
    res.sendStatus(400); 
  })

  //Notification 
  
  if(!deletedPost){
    await Notification.insertNotification(post.postedBy, userId, "retweet", post._id); 
  }
  

  res.status(200).send(post); 
  
});

router.delete("/:id", (req,res,next) => {
  Post.findByIdAndDelete(req.params.id)
  .then(() => { res.sendStatus(202)})
  .catch((error) => {
    console.log("while deleting : ",error); 
    res.sendStatus(400); 
  })
})

router.put("/:id", async (req,res,next) => {

  if(req.body.pinned !== undefined){
     await Post.updateMany({postedBy: req.session.user}, {pinned:false})
     .catch((error) => {
      console.log("while deleting : ",error); 
      res.sendStatus(400); 
    })
  }


  Post.findByIdAndUpdate(req.params.id, req.body)
  .then(() => { res.sendStatus(204)})
  .catch((error) => {
    console.log("while deleting : ",error); 
    res.sendStatus(400); 
  })
})

async function getPosts(filter) {

  var results = await Post.find(filter)
  .populate("postedBy")
  .populate("retweetData")
  .populate("replyTo")
  .sort({"createdAt": -1})
  .catch(error => console.log(error))

  results = await User.populate(results, { path: "replyTo.postedBy"});
  return await User.populate(results, { path: "retweetData.postedBy"});
 
}

module.exports = router; 