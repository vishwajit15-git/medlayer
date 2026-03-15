const mongoose = require("mongoose");
const Doctor = require("../src/models/Doctor");
require("dotenv").config();

async function migrateDoctors() {

  await mongoose.connect(process.env.MONGO_URI);
  console.log("DB connected");

  const doctors = await Doctor.find();

  let migrated = 0;
  let skipped = 0;

  for (const doctor of doctors) {

    // Skip if already migrated
    if (Array.isArray(doctor.availability)) {
      continue;
    }

    if (
      doctor.availability &&
      doctor.availability.startTime &&
      doctor.availability.endTime
    ) {

      doctor.availability = [
        {
          startTime: doctor.availability.startTime,
          endTime: doctor.availability.endTime
        }
      ];

      await doctor.save();
      migrated++;

    } else {

      console.log(`Skipping invalid doctor: ${doctor._id}`);
      skipped++;

    }
  }

  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);

  process.exit();
}

migrateDoctors();