const authMiddleware = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
