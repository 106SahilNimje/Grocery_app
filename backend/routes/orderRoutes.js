const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');

// POST /api/orders - Place a new order
router.post('/', async (req, res) => {
    console.log("POST /api/orders Body:", req.body); // Debug log
    const { user, items, totalAmount, shippingAddress } = req.body;
    try {
        const newOrder = new Order({
            user,
            items,
            totalAmount,
            shippingAddress
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        console.error("Order Save Error:", err.message); // Debug log
        res.status(400).json({ error: err.message });
    }
});

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus: status },
            { new: true }
        );
        if (!updatedOrder) return res.status(404).json({ error: "Order not found" });
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/orders - Get all orders (for Admin/User)
// Use query param ?userId=<id> to filter by user
router.get('/', async (req, res) => {
    const { userId } = req.query;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid User ID format" });
    }

    const filter = userId ? { user: userId } : {};

    try {
        const orders = await Order.find(filter).populate('user').populate('items.product').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
