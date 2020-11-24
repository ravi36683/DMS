//imports
import { userJwtKey, adminJwtKey } from '../config/keys';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pathDirectory from 'path';
import userModel from "../models/users";

import mongoose from 'mongoose';

import each from 'sync-each'

//checking if request body is valid
export const checkIfEmpty = (requestBody) => {
    const values = Object.values(requestBody);
    let isEmpty = values.filter(el => !el)
    return {
        isValid: isEmpty.length > 0 ? false : true
    }
}

//signing jwt token
export const signJwt = userid => {
    let token;
    try {
        const tokenData = {
            userid
        }
        token = jwt.sign(tokenData, userJwtKey, {
            expiresIn: "100h"
        })
    }
    catch (e) {
        token = null
    }
    return token;
}

//password hashing
export const hashPassword = password => {
    return new Promise(async (resolve, reject) => {
        try {
            const hashedPassword = await bcrypt.hash(password, 10)
            resolve(hashedPassword)
        }
        catch (e) {
            reject(false)
        }
    })
}

//verify password hash
export const verifyHash = (password, passwordHash) => {
    return new Promise(async (resolve, reject) => {
        try {
            const isPasswordValid = await bcrypt.compare(password, passwordHash)
            resolve(isPasswordValid)
        }
        catch (e) {
            reject(false)
        }
    })
}

//verify jwt token
export const verifyJwt = token => {
    return new Promise(async (resolve, reject) => {
        try {
            const isTokenValid = await jwt.verify(token, userJwtKey)
            if (isTokenValid) {
                resolve(isTokenValid)
            }
        }
        catch (e) {
            reject(false)
        }
    })
}


//signing jwt token for admin
export const signJwtAdmin = adminId => {
    let token;
    try {
        const tokenData = {
            adminId
        }
        token = jwt.sign(tokenData, adminJwtKey, {
            expiresIn: "100h"
        })
    }
    catch (e) {
        token = null
    }
    return token;
}

export const verifyJwtAdmin = token => {
    return new Promise(async (resolve, reject) => {
        try {
            const isTokenValid = await jwt.verify(token, adminJwtKey)
            if (isTokenValid) {
                resolve(isTokenValid)
            }
        }
        catch (e) {
            reject(false)
        }
    })
}

export const checkFileType = (file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|doc|docx|odt|pdf|xls|xlsx|ppt|pptx|txt|ods/;
    // Check ext
    const extname = filetypes.test(pathDirectory.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}
