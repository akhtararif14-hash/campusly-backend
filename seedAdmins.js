const mongoose = require("mongoose")
require("dotenv").config()
const connectDB = require("./config/db")
const User = require("./models/User")
const bcrypt = require("bcryptjs")

const admins = [
  { name: "Admin One", email: "admin1@local.com", password: "adminpass" },
  { name: "Admin Two", email: "admin2@local.com", password: "adminpass" },
  { name: "Admin Three", email: "admin3@local.com", password: "adminpass" },
]

const seed = async () => {
  try {
    await connectDB()

    const count = await User.countDocuments({ role: "admin" })
    console.log(`Existing admins: ${count}`)

    for (let i = 0; i < admins.length && (await User.countDocuments({ role: "admin" })) < 3; i++) {
      const a = admins[i]
      const exists = await User.findOne({ email: a.email })
      if (!exists) {
        const hashed = await bcrypt.hash(a.password, 10)
        const user = new User({ name: a.name, email: a.email, password: hashed, role: "admin" })
        await user.save()
        console.log(`Admin created: ${a.email}`)
      } else {
        console.log(`Admin already exists: ${a.email}`)
      }
    }

    console.log("Admin seeding complete")
    process.exit(0)
  } catch (err) {
    console.error("Admin seed failed ❌", err)
    process.exit(1)
  }
}

seed()