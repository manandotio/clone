const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authUser(req, res, next) {
    try {
        let userId = null;
        let token = null;

        if (req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token && req.query.token) {
            token = req.query.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (err) {
                return res.status(401).json({
                    status: false,
                    message: "Invalid or expired token",
                });
            }
        }

        if (!userId && req.body.userId) {
            userId = req.body.userId;
        }

        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "Token or userId required",
            });
        }

        const user = await userModel.findOne({ userId });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Auth Error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
            error: error.message,
        });
    }
}

module.exports = {
    authUser
};
