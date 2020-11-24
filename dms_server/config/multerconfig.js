import multer from 'multer';
import pathDirectory from 'path';
import { checkFileType } from '../functions/functions';

export const fileStorage = multer.diskStorage({
    destination: './public/uploads/Files',
    filename: async (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + pathDirectory.extname(file.originalname));
    }
});

export const uploadfile = multer({
    storage: fileStorage,
    limits: {
        fileSize: 4000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file');
