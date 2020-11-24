//imports
import express from "express";
import userModel from "../models/users";
import filesModel from "../models/files";

import {
  checkIfEmpty,
  signJwt,
  hashPassword,
  verifyHash,
} from "../functions/functions";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { clientPath, serverPath,smtp_email,smtp_host,smtp_password,smtp_port } from "../config/keys";
import { userAuthCheck } from "../middlewares/middlewares";
import smtpTransport from "nodemailer-smtp-transport";
import { uploadfile } from "../config/multerconfig";
const fs = require("fs");
var each = require("sync-each");

const usersRouter = () => {
  //router variable for api routing
  const router = express.Router();

  //post request to signup user
  router.post("/signup", async (req, res) => {
    const body = req.body;
    //verifying if request body data is valid
    const { isValid } = checkIfEmpty(
      body.name,
      body.password,
      body.email,
      body.tnc
    );
    //if request body data is valid
    try {
      if (isValid) {
        const userExists = await userModel.findOne({
          email: body.email,
        });
        if (!userExists) {
          const hashedPassword = await hashPassword(body.password);
          if (hashedPassword) {
            req.body.password = hashedPassword;
            //generating email verification hex
            const email = req.body.email;
            const hash = crypto
              .createHmac("sha256", "verificationHash")
              .update(email)
              .digest("hex");

            req.body.verificationhex = hash;
            req.body.folder = [{ foldername: "No Folder", isdefault: true }];
            const userData = new userModel(req.body);
            const savedUser = await userData.save();
            savedUser["password"] = undefined;
            res.send({
              savedUser,
              code: 200,
              msg: "Data saved successfully, please verify your email address!",
            });

            let transporter = nodemailer.createTransport({
              service: "gmail",
              host: smtp_host,
              port: smtp_port,
              secure: false,
              auth: {
                user: smtp_email,
                pass: smtp_password,
              },
            });

            let mailOptions = {
              from: smtp_email,
              to: savedUser.email,
              subject: "Please verify your email",
              text: `Please click on this link to verify your email address ${serverPath}users/verify/${savedUser.verificationhex}`,
            };

            transporter.sendMail(mailOptions);
          } else {
            res.send({
              code: 400,
              msg: "Some has error occured!",
            });
          }
        } else {
          res.send({
            code: 400,
            msg: "Email already exists!",
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid data",
        });
      }
    } catch (err) {
      console.log(err);
      res.send({
        code: 400,
        msg: "Some error has occured!",
      });
    }
  });

  //post request to login user
  router.post("/login", async (req, res) => {
    try {
      const { isValid } = checkIfEmpty(req.body);
      if (isValid) {
        const { email, password } = req.body;
        //finding user with email
        const isUserExists = await userModel.findOne({
          email,
        });
        console.log("user data ==> ", isUserExists);
        if (isUserExists) {
          if (isUserExists.isvalid === false) {
            res.send({
              code: 403,
              msg: "This email is not verified",
            });
          } else {
            const isPasswordValid = await verifyHash(
              password,
              isUserExists.password
            );
            if (isPasswordValid) {
              //valid password
              if (!isUserExists.blocked) {
                const token = signJwt(isUserExists._id);
                console.log("token", token);
                res.send({
                  code: 200,
                  msg: "Authenticated",
                  token,
                });
              } else {
                res.send({
                  code: 400,
                  msg: "This account is blocked, Please contact to support.",
                });
              }
            } else {
              res.send({
                code: 404,
                msg: "Invalid Login Details!",
              });
            }
          }
        } else {
          res.send({
            code: 404,
            msg: "User not found!",
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid request body",
        });
      }
    } catch (e) {
      res.send({
        code: 406,
        msg: "Some error has occured!",
      });
    }
  });

  //get request to verify user email
  router.get("/verify/:hex", async (req, res) => {
    try {
      const verificationhex = req.params.hex;
      const userHex = await userModel.findOne({
        $and: [
          {
            verificationhex,
          },
          {
            isvalid: false,
          },
        ],
      });
      if (userHex) {
        await userModel.updateOne(
          {
            _id: userHex._id,
          },
          {
            isvalid: true,
          }
        );
        res.redirect(`${clientPath}?verified=true`);
      } else {
        res.send({
          code: 404,
          msg: "Verification hex not found!",
        });
      }
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!",
      });
    }
  });

  //post request for forget password
  router.post("/forgetpassword", async (req, res) => {
    console.log(req.body);
    try {
      const { newpassword, hex } = req.body;
      const { isValid } = checkIfEmpty(req.body);
      if (isValid) {
        const userData = await userModel.findOne({
          forgetPassHex: hex,
        });
        if (userData) {
          const newhashedPassword = await hashPassword(newpassword);
          if (newhashedPassword) {
            await userModel.updateOne(
              {
                email: userData.email,
              },
              {
                password: newhashedPassword,
                forgetPassHex: "",
              }
            );
            res.send({
              code: 200,
              msg: "Password updated successfully!",
            });
          }
        } else {
          res.send({
            code: 404,
            msg: "Wrong token",
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid input",
        });
      }
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!",
      });
    }
  });

  //post request for logout user
  router.post("/logout", async (req, res) => {
    console.log("sdsddsdsdsd", req.signedCookies);
    res.clearCookie("token").send("cookie cleared!");
  });

  //post request for reset password
  router.post("/resetpassword", async (req, res) => {
    try {
      const { isValid } = checkIfEmpty(req.body);
      const { email } = req.body;
      if (isValid) {
        const userData = await userModel.findOne({
          email,
        });
        if (userData) {
          const forgetPassHex = crypto
            .createHmac("sha256", "forgetPasswordHex")
            .update(userData.email)
            .digest("hex");
          await userModel.updateOne(
            {
              email,
            },
            {
              forgetPassHex,
            },
            {
              upsert: true,
            }
          );
          let transporter = nodemailer.createTransport({
            service: "gmail",
            host: smtp_host,
            port: smtp_port,
            secure: false,
            auth: {
              user: smtp_email,
              pass: smtp_password,
            },
          });

          let mailOptions = {
            from: smtp_email,
            to: userData.email,
            subject: "Reset your password",
            text: `Please click on this link to reset your password ${clientPath}/forgetpassword?hh=${forgetPassHex}`,
          };

          transporter.sendMail(mailOptions);

          res.send({
            code: 200,
            msg: "Please check your email for reset password link!",
          });
        } else {
          res.send({
            code: 404,
            msg: "Email not found!",
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid Data",
        });
      }
    } catch (e) {
      res.send({
        code: 444,
        msg: "Some error has occured!",
      });
    }
  });

  router.post("/editprofile", userAuthCheck, async (req, res) => {
    try {
      const { isValid } = checkIfEmpty(req.body.name, req.body.email);
      const { tokenData } = req.body;
      console.log("req.body", req.body);
      if (isValid) {
        await userModel.updateOne(
          {
            _id: tokenData.userid,
          },
          {
            name: req.body.name,
            email: req.body.email,
          }
        );
        res.send({
          code: 200,
          msg: "Profile updated successfully!",
        });
      } else {
        res.send({
          code: 400,
          msg: "Invalid Data",
        });
      }
    } catch (e) {
      console.log("error ", e);
      res.send({
        code: 444,
        msg: "Some error has occured!",
      });
    }
  });

  router.post("/createfolder", userAuthCheck, async (req, res) => {
    try {
      const { isValid } = checkIfEmpty(req.body.foldername);
      const { tokenData, foldername } = req.body;
      console.log("req.body", req.body);
      if (isValid) {
        await userModel.updateOne(
          {
            _id: tokenData.userid,
          },
          {
            $push: {
              folder: {
                foldername,
              },
            },
          }
        );
        res.send({
          code: 200,
          msg: "Profile updated successfully!",
        });
      } else {
        res.send({
          code: 400,
          msg: "Invalid Data",
        });
      }
    } catch (e) {
      console.log("error ", e);
      res.send({
        code: 444,
        msg: "Some error has occured!",
      });
    }
  });

  router.get("/getfolderlist", userAuthCheck, async (req, res) => {
    try {
      const { tokenData } = req.body;
      const folders = await userModel
        .findById(tokenData.userid, { folder: 1 })
        .populate("folder.files")
        .lean();
      res.send({ data: folders, code: 200 });
    } catch (e) {
      console.log("err", e);
      res.send({ code: 444, msg: "Some error has occured." });
    }
  });

  router.post("/getfolder", userAuthCheck, async (req, res) => {
    try {
      const { tokenData, folderId } = req.body;
      console.log("req.body", req.body);
      const folders = await userModel
        .find(
          { _id: tokenData.userid, "folder._id": folderId },
          { "folder.$": 1 }
        )
        .populate("folder.files")
        .lean();
      res.send({ data: folders, code: 200 });
    } catch (e) {
      console.log("err", e);
      res.send({ code: 444, msg: "Some error has occured." });
    }
  });

  router.post("/movefile", userAuthCheck, async (req, res) => {
    try {
      const { tokenData, newfolder, oldfolder, fileid } = req.body;
      console.log("req.body", req.body);

      await filesModel.findOneAndUpdate({ _id: fileid }, { folder: newfolder });

      await userModel.findOneAndUpdate(
        { _id: tokenData.userid, "folder._id": oldfolder },
        { $pull: { "folder.$.files": fileid } }
      );

      await userModel.findOneAndUpdate(
        { _id: tokenData.userid, "folder._id": newfolder },
        { $push: { "folder.$.files": fileid } }
      );

      res.send({ msg: "File successfully moved", code: 200 });
    } catch (e) {
      console.log("err", e);
      res.send({ code: 444, msg: "Some error has occured." });
    }
  });

  router.post("/uploaddoc", userAuthCheck, async (req, res) => {
    console.log("user profile pic uploadimg");
    const _id = req.body.tokenData.userid;
    console.log("req body", req.body);
    // console.log("i, ", req.body.i);
    uploadfile(req, res, async (err) => {
      if (err) {
        console.log(err);
        res.status(200).json({
          code: 400,
          msg: err,
        });
      } else {
        if (req.file == undefined) {
          res.statusMessage = "Some error has occured, please try again";
          res.status(200).json({
            code: 400,
            msg: res.statusMessage,
          });
        } else {
          let filePath = req.file.path.replace("public/", "");
          // if(req.i == 0){
          console.log("req.body", req.body);
          const { folder, docName, docDesc } = req.body;
          const filesData = new filesModel({
            folder,
            docName,
            docDesc,
            file: `${filePath.trim()}`,
            userId: _id,
          });
          const savedFile = await filesData.save();
          console.log("savedFile", savedFile);
          const dta = await userModel.findOneAndUpdate(
            {
              _id,
              "folder._id": folder,
            },
            {
              $push: {
                "folder.$.files": savedFile._id,
              },
            }
          );

          res.statusMessage = "Document uploaded Successfully.";
          res.status(200).json({
            code: 200,
            msg: res.statusMessage,
          });
        }
      }
    });
  });

  router.post("/changepassword", userAuthCheck, async (req, res) => {
    try {
      const { isValid } = checkIfEmpty(
        req.body.oldPassword,
        req.body.newPassword
      );
      const { tokenData } = req.body;
      console.log("req.body", req.body);
      if (isValid) {
        const userData = await userModel
          .findOne({ _id: tokenData.userid }, { password: 1 })
          .lean();
        console.log("userData => ", userData);
        const isPasswordValid = await verifyHash(
          req.body.oldPassword,
          userData.password
        );
        if (isPasswordValid) {
          const newhashedPassword = await hashPassword(req.body.newPassword);
          await userModel.updateOne(
            {
              _id: tokenData.userid,
            },
            {
              password: newhashedPassword,
            }
          );
          res.send({
            code: 200,
            msg: "Password updated successfully!",
          });
        } else {
          res.send({
            code: 400,
            msg: "Old password didn't match.",
          });
        }
      } else {
        res.send({
          code: 400,
          msg: "Invalid Data",
        });
      }
    } catch (e) {
      console.log("error ", e);
      res.send({
        code: 444,
        msg: "Some error has occured!",
      });
    }
  });

  router.get("/validateToken", userAuthCheck, async (req, res) => {
    try {
      const { tokenData } = req.body;
      const userData = await userModel
        .findById(tokenData.userid, { name: 1, email: 1, photo: 1 })
        .lean();
      res.send({ userData, code: 200 });
    } catch (e) {
      res.send({ code: 444, msg: "Some error has occured." });
    }
  });

  return router;
};

module.exports = usersRouter;
