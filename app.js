const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FileExistsService = require("./FileExistsService");

const app = express();
const PORT = 3000;

const fileExistsService = new FileExistsService();

app.use(express.urlencoded({ extended: true }));

const uploadPathMap = {
  android: "/storage/emulated/0/DCIM/Camera/Uploads",
  darwin: path.join(__dirname, "uploads"),
};

// Ensure 'uploads' folder exists
const platform = process.platform;
const uploadFolder = uploadPathMap[platform];
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const isExists = fileExistsService.has(file.originalname);

    console.log(
      `${file.originalname} : ${isExists ? "Already Exists" : "Uploaded"}`
    );

    cb(null, !isExists);
  },
});

// Route to upload multiple files
app.post("/upload", upload.array("files", 10), (req, res) => {
  req.files.forEach((file) => {
    fileExistsService.add(file.originalname);
  });

  res.json({
    message: "Files uploaded successfully!",
    files: req.files,
  });
});

// Simple HTML form for multiple uploads
app.get("/", (req, res) => {
  res.send(`
    <h2>Upload Multiple Files</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="files" multiple required />
      <button type="submit">Upload</button>
    </form>
  `);
});

const HOST = "0.0.0.0";
app.listen(PORT, HOST, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
});
