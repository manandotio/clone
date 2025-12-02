const userModel = require("../models/user.model");

async function registerBusiness(req, res) {
    const { userId } = req.user;
    const {
        businessName,
        ownerName,
        businessType,
        category,
        address,
        pincode,
        city,
        language,
        currency,
        gstin,
    } = req.body;

    const businessExists = await userModel.findOne({
        userId
    });

    if (!businessExists) {
        return res.status(404).json({
            status: false,
            message: "User not found"
        });
    }

    if (businessExists.isProfileComplete) {
        return res.status(400).json({
            status: false,
            message: "Business already registered"
        });
    }

    const user = await userModel.findOneAndUpdate({
        userId
    },
        {
            businessName,
            ownerName,
            category,
            address,
            businessType,
            pincode,
            city,
            language,
            currency,
            gstin,
            isProfileComplete: true,
        },
        { new: true }
    );

    res.json({
        status: true,
        message: "user registerd",
        data: user
    });
};

async function additionalBusinessInfo(req, res) {
    const { userId } = req.user;

    const { otherEmail, contact, workingHours } = req.body;

    let photo = req.file ? `/uploads/users/${userId}` : "";

    const user = await userModel.findOneAndUpdate({ userId }, {
        otherEmail,
        contact,
        workingHours,
        photo
    }, { new: true })

    return res.json({
        status: true,
        message: "user Deatils subbmitted",
        user
    })
}

module.exports = {
    registerBusiness,
    additionalBusinessInfo
}