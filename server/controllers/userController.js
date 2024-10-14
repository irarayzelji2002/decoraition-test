const { db, auth } = require("../firebaseConfig");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");

// Create
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, connectedAccount, profilePic, userId } =
      req.body;

    // Create user in Firebase Authentication
    let firebaseUserId;
    if (connectedAccount === "Google") {
      // For Google OAuth
      firebaseUserId = userId;
    } else {
      // For email/password registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUserId = userCredential.user.uid;
    }

    // Create user document in Firestore
    const userRef = db.collection("users").doc(firebaseUserId);
    await userRef.set({
      firstName,
      lastName,
      username,
      email,
      theme: 0, //0 for dark mode (default), 1 for light mode
      connectedAccount, //0 for Google, 1 for Facebook, null
      profilePic,
      notifSettings: {
        mentionedInComment: true,
        newCommentReplyAsOwner: true,
        newCommentReplyAsCollab: false,
        commentStatusChangeAsOwner: true,
        commentStatusChangeAsCollab: false,
        calEventReminder: true,
        renamedProject: true,
        deletedProject: true,
        changeRoleInProject: true,
        renamedDesign: true,
        deletedDesign: true,
        changeRoleInDesign: true,
        timeForCalEventReminder: "0800", //"0000" to "2359"
        deleteNotif: true,
        deleteNotifAfter: 7,
      },
      layoutSettings: {
        designsListHome: 0, //0 for tiled view, 1 for list view
        projectsListHome: 0,
        designsListDesigns: 0,
        projectsListProjects: 0,
        timeline: 0,
      },
      lastUsedSettings: {
        colorPalette: null,
        numberOfImages: 1,
      },
      colorPalettes: [],
      otp: null,
      projects: [],
      designs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: "User created successfully", userId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user", message: error.message });
  }
};

// Read
exports.fetchUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(userDoc.data());
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
};

// Update
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    await db.collection("users").doc(userId).update(updateData);
    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await db.collection("users").doc(userId).delete();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Login with email and password
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in user with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch additional user data from Firestore
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data();

    // Add the document ID (user.uid) to userData
    const userDataWithId = {
      ...userData,
      id: user.uid,
    };

    res.status(200).json({
      message: "Login successful",
      userData: userDataWithId,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(401).json({ error: "Login failed", message: error.message });
  }
};

// Logout
exports.handleLogout = async (req, res) => {
  try {
    await auth.signOut();
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
