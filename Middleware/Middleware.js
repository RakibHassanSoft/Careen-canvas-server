require('dotenv').config(); // Import dotenv to read .env file
const admin = require('firebase-admin');


// Replace escaped newline characters in private key
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace \\n with \n
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
}


// Initialize Firebase with credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://CarearCanvas.firebaseio.com'
});

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role || 'user', // Assuming custom claims are used for roles
    };
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Unauthorized - Token expired' });
    }
    console.error('Token verification failed:', error.code, error.message);
    return res.status(401).json({ message: 'Unauthorized - Token verification failed' });
  }
};

// Admin Check Middleware
const adminCheck = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// Middleware to retrieve all users
const getAllUsers = async (req, res) => {
  const maxResults = 1000; // Adjust the number if needed to retrieve more users

  try {
    const listUsersResult = await admin.auth().listUsers(maxResults);
    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || null,
      phoneNumber: userRecord.phoneNumber || null,
      photoURL: userRecord.photoURL || null,
      disabled: userRecord.disabled,
      customClaims: userRecord.customClaims || {},
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime
    }));

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
};
module.exports = { adminCheck, authMiddleware, getAllUsers };

