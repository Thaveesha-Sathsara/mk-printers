const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    linkId: {
        type: String,
        required: true,
        unique: true,
    },
    prizePool: {
        type: [String],
        required: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Opened', 'Claimed', 'Cancelled'],
        default: 'Active',
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    winnerDetails: {
        name: { type: String, default: '' },
        whatsapp: { type: String, default: '' },
        prizeWon: { type: String, default: '' },
    }
}, { timestamps: true });

module.exports = mongoose.model('Campaign', CampaignSchema);