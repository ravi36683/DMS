//imports
import mongoose from "mongoose";

const Schema = mongoose.Schema;

//creating mongo database schema
const filesSchema = new Schema({
  docName: {
    type: String,
    required: [true, "Name is required!"],
  },
  docDesc: {
    type: String,
  },

  file: {
    type: String,
    required: [true, "folder is required!"],
  },

  folder: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "folder is required!"],
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: [true, "userid is required!"],
  },
});

const filesModel = mongoose.model("files", filesSchema);

export default filesModel;
