const User = require("../models/User");

const userController ={
    //GET ALL USERS
    getAllUsers: async (req,res)=>{
        try {
            const user = await User.find();
            res.status(200).json(user)
        } catch (error) {
            res.status(500).json(error);
        }

    },

    // DELETE USERS
    deleteUser: async (req,res)=>{
        try {
            const user = await User.findById(req.params.id);
            res.status(200).json("Delete successfully");
        } catch (error) {
            res.status(500).json(error)
        }
    }
}

module.exports =userController