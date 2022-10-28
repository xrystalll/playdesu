import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (dest, name) => {
  return multer.diskStorage({
    destination: path.join(__dirname, "..", "..", "public", dest),
    filename: (req, file, callback) => {
      callback(
        null,
        name +
          "_" +
          Math.floor(Math.random() * 9999) +
          "_" +
          Date.now() +
          path.extname(file.originalname)
      );
    },
  });
};
