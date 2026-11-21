const mongoose = require('mongoose');

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        image: String,
        price: Number, // অর্ডারের সময়ের দাম
        size: String,
        color: String,
        quantity: Number,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    },
    shippingArea: { type: String, enum: ['inside_dhaka', 'outside_dhaka'], default: 'inside_dhaka' },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    shippingCharge: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: 'COD' },
    isPaid: { type: Boolean, default: false },
    note: { type: String, default: '' },
    status: { type: String, enum: STATUSES, default: 'pending' },
    statusHistory: [{ status: String, date: { type: Date, default: Date.now }, note: String }],
    stockRestored: { type: Boolean, default: false },
    deliveredAt: Date,
  },
  { timestamps: true }
);

// অর্ডার নম্বর তৈরি, যেমন: MF-2611-48213
orderSchema.pre('validate', function () {
  if (!this.orderNumber) {
    const d = new Date();
    const ym = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}`;
    this.orderNumber = `MF-${ym}-${Math.floor(10000 + Math.random() * 90000)}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
module.exports.STATUSES = STATUSES;
