const mongoose = require("mongoose");

const sonographySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }, // ✅ ADD
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: "Visit" },   // ✅ ADD


  
  scanType: { type: String, required: true },
  notes: String,

  report: String, // ✅ ADD THIS  // text report
  reportFile: String,   // file URL (PDF/Image)

  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending"
  },

  isBilled: {        // ✅ ADD THIS
  type: Boolean,
  default: false
},

manualChargeId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "ManualChargeItem"
},


  paymentStatus: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid"
  },


  startDate: {
  type: Date
},

endDate: {
  type: Date
},

  cost: Number,



  performedDate: Date

}, { timestamps: true });

module.exports = mongoose.model("Sonography", sonographySchema);