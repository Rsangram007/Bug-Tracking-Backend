const express = require('express');
const router = express.Router();
const bugService = require('../services/bugService');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage before Cloudinary



// Report a bug (QA only)
router.post('/report', auth, role(['qa']), upload.array('attachments'), async (req, res) => {
  const { title, description } = req.body;
  const files = req.files; // Array of uploaded files
  try {
    const bug = await bugService.createBug({
      title,
      description,
      attachments: files,
      createdBy: req.user.id,
    });
    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Other routes remain the same (status update, verification, etc.)
router.put('/:id/status', auth, role(['developer']), async (req, res) => {
  const { status, fixDescription } = req.body;
  try {
    const bug = await bugService.updateBugStatus(req.params.id, status, fixDescription, req.user.id);
    res.json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/verify', auth, role(['qa']), async (req, res) => {
  const { status, comment } = req.body;
  try {
    const bug = await bugService.verifyBug(req.params.id, status, comment, req.user.id);
    res.json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const bugs = await bugService.getAllBugs(req.user);
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/assign', auth, role(['admin']), async (req, res) => {
  const { developerId } = req.body;
  try {
    const bug = await bugService.assignBug(req.params.id, developerId);
    res.json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;