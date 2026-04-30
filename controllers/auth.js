const User = require('../models/User');
const Doctor = require('../models/Doctor');
const bcrypt = require('bcrypt');
const Staff = require('../models/Staff');
const { setUser } = require("../utils/auth");

const loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔥 STEP 1: same email ke saare users lao
    const users = await User.find({ email });

    if (!users.length) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let matchedUser = null;

    // 🔥 STEP 2: correct password wala user find karo
    for (const u of users) {
      const isMatch = await bcrypt.compare(password, u.password);
      if (isMatch) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 🔥 STEP 3: ab original logic use karo
    let extraInfo = {};
    let tokenPayload = {
      userId: matchedUser._id,
      email: matchedUser.email,
      role: matchedUser.role,
    };

    let staff = null;
    let doctor = null;

    if (matchedUser.role === 'STAFF') {
      staff = await Staff.findOne({ userId: matchedUser._id });

      if (!staff) {
        return res.status(404).json({ message: 'Staff profile not found.' });
      }

      extraInfo = {
        designation: staff.designation,
        contactNumber: staff.contactNumber,
      };

      tokenPayload._id = staff._id;
      tokenPayload.designation = staff.designation;

    } else if (matchedUser.role === 'DOCTOR') {
      doctor = await Doctor.findOne({ userId: matchedUser._id });

      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found.' });
      }

      tokenPayload._id = doctor._id;
    }

    const token = setUser(tokenPayload);

    let finalId = matchedUser._id;

    if (matchedUser.role === 'STAFF' && staff) {
      finalId = staff._id;
    } else if (matchedUser.role === 'DOCTOR' && doctor) {
      finalId = doctor._id;
    }

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: finalId,
        userId: matchedUser._id,
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        ...extraInfo
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = loginHandler;
