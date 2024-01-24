const middlewareController = require("../controllers/middlewareController");
const userController = require("../controllers/userControllers");

const router = require("express").Router();

//GET ALL USERS
router.get("/",middlewareController.verifyToken,userController.getAllUsers);

// DELETE  USER

router.delete("/:id",middlewareController.verifyTokenandAdminAuth,userController.deleteUser);

module.exports = router;