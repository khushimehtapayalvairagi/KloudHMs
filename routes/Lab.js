// routes/lab.js
const express = require('express');
const router = express.Router();
const labController = require('../controllers/LabController');
const { getAllPatientsHandler } = require("../controllers/receptionist");
const { restrictToLoggedInUserOnly, restrictTo, restrictToDesignation } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Only STAFF with designation "Lab Technician" or ADMIN can access
router.get(
  '/patients',
  restrictToLoggedInUserOnly,
  restrictTo(['ADMIN', 'STAFF']),
  restrictToDesignation(['Pathologist']),
  getAllPatientsHandler
);

router.get(
  '/dashboard',
  restrictToLoggedInUserOnly,
  restrictTo(['ADMIN', 'STAFF']),
  restrictToDesignation(['Pathologist']),
  labController.getDashboardStats
);

router.get(
  '/tests',
  restrictToLoggedInUserOnly,
  restrictTo(['ADMIN', 'STAFF']),
  restrictToDesignation(['Pathologist']),
  labController.getLabTests
);

router.post(
  '/tests',
  restrictToLoggedInUserOnly,
  restrictTo(['ADMIN', 'STAFF']),
  restrictToDesignation(['Pathologist']),
  labController.addTestResult
);

router.get(
  '/appointments',
  restrictToLoggedInUserOnly,
  restrictTo(['ADMIN', 'STAFF']),
  restrictToDesignation(['Pathologist']),
  labController.getAppointments
);

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/labReports/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post(
  '/upload-report',
  restrictToLoggedInUserOnly,
  restrictTo(['ADMIN', 'STAFF']),
  restrictToDesignation(['Pathologist']),
    upload.none(), 
  labController.uploadReport
);
router.get(
  '/payments',
  restrictToLoggedInUserOnly,
  restrictTo(['ADMIN', 'STAFF']),
  restrictToDesignation(['Pathologist']),
  labController.getPendingPayments
);

router.put(
  '/payments/:paymentId/pay',
  restrictToLoggedInUserOnly,
  restrictTo(['ADMIN', 'STAFF']),
  restrictToDesignation(['Pathologist']),
  labController.markPaymentPaid
);

module.exports = router;
