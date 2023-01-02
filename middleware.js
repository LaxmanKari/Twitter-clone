exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next(); // carry on and perform the next in the request-response cycle 
  } else {
    return res.redirect("/login");
  }
};
