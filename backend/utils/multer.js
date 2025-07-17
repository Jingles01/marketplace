const multer = require("multer");
const path = require("path");

module.exports = multer({
    storage: multer.memoryStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
            cb(new Error("Unsupported file type!"), false);
            return;
        }
        cb(null, true);
    },
    limits: {
        fileSize: 1024 * 1024 * 5,
        files: 1,
        fieldNameSize: 50,
    }
});
