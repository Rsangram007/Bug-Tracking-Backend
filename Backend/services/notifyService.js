const Notification = require("../models/Notification");

let io; // Store Socket.io instance

class NotifyService {
  setIo(socketIo) {
    io = socketIo;
  }

  async notifyUser(userId, message, bugId = null) {
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);
    
    const notification = new Notification({ 
      user: userId, 
      userName: user.name,
      message, 
      bugId 
    });
    await notification.save();

    if (io) {
      io.to(userId.toString()).emit("notification", {
        message,
        bugId,
        userName: user.name,
        timestamp: Date.now(),
      });
    }
  }

  async notifyQA(userId, message) {
    return this.notifyUser(userId, message);
  }

  async notifyDeveloper(userId, message) {
    return this.notifyUser(userId, message);
  }

  async notifyAdmins(message) {
    const User = (await import("../models/User.js")).default; // Dynamic import to prevent circular dependency
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      await this.notifyUser(admin._id, message);
    }
  }
}





const notifyService = new NotifyService();

module.exports = notifyService;