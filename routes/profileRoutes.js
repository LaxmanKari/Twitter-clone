const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/UserSchema");
const bcrypt = require("bcrypt");

//top-level of this profileRoutes
router.get("/", (req, res, next) => {
  var payload = {
    pageTitle: req.session.user.firstName + " " + req.session.user.userName,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };

  res.status(200).render("profilePage", payload);
});

router.get("/:userName", async(req, res, next) => {
  var payload = await getPayload(req.params.userName, req.session.user);
  res.status(200).render("profilePage", payload);
});

router.get("/:userName/replies", async(req, res, next) => {
  var payload = await getPayload(req.params.userName, req.session.user);
  payload.selectedTab = "replies";
  res.status(200).render("profilePage", payload);
});

router.get("/:userName/following", async(req, res, next) => {
  var payload = await getPayload(req.params.userName, req.session.user);
  payload.selectedTab = "following";
  res.status(200).render("followersAndFollowing", payload);
});

router.get("/:userName/followers", async(req, res, next) => {
  var payload = await getPayload(req.params.userName, req.session.user);
  payload.selectedTab = "followers";
  res.status(200).render("followersAndFollowing", payload);
});

async function getPayload(userName, userLoggedIn) {
  var user = await User.findOne({ userName: userName });
  
  if (user == null) {

    user = await User.findById(userName);  
    
    if(user == null){
      return {
         pageTitle: "User Not Found",
         userLoggedIn: userLoggedIn,
         userLoggedInJs: JSON.stringify(userLoggedIn),
       };
    }
   
  }

  return {
   pageTitle: user.userName,
   userLoggedIn: userLoggedIn,
   userLoggedInJs: JSON.stringify(userLoggedIn),
   profileUser: user
 };
}

module.exports = router;
