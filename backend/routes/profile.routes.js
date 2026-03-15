// backend/routes/user.routes.js
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const authController = require("../controllers/auth.controller");
const authorFollowController = require("../controllers/authorFollow.controller");
const uploadAvatar = require("../middleware/upload_img"); 

router.put(
  "/me",
  authenticateToken,
  uploadAvatar.single("avatar"),
  authController.updateMe
);
router.post(
  "/me",
  authenticateToken,
  uploadAvatar.single("avatar"),
  authController.updateMe
);

router.get("/me", authenticateToken, authController.getMe);
router.get("/me/followed-authors", authenticateToken, authorFollowController.getMyFollowedAuthors);
router.put(
  "/change-password",
  authenticateToken,
  authController.changePassword
);

module.exports = router;
