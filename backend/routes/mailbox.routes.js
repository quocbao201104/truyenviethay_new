const express = require("express");
const router = express.Router();
const mailboxController = require("../controllers/mailbox.controller");
const { authenticateToken } = require("../middleware/auth");

router.get("/", authenticateToken, mailboxController.getMailbox);
router.get("/:id", authenticateToken, mailboxController.readMail);
router.post("/:id/claim", authenticateToken, mailboxController.claimAttachments);

module.exports = router;
