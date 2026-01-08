const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

/* ===========================
   CLOUDINARY CONFIG
=========================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/* ===========================
   SAFETY CHECK
=========================== */
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Cloudinary environment variables are missing");
}

/* ===========================
   MULTER STORAGE (MULTI IMAGE)
=========================== */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "ecommerce_products",
      format: file.mimetype.split("/")[1], // auto format
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      resource_type: "image",
    };
  },
});

/* ===========================
   MULTER CONFIG
=========================== */
const upload = multer({
  storage,
  limits: {
    files: 5, // ✅ MAX 5 IMAGES
    fileSize: 5 * 1024 * 1024, // ✅ 5MB per image
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only JPG, PNG, WEBP images allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

module.exports = upload;
