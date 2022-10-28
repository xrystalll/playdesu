import { model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const gameSchema = new Schema({
  createdAt: Date,
  updatedAt: Date,
  displayName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    lowercase: true,
  },
  colors: [String],
  banner: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  screenshots: [String],
  year: Number,
  genre: [String],
  studio: String,
  price: {
    type: Number,
    default: 0,
  },
  system: {
    type: String,
    required: true,
  },
  size: Number,
  file: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
});

gameSchema.plugin(mongoosePaginate);
gameSchema.index({ name: "text", displayName: "text" });

export default model("Game", gameSchema);
