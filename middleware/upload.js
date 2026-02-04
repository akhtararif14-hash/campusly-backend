const multer = require("multer")
const path = require("path")
const fs = require("fs")

// absolute folder path (for filesystem)
const uploadDir = path.join(__dirname, "..", "uploads", "products")

// ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueName + path.extname(file.originalname))
  },
})

// allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"))
  }
}

// IMPORTANT: attach relative path for frontend use
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
})

module.exports = upload
