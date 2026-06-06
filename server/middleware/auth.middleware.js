const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Check for both capitalized and lowercase header names
  const authHeader = req.header('Authorization') || req.header('authorization');

  if (!authHeader) {
    console.error("🔥 AUTH ERROR: No Authorization header provided by frontend.");
    return res.status(401).json({ success: false, message: 'No token, authorization denied' });
  }

  try {
    // Safely extract the token whether it has "Bearer " attached or not
    const tokenString = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    
    // Verify the token
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    req.adminId = decoded.id; // Attach the admin's ID to the request
    next(); // Let them pass
  } catch (err) {
    console.error("🔥 AUTH ERROR: Token rejected. Reason:", err.message);
    res.status(401).json({ success: false, message: 'Token is not valid' });
  }
};