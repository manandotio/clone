const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

const client = new OAuth2Client(CLIENT_ID);

async function googleLogin(req, res) {
    try {
        const { token } = req.body;

        if (!token)
            return res.status(400).json({ status: false, message: "Token is required" });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await userModel.findOne({ email });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            user = await userModel.create({ googleId, email, name, picture });
        }

        const authToken = jwt.sign(
            { userId: user.userId, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        
        res.setHeader("Authorization", `Bearer ${authToken}`);

        return res.json({
            status: true,
            message: "Login successful",
            userId: user.userId,
            token: authToken,
        });


    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ status: false, message: "Server error", error: error.message });
    }
}

module.exports = { googleLogin };
