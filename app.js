const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const {
  S3Client,
  GetObjectCommand,
  ListObjectsCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const getS3Image = require("./utils/getS3Image");
const S3 = require("./config/S3");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");

const upload = multer({
  storage: multerS3({
    s3: S3,
    bucket: process.env.AWS_S3_BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // file extension
      const ext = file.originalname.split(".").pop();
      cb(null, `${Date.now().toString()}.${ext}`);
    },
  }),
});
// ejs view engine
app.set("view engine", "ejs");
app.set("views", "views");

app.get("/", async (req, res) => {
  const url = await getS3Image(S3, "win_bg.jpg");
  res.render("index", {
    img: url,
  });
});

app.get("/upload", async (req, res) => {
  res.render("upload");
});

app.post("/upload", upload.single("image"), async (req, res, next) => {
  // res.render("uploaded: \n");
  console.log("Uploaded: ");
  console.log(req.file);
  next();
});

const PORT = 9999;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
