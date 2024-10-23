const Conversation = require("../Models/Conversation");
const Messages = require("../Models/Messages");

// post api for conversation
const postConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body
        const newConversation = new Conversation({ members: [senderId, receiverId] })
        await newConversation.save()
        res.status(201).json({ message: "New Conversation created successfuly" })
    }
    catch {
        res.status(500).json({ message: 'Server error' })
    }
};

// get api for conversation id
const getConversationById = async (req, res) => {
    try {
        const userId = req.user.uid;  // Access authenticated user ID from the middleware
        const conversations = await Conversation.find({ members: { $in: [userId] } });

        // Fetch other user's data for each conversation
        const conversationUsersData = await Promise.all(conversations.map(async (conversation) => {
            const otherUserId = conversation.members.find(member => member !== userId);

            // Fetch other user's details using Firebase Admin SDK
            const otherUser = await admin.auth().getUser(otherUserId);

            return {
                conversationId: conversation._id,
                userId: otherUserId,
                userName: otherUser.displayName, // Use 'displayName' from Firebase Authentication
                email: otherUser.email           // Use 'email' from Firebase Authentication
            };
        }));

        res.status(200).json(conversationUsersData);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// post api for messages
const postMessages= async (req, res) => {
    try {
        const { conversationId, senderId, message } = req.body
        const newMessage = new Messages({ conversationId, senderId, message })
        await newMessage.save()
        res.status(201).json({ message: "New Message created successfuly" })
    }
    catch {
        res.status(500).json({ message: 'Server error' })
    }
};

const getMessagesByConversationId = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        
        // If conversationId is 'new', return an empty array
        if (conversationId === 'new') {
            return res.status(200).json([]);
        }

        // Fetch messages for the specified conversation
        const messages = await Messages.find({ conversationId: conversationId });

        // Use Promise.all to map through messages and fetch sender data from Firebase
        const messageUserData = await Promise.all(messages.map(async (message) => {
            // Use Firebase Admin SDK to get the user details by senderId
            const user = await admin.auth().getUser(message.senderId);
            
            return {
                user: {
                    id: user?.uid,
                    email: user?.email,
                    fullName: user?.displayName
                },
                message: message.message
            };
        }));

        res.status(200).json(messageUserData);
    } catch (error) {
        // Log the detailed error stack for debugging
        console.error("Detailed error stack:", error.stack);

        // Respond with a 500 status and an error message
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};




// get api for all users
const getApiForAllUsers = async (req, res) => {
    try {
        // Fetch all users from Firebase Authentication using the Firebase Admin SDK
        const listAllUsers = async (nextPageToken) => {
            // List batch of users, 1000 at a time.
            return admin.auth().listUsers(1000, nextPageToken);
        };

        let allUsers = [];
        let pageToken = null;

        do {
            // Fetch a batch of users
            const result = await listAllUsers(pageToken);
            allUsers = allUsers.concat(result.users.map(userRecord => ({
                id: userRecord.uid,
                email: userRecord.email,
                fullName: userRecord.displayName,
            })));
            pageToken = result.pageToken;
        } while (pageToken); // Continue fetching until there's no more pages

        // Respond with the list of all users
        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {postConversation,postMessages,getMessagesByConversationId,getConversationById,getApiForAllUsers};
