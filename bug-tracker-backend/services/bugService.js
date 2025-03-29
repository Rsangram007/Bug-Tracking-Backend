const Bug = require('../models/Bug');
const Notification = require('../models/Notification');
const notifyService = require('../services/notifyService');
const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs').promises; // For cleaning up temp files

class BugService {
  async createBug(data) {
    const { title, description, attachments, createdBy } = data;
    let uploadedAttachments = [];
    if (attachments && attachments.length > 0) {
      uploadedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const url = await uploadToCloudinary(file);
          await fs.unlink(file.path);  
          return url;
        })
      );
    }
    const bug = new Bug({
      title,
      description,
      attachments: uploadedAttachments,
      createdBy,
    });
    await bug.save();
    await notifyService.notifyAdmins(`New bug reported: ${title}`);
    return bug;
  }

  async updateBugStatus(bugId, status, fixDescription, developerId) {
    const bug = await Bug.findById(bugId);
    if (!bug || bug.assignedTo.toString() !== developerId) throw new Error('Unauthorized');
    bug.status = status;
    bug.fixDescription = fixDescription;
    bug.updatedAt = Date.now();
    await bug.save();
    await notifyService.notifyQA(bug.createdBy, `Bug ${bug.title} marked as ${status}`);
    return bug;
  }

  async verifyBug(bugId, status, comment, qaId) {
    const bug = await Bug.findById(bugId);
    if (!bug || bug.createdBy.toString() !== qaId) throw new Error('Unauthorized');
    bug.status = status;
    if (comment) bug.comments.push({ text: comment, user: qaId });
    bug.updatedAt = Date.now();
    await bug.save();
    if (status === 'Reopened') {
      await notifyService.notifyDeveloper(bug.assignedTo, `Bug ${bug.title} reopened`);
    }
    return bug;
  }

  async getAllBugs(user) {
    if (user.role === 'admin') return Bug.find().populate('createdBy assignedTo');
    if (user.role === 'developer') return Bug.find({ assignedTo: user.id }).populate('createdBy');
    return Bug.find({ createdBy: user.id }).populate('assignedTo');
  }

  async assignBug(bugId, developerId) {
    const bug = await Bug.findById(bugId);
    if (!bug) throw new Error('Bug not found');
    bug.assignedTo = developerId;
    await bug.save();
    await notifyService.notifyDeveloper(developerId, `Bug ${bug.title} assigned to you`);
    return bug;
  }
}

module.exports = new BugService();