// import multer from "multer";

// const storage = multer.diskStorage({

     
//     filename: function (req, file, callback) {
//         callback(null, file.originalname)
//     }

// })

// const upload = multer({storage})

// export default upload


import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Required for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads')); // Adjust this path if needed
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

export default upload;
