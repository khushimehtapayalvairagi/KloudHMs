const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true  },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN','DOCTOR','STAFF'], required: true },
    isActive: { type: Boolean, default: true } 

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

