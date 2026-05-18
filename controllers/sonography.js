const Sonography = require("../models/Sonography");
    const ManualChargeItem = require("../models/ManualChargeItem");
    const Bill = require("../models/Bill");

    const { getIO } = require("../utils/sockets");



    const multer = require("multer");
    // const Sonography = require("../models/Sonography");





    // STORAGE
    const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
    });

    const upload = multer({ storage });





    // CREATE REQUEST


exports.createSonography = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      procedureType,
      scanType
    } = req.body;

    // ✅ VALIDATION
    if (!patientId || !doctorId || !procedureType || !scanType) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // ✅ ONLY ONE payload (IMPORTANT)
    let payload = { ...req.body };

    // ✅ REMOVE EMPTY visitId
    if (!payload.visitId || payload.visitId === "") {
      delete payload.visitId;
    }

    const data = await Sonography.create(payload);

    res.status(201).json(data);

  } catch (err) {
    console.error("CREATE ERROR 👉", err);
    res.status(500).json({ message: err.message });
  }
};

//     exports.createSonography = async (req, res) => {
//   try {
//     const {
//       patientId,
//       doctorId,
//       visitId,
//       procedureType,
//       scanType
//     } = req.body;

//     if (!patientId || !doctorId  || !visitId || !procedureType || !scanType) {
//       return res.status(400).json({
//         message: "All fields are required"
//       });
//     }


    
//     const data = await Sonography.create(req.body);

//     res.status(201).json(data);

//   } catch (err) {
//     console.error("CREATE ERROR 👉", err);
//     res.status(500).json({ message: err.message });
//   }
// };

    // exports.createSonography = async (req, res) => {
    // try {
    //     console.log("BODY:", req.body); // 👈 ADD THIS

    //     const data = await Sonography.create(req.body);

    //     res.status(201).json(data);
    // } catch (err) {
    //     console.error(err); // 👈 ADD THIS
    //     res.status(500).json({ message: err.message });
    // }
    // };
    // exports.createSonography = async (req, res) => {
    //   try {
    //     const data = await Sonography.create(req.body);
    //     res.status(201).json(data);
    //   } catch (err) {
    //     res.status(500).json({ message: err.message });
    //   }
    // };

    // GET ALL


    exports.getAllSonography = async (req, res) => {
    try {
        console.log("API HIT ✅"); // 👈 ADD THIS

        const list = await Sonography.find()
        .populate("patientId", "fullName contactNumber")
        .populate("manualChargeId"); // ✅ ADD THIS

        res.json(list);
    } catch (err) {
        console.error("ERROR:", err);
        res.status(500).json({ message: err.message });
    }
    };
    // exports.getAllSonography = async (req, res) => {
    //   try {

    //     const list = await Sonography.find()
    //   .populate("patientId", "fullName contactNumber")
    // //   .populate("doctorId");

    //     // const list = await Sonography.find()
    //     //   .populate("patientId", "fullName")
    //     //   .populate("doctorId");



    //         res.json(list);
    //   } catch (err) {
    //     console.error("ERROR:", err); // ✅ DEBUG
    //     res.status(500).json({ message: err.message });
    //   }
    // };
    //     res.json(list);
    //   } catch (err) {
    //     res.status(500).json({ message: err.message });
    //   }
    // };




    // const Sonography = require('../models/Sonography');

exports.deleteSonography = async (req, res) => {

  try {

    console.log("DELETE HIT", req.params.id);

    const deleted =
      await Sonography.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {
      return res.status(404).json({
        message: "Record not found"
      });
    }

    res.status(200).json({
      message: "Deleted successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });
  }
};




exports.completeSonography = async (req, res) => {
  try {
    const { id } = req.params;
    // const { report } = req.body;
    const { report, cost, paymentStatus } = req.body;

    const item = await Sonography.findById(id).populate("patientId");

    if (!item) return res.status(404).json({ message: "Not found" });

    // ✅ UPDATE
    item.status = "Completed";
    item.report = report;
    item.cost = cost;                // ✅ ADD
    item.paymentStatus = paymentStatus; // ✅ ADD
    item.performedDate = new Date();

    await item.save();


    let price = item.cost || 500;

if (item.manualChargeId) {
  const manual = await ManualChargeItem.findById(item.manualChargeId);

  if (manual) {
    price = manual.defaultPrice;
  }
}


    // 💰 BILL CREATE (IMPORTANT)
    await Bill.create({
      patient_id_ref: item.patientId._id,
      items: [
        {
          item_type: "Sonography",
          item_source_id: item._id, // 🔥 VERY IMPORTANT
          description: `Sonography - ${item.scanType}`,
          quantity: 1,
          // unit_price: item.cost || 500,
         unit_price: price,
         sub_total: price
 
          // total_amount: price,
          // balance_due: price,
          
        }
      ],
      total_amount: item.cost || 500,
      payment_status: item.paymentStatus || "Unpaid", // 🔥 ADD THIS
      // balance_due: item.cost || 500
        balance_due: price

    });

    res.json({ message: "Scan completed + billing added", item });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

    // exports.completeSonography = async (req, res) => {
    // try {
    //     const { id } = req.params;

    //     const item = await Sonography.findById(id)
    //     .populate("patientId")
    //     //   .populate("doctorId");

    //     if (!item) return res.status(404).json({ message: "Not found" });

    //     // ✅ UPDATE DATA
    //     item.status = "Completed";
    //     item.report = req.body.report;
    //     item.performedDate = new Date();

    //     // ✅ FILE SAVE
    //     if (req.file) {
    //     item.reportFile = `/uploads/${req.file.filename}`;
    //     }

    //     await item.save();

    //     // 💰 BILLING
    //     const charge = await ManualChargeItem.findOne({ itemName: "Sonography" });

    //     await Bill.create({
    //     patientId: item.patientId,
    //     visit_id_ref: item.visitId,
    //     items: [{
    //         item_type: "Sonography",
    //         description: item.scanType,
    //         quantity: 1,
    //         unit_price: charge?.defaultPrice || 500,
    //         sub_total: charge?.defaultPrice || 500
    //     }],
    //     total_amount: charge?.defaultPrice || 500,
    //     balance_due: charge?.defaultPrice || 500,
    //     generated_by_user_id: req.user?._id || null
    //     });

    //     // 🔔 SOCKET (doctor notify)
    //     if (item.doctorId) {
    //     getIO()
    //         .to(`doctor_${item.doctorId._id}`)
    //         .emit("sonographyCompleted", {
    //         patientName: item.patientId.fullName,
    //         scanType: item.scanType,
    //         report: item.report
    //         });
    //     }

    //     res.json({ message: "Completed + File + Billing + Notify", item });

    // } catch (err) {
    //     res.status(500).json({ message: err.message });
    // }
    // };





    // exports.completeSonography = async (req, res) => {
    //   try {
    //     const { id } = req.params;
    //     const { report } = req.body;

    //     // ✅ populate add karo
    //     const item = await Sonography.findById(id)
    //       .populate("patientId")
    //       .populate("doctorId");

    //     if (!item) return res.status(404).json({ message: "Not found" });

    //     item.status = "Completed";
    //     item.report = report;
    //     await item.save();

    //     // 💰 Billing
    //     const charge = await ManualChargeItem.findOne({ itemName: "Sonography" });

    //     await Bill.create({
    //       patientId: item.patientId,
    //       visit_id_ref: item.visitId,
    //       items: [{
    //         item_type: "Sonography",
    //         description: item.scanType,
    //         quantity: 1,
    //         unit_price: charge?.defaultPrice || 500,
    //         sub_total: charge?.defaultPrice || 500
    //       }],
    //       total_amount: charge?.defaultPrice || 500,
    //       balance_due: charge?.defaultPrice || 500,
    //       generated_by_user_id: req.user?._id || null
    //     });

    //     // ✅🔥 YAHI MAGIC HAI (ADD THIS)
    //     getIO()
    //   .to(`doctor_${item.doctorId._id.toString()}`) // ✅ FIX

    //     // .to(item.doctorId._id.toString())
    //     .emit("sonographyCompleted", {
    //       patientName: item.patientId.fullName,
    //       scanType: item.scanType,
    //       report: item.report,
    //       visitId: item.visitId,
    //       doctorId: item.doctorId._id
    //     });

    //     res.json({ message: "Completed + Billing + Doctor Notified", item });

    //   } catch (err) {
    //     res.status(500).json({ message: err.message });
    //   }
    // };




    // COMPLETE + BILL
    // exports.completeSonography = async (req, res) => {
    //   try {
    //     const { id } = req.params;
    //     const { report } = req.body;

    //     const item = await Sonography.findById(id);
    //     if (!item) return res.status(404).json({ message: "Not found" });

    //     item.status = "Completed";
    //     item.report = report;
    //     await item.save();

    //     // 💰 Add to bill
    //     const charge = await ManualChargeItem.findOne({ itemName: "Sonography" });

    //     await Bill.create({
    //       patientId: item.patientId,
    //       visit_id_ref: item.visitId,
    //       items: [{

    //           item_type: "Sonography",
    //           description: item.scanType,
    //           quantity: 1,
    //           unit_price: charge?.defaultPrice || 500,
    //           sub_total: charge?.defaultPrice || 500
    //         }
    //       ],
    //       total_amount: charge?.defaultPrice || 500,
    //       balance_due: charge?.defaultPrice || 500,

    //       generated_by_user_id: req.user._id || null
    //     });

    //     res.json({ message: "Completed + Billing added", item });
    //   } catch (err) {
    //     res.status(500).json({ message: err.message });
    //   }
    // };


    exports.getSonographyByPatient = async (req, res) => {
    try {
        const { patientId } = req.params;

        // const data = await Sonography.find({ patientId, status: "Completed" });

        const data = await Sonography.find({
  patientId,
  status: "Completed"
})
.populate("patientId", "fullName")
.populate("manualChargeId", "itemName");

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };



    // exports.completeScan = async (req, res) => {
    // try {
    //     const { id } = req.params;
    //     const { report, cost, paymentStatus } = req.body;

    //     const updated = await Sonography.findByIdAndUpdate(
    //     id,
    //     {
    //         report,
    //         cost,
    //         paymentStatus,
    //         status: "Completed",
    //         performedDate: new Date()
    //     },
    //     { new: true }
    //     ).populate("patientId");

    //     res.json(updated);

    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ message: "Error completing scan" });
    // }
    // };

    //         name: "Sonography",
    //         price: charge?.defaultPrice || 500
    //       }],
    //       totalAmount: charge?.defaultPrice || 500
    //     });

    //     res.json({ message: "Completed + Billing added" });
    //   } catch (err) {
    //     res.status(500).json({ message: err.message });
    //   }
    // };

    exports.uploadReport = upload.single("file");