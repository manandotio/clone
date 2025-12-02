const userModel = require("../models/user.model");

async function getUser(req,res){
    const { userId } = req.user
    const user = await userModel.findOne({userId}).select("-_id -__v -googleId");

    return res.json({
        status: true,
        message: "user fetched successfully",
        data : user
    })
}

module.exports = {
    getUser
}