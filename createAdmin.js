// createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const MONGO_URI = process.env.MONGO_URI;

// Change your username & password here
const USERNAME = "admin";       // change this to your desired admin username
const PASSWORD = "Admin12345";  // change this to your desired password

async function createOrUpdateAdmin(username, plainPassword) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existingAdmin = await Admin.findOne({ username });

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`✅ Admin "${username}" password updated successfully`);
    } else {
      const newAdmin = new Admin({ username, password: hashedPassword });
      await newAdmin.save();
      console.log(`✅ Admin "${username}" created successfully`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

createOrUpdateAdmin("Raees", "Raees6908090");