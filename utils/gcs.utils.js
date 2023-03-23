import multer from "multer";
import {Storage} from "@google-cloud/storage";
import path from "path";
import dotenv from "dotenv";

dotenv.config({path: ".env"});

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: "profile-bucket-key.json",
});

const upload = multer({storage: multer.memoryStorage()});

export const uploadImage = async (
  file,
  bucketName,
  filename = `${Date.now()}-${file.originalname}`
) => {
  const bucket = storage.bucket(bucketName);
  if (filename !== file.originalname) {
    filename = filename + path.extname(file.originalname);
  }
  try {
    const imageName = filename; // might have a problem when save at the same times with a same file's name
    const imageBuffer = file.buffer;

    const blob = bucket.file(imageName);
    const stream = blob.createWriteStream();

    return new Promise((resolve, reject) => {
      stream.on("error", (err) => {
        console.error(err);
        reject(err);
      });

      stream.on("finish", async () => {
        // const imageUrl = `https://storage.cloud.google.com/${bucketName}/${imageName}`;
        // const imageUrl = `https://storage.googleapis.com/${bucketName}/${imageName}`;
        resolve(imageName);
      });

      stream.end(imageBuffer);
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getImageUrl = async (bucketName, imageName) => {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(imageName);

  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
  });

  return url;
};
