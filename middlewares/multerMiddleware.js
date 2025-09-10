const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Fonction pour déterminer le dossier selon le type d’upload
function resolveUploadPath(type = "misc") {
  const baseDir = path.join(__dirname, "../assets");
  const subDirMap = {
    profile: "profilePictures",
    document: "documents",
    prescription: "prescriptions"
  };

  const subDir = subDirMap[type] || "misc";
  const fullPath = path.join(baseDir, subDir);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  return fullPath;
}

// Configuration du storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.uploadType || "misc";
    const uploadPath = resolveUploadPath(type);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.query.userId || "temp";
    console.log("UserID for upload:", userId);
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${userId}_${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

module.exports = { upload, resolveUploadPath };