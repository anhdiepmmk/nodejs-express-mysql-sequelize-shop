module.exports = (req, res, next) => {
  console.log(req.session.authenticatedUser);
  if (req.session.authenticatedUser) {
    next();
  }
  res.status(401).redirect('/login')
};
