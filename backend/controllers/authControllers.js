const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

let refreshTokens = [];
const authController = {
    //REGISTER
    registerUser: async (req, res) => {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // Create new user
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

            // Save to DB
            const user = await newUser.save();
            res.status(200).json({ message: "User created successfully", user });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    },

    // GENERATE ACCESS TOKEN
    generateAccessToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                admin: user.admin
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "10s" } // Access token expires in 15 minutes
        );
    },

    // GENERATE REFRESH TOKEN
    generateRefreshToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                admin: user.admin
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "365d" } // Refresh token expires in 365 days
        );
    },

    // LOGIN
    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (!user) {
                return res.status(404).json({ error: "Wrong username or password" });
            }

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                return res.status(404).json({ error: "Wrong username or password" });
            }

            const accessToken = authController.generateAccessToken(user);
            const refreshToken = authController.generateRefreshToken(user);

            //LUU VAO ARRAY
            refreshTokens.push(refreshToken);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false ,
                path: "/",
                sameSite: "strict"
            });

            const { password, ...others } = user._doc;
            res.status(200).json({ ...others, accessToken });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    },

    requestRefreshToken: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(401).json("You are not authenticated");
        if(!refreshTokens.includes(refreshToken)){
            return res.status(403).json("RefreshToken is not valid");
        }
        jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY,(err,user)=>{
            if(err){
                console.log(err);
            }
            refreshTokens.filter((token)=>{token !== refreshToken});
            //Create new accessToken and refreshToken
            const newaccessToken = authController.generateAccessToken(user);
            const newrefreshToken = authController.generateRefreshToken(user);
            refreshTokens.push(newrefreshToken);
            res.cookie("refreshToken", newrefreshToken, {
                httpOnly: true,
                secure: false, 
                path: "/",
                sameSite: "strict"
            });
            res.status(200).json({accessToken: newaccessToken});
        })
    },

    // LOGOUT
    userLogout : (req,res)=>{
        res.clearCookie("refreshToken");
        refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
         res.status(200).json("Logout successfully");
    }
};

module.exports = authController;
