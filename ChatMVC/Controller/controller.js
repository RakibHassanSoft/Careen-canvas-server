const UserChats = require("../Models/Users");
const Conversation = require("../Models/Conversation")

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        // console.log(req.body)
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const newUser = new UserChats({ fullName, email, password });
        console.log(newUser)
        res.status(200).json({ NewUser: newUser })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database using Mongoose
        const users = await UserChats.find(); // Mongoose's find method returns an array

        // Send the users in the response
        res.status(200).json(users);
    } catch (error) {
        // Handle any errors that may occur during the request
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Create a new conversation
exports.createConversation = async (req, res) => {
    try {
        const { userId: senderId, receiverId } = req.body;
        const newConversation = new Conversation({ members: [senderId, receiverId] });
        await newConversation.save();
        res.status(201).json({ message: "New conversation created successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Get conversation by userId
exports.getConversationByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const conversations = await Conversation.find({ members: { $in: [userId] } });
        
        // Fetch conversation details with other user data
        const conversationUsersData = await Promise.all(conversations.map(async (conversation) => {
            const otherUserId = conversation.members.find(member => member !== userId);
            const otherUser = await UserChats.findById(otherUserId); // Assuming you're using `UserChats` model for users
            return {
                conversationId: conversation._id,
                userId: otherUserId,
                userName: otherUser?.fullName,
                email: otherUser?.email
            };
        }));

        res.status(200).json(conversationUsersData);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Create a new message
exports.createMessage = async (req, res) => {
    try {
        const { conversationId, senderId, message } = req.body;

        // Validate that the conversation exists
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const newMessage = new Messages({ conversationId, senderId, message });
        await newMessage.save();
        res.status(201).json({ message: "New message created successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// Get messages by conversationId
exports.getMessagesByConversationId = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;

        // If conversationId is 'new', return an empty array
        if (conversationId === 'new') {
            return res.status(200).json([]);
        }

        const messages = await Messages.find({ conversationId: conversationId });

        // Fetch user details for each message
        const messageUserData = await Promise.all(messages.map(async (message) => {
            const user = await UserChats.findById(message.senderId); // Assuming you're using `UserChats` model for users
            return { 
                user: { id: user?._id, email: user?.email, fullName: user?.fullName },
                message: message.message 
            };
        }));

        res.status(200).json(messageUserData);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};


