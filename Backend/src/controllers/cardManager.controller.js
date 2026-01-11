const CardRequest = require("../models/cardRequest.model");
const Card = require("../models/card.model");
const BankAccount = require("../models/bankAccount.model");

function generateCardNumber() {
    let num = "";
    for (let i = 0; i < 16; i++) num += Math.floor(Math.random() * 10);
    return num;
}

function generateCVV() {
    return Math.floor(100 + Math.random() * 900).toString();
}

function generateExpiry() {
    const now = new Date();
    const year = now.getFullYear() + 5;
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    return `${month}/${year.toString().slice(-2)}`; // MM/YY
}

// Get pending card requests
module.exports.getPendingCardRequests = async (req, res) => {
    try {
        const pending = await CardRequest.find({ status: "pending" })
            .populate("userId", "fullName email")
            .populate("accountId", "accountNumber balance");

        return res.status(200).json({
            success: true,
            pending
        });
    } catch (error) {
        console.error('Error fetching pending card requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get card manager dashboard stats
module.exports.getCardStats = async (req, res) => {
    try {
        const totalCards = await Card.countDocuments();
        const activeCards = await Card.countDocuments({ 
            status: 'active', 
            isBlocked: false 
        });
        const blockedCards = await Card.countDocuments({ 
            isBlocked: true 
        });
        const pendingRequests = await CardRequest.countDocuments({ 
            status: 'pending' 
        });

        const stats = {
            totalCards,
            activeCards,
            pendingRequests,
            blockedCards
        };

        return res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching card stats:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Approve card request
module.exports.approveCardRequest = async (req, res) => {
    try {
        const { cardRequestId } = req.params;

        if(!cardRequestId) {
            return res.status(400).json({
                success: false,
                message: "Card Request ID is required."
            });
        }

        const request = await CardRequest.findById(cardRequestId);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This request is already processed"
            });
        }

        // Check if card already exists for this account
        const existingCard = await Card.findOne({ accountId: request.accountId });

        if (existingCard) {
            return res.status(400).json({
                success: false,
                message: "A card already exists for this account"
            });
        }

        // Generate card details
        const cardNumber = generateCardNumber();
        const cvv = generateCVV();
        const expiry = generateExpiry();

        // Create card
        await Card.create({
            userId: request.userId,
            accountId: request.accountId,
            cardNumber,
            cvv,
            expiry
        });

        // Update request status
        request.status = "approved";
        request.processedAt = new Date();
        await request.save();

        return res.status(200).json({
            success: true,
            message: "Card approved and created successfully",
            cardNumber,
            cvv,
            expiry
        });
    } catch (error) {
        console.error('Error approving card request:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Reject card request
module.exports.rejectCardRequest = async (req, res) => {
    try {
        const { cardRequestId } = req.params;

        if(!cardRequestId) {
            return res.status(400).json({
                success: false,
                message: "Card Request ID is required."
            });
        }

        const request = await CardRequest.findById(cardRequestId);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This request is already processed"
            });
        }

        request.status = "rejected";
        request.processedAt = new Date();
        await request.save();

        return res.status(200).json({
            success: true,
            message: "Card request rejected"
        });
    } catch (error) {
        console.error('Error rejecting card request:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};