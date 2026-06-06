const express = require('express');
const router = express.Router();
const giftController = require('../controllers/gift.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/generate', giftController.generateCampaign);

router.get('/all', authMiddleware, giftController.getAllCampaigns);
router.post('/generate', authMiddleware, giftController.generateCampaign);
router.post('/cancel/:linkId', authMiddleware, giftController.cancelCampaign);
router.put('/edit/:linkId', authMiddleware, giftController.editCampaign);

router.get('/:linkId', giftController.checkLinkStatus);
router.post('/:linkId/open', giftController.openBox);
router.post('/:linkId/claim', giftController.claimPrize);

module.exports = router;