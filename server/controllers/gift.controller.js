const Campaign = require('../models/campaign.model');
const crypto = require('crypto');

// generate new gift links
exports.generateCampaign = async (req, res) => {
    try {
        // Items and expire date
        const { prizePool, validForDays } = req.body;

        const linkId = crypto.randomUUID();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (validForDays || 7));

        const campaign = new Campaign({ linkId, prizePool, expiresAt });
        await campaign.save();

        res.status(201).json({ success: true, linkId, campaign });
    } catch (error) {
        console.error("Generate link crash:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// customer: visit the link
exports.checkLinkStatus = async (req, res) => {
    try {
        const { linkId } = req.params;
        const campaign = await Campaign.findOne({ linkId });

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        // check if expires
        if (new Date() > new Date(campaign.expiresAt) && campaign.status === 'Active') {
            campaign.status = 'Cancelled';
            await campaign.save();
            return res.status(400).json({ success: false, message: 'This gift link has expired' });
        }

        // return status wihtout revealing the un-opened prizes
        res.status(200).json({
            success: true,
            status: campaign.status,
            expiresAt: campaign.expiresAt,
            winnerDetails: campaign.winnerDetails,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// customer click a box
exports.openBox = async (req, res) => {
    try {
        const { linkId } = req.params;
        const campaign = await Campaign.findOne({ linkId });

        if (!campaign || campaign.status !== 'Active') {
            return res.status(400).json({ success: false, message: 'Invalid or already opened link.' });
        }

        // random selection of the prize
        const randomIndex = Math.floor(Math.random() * campaign.prizePool.length);
        const wonPrize = campaign.prizePool[randomIndex];

        // shows the customer what they missed
        const remainingPrizes = [...campaign.prizePool];
        remainingPrizes.splice(randomIndex, 1);

        //update the db so customer cant reload again
        campaign.status = 'Opened';
        campaign.winnerDetails.prizeWon = wonPrize;
        await campaign.save();

        res.status(200).json({
            success: true,
            wonPrize,
            otherprizes: remainingPrizes
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, campaigns });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.claimPrize = async (req, res) => {
    try {
        const { linkId } = req.params;
        const { name, whatsapp } = req.body;

        const campaign = await Campaign.findOne({ linkId });

        if (!campaign || campaign.status !== 'Opened') {
            return res.status(400).json({ success: false, message: 'Invalid claim attempt.' });
        }

        campaign.status = 'Claimed';
        campaign.winnerDetails.name = name;
        campaign.winnerDetails.whatsapp = whatsapp;
        await campaign.save();

        res.status(200).json({ success: true, message: 'Prize claimed successfully!' });
    } catch (error) {
        console.error("Claim prize error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.cancelCampaign = async (req, res) => {
    try {
        const { linkId } = req.params;
        const campaign = await Campaign.findOne({ linkId });

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        // Only prevent cancellation if they already successfully claimed the prize
        if (campaign.status === 'Claimed') {
            return res.status(400).json({ success: false, message: 'Cannot cancel a link that has already been claimed by a customer.' });
        }

        // Allow 'Active' and 'Opened' links to be cancelled
        campaign.status = 'Cancelled';
        await campaign.save();

        res.status(200).json({ success: true, message: 'Link cancelled successfully.' });
    } catch (error) {
        console.error("Cancel Link Crash:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 7. Admin: Edit an active link
exports.editCampaign = async (req, res) => {
    try {
        const { linkId } = req.params;
        const { prizePool, validForDays } = req.body;
        
        const campaign = await Campaign.findOne({ linkId });

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Link not found' });
        }

        if (campaign.status === 'Claimed' || campaign.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Cannot edit links that are already claimed or cancelled.' });
        }

        // Update prizes if provided
        if (prizePool && prizePool.length > 0) {
            campaign.prizePool = prizePool;
        }
        
        // Extend expiration date from today
        if (validForDays) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + Number(validForDays));
            campaign.expiresAt = expiresAt;
        }

        await campaign.save();

        res.status(200).json({ success: true, message: 'Link updated successfully.', campaign });
    } catch (error) {
        console.error("Edit Link Crash:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};