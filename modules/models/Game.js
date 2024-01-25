import { model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const gameSchema = new Schema({
  createdAt: Date,
  displayName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    lowercase: true,
  },
  color: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  backdrop: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  studio: {
    type: String,
    required: true,
  },
  gameSystem: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  size: String,
  screenshots: [String],
});

gameSchema.plugin(mongoosePaginate);
gameSchema.index({ name: "text", displayName: "text" });

export default model("Game", gameSchema);
