const express = require('express');
const { authMiddleware } = require('../../Middleware/Middleware');
const { postConversation, getConversationById, postMessages, getMessagesByConversationId, getApiForAllUsers } = require('../Controller/controller');
 // Assuming you have an auth middleware

const router = express.Router();

// POST API for creating a new conversation
router.post('/conversation', authMiddleware, postConversation);

// GET API for fetching conversations by user ID
router.get('/conversation', authMiddleware, getConversationById);

// POST API for sending a message
router.post('/message', authMiddleware, postMessages);

// GET API for fetching messages by conversation ID
router.get('/message/:conversationId', authMiddleware, getMessagesByConversationId);

// GET API for fetching all users
router.get('/users', authMiddleware, getApiForAllUsers);

module.exports = router;
