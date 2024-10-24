
const express = require('express');
const { registerUser, getAllUsers, createConversation, getConversationByUserId, createMessage, getMessagesByConversationId } = require('../Controller/controller');
const router = express.Router();
// Routes
router.post('/register', registerUser);
router.get('/allChatUsers', getAllUsers);

router.post('/conversation', createConversation);
router.get('/conversation/:userId', getConversationByUserId);

router.post('/messages', createMessage);
router.get('/messages/:conversationId', getMessagesByConversationId);

module.exports = router;