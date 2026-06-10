const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); 

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log("🔥 AUTH ERROR: No token provided");
            return res.status(401).json({ success: false, message: "Unauthorized. No token." });
        }

        const token = authHeader.split(" ")[1];
        const isCustomAuth = token.length < 500; 

        let decodedData;

        if (token && isCustomAuth) {      
            // 1. STANDARD LOGIN (Email/Password)
            decodedData = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedData;
        } else {
            // 2. EXTERNAL LOGIN (Google or Microsoft)
            decodedData = jwt.decode(token);
            
            // Handle both Google ('email') and Microsoft ('preferred_username')
            const tokenEmail = decodedData?.email || decodedData?.preferred_username;
            const tokenName = decodedData?.name || 'External Customer';
            const tokenSub = decodedData?.sub || decodedData?.oid; // 'oid' is Microsoft's ID

            if (!decodedData || !tokenEmail) {
                console.log("🔥 ERROR: Could not extract email from external token.");
                return res.status(401).json({ success: false, message: "Could not find email in token." });
            }
            
            let dbUser = await User.findOne({ email: tokenEmail });

            if (!dbUser) {
                console.log(`🛠️ Auto-creating account for ${tokenEmail}...`);
                dbUser = new User({
                    name: tokenName,
                    email: tokenEmail,
                    googleId: tokenSub, // Reusing this field for the external ID
                });
                await dbUser.save();
                console.log("✅ External user auto-created successfully!");
            }

            req.user = { 
                id: dbUser._id, 
                _id: dbUser._id,
                email: dbUser.email,
                name: dbUser.name
            }; 
        }    

        next();
    } catch (error) {
        console.log("🔥 AUTH ERROR:", error.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;