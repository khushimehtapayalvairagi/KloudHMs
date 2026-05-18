const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/sonography");

const {
  restrictToLoggedInUserOnly
} = require("../middlewares/auth");


// CREATE
router.post(
  "/",
  restrictToLoggedInUserOnly,
  ctrl.createSonography
);

// GET ALL
router.get(
  "/",
  restrictToLoggedInUserOnly,
  ctrl.getAllSonography
);

// DELETE
router.delete(
  "/:id",
  restrictToLoggedInUserOnly,
  ctrl.deleteSonography
);

// COMPLETE
router.put(
  "/complete/:id",
  restrictToLoggedInUserOnly,
  ctrl.uploadReport,
  ctrl.completeSonography
);

// GET BY PATIENT
router.get(
  "/patient/:patientId",
  restrictToLoggedInUserOnly,
  ctrl.getSonographyByPatient
);

module.exports = router;