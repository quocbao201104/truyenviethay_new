const mailboxService = require("../services/mailbox.services");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const getMailbox = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, limit, offset } = req.query;
        const mails = await mailboxService.getMailbox(userId, { status, limit, offset });
        return successResponse(res, mails, "Lấy danh sách hộp thư thành công");
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};

const readMail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const mail = await mailboxService.readMail(userId, parseInt(id));
        return successResponse(res, mail, "Đọc thư thành công");
    } catch (err) {
        return errorResponse(res, err.message, 400);
    }
};

const claimAttachments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const result = await mailboxService.claimMailAttachments(userId, parseInt(id));
        return successResponse(res, result, result.message);
    } catch (err) {
        return errorResponse(res, err.message, 400);
    }
};

module.exports = {
    getMailbox,
    readMail,
    claimAttachments
};
