import mongoose from "mongoose";

const DB = () => {
  if (process.env.MONGODB) {
    return mongoose.connect(process.env.MONGODB);
  } else {
    return new Promise((resolve, reject) => {
      reject("Set MONGODB url in env");
    });
  }
};

export default DB;
