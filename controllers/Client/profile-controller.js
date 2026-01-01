const User = require("../../models/userModel")

const profile= async(req,res)=>{
    try {
        const profileData= await User.find
    } catch (error) {
        res.status(500).json({message:error})
    }
}