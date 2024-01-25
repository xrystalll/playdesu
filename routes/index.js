import express from "express";

import * as GamesController from "../modules/controllers/GamesController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    type: "success",
    code: 200,
    message: "Welcome to the playです root path",
  });
});

router.get("/allgames", GamesController.getAllGames);
router.get("/game", GamesController.getGame);
router.post("/creategame", GamesController.createGame);

router.get("*", (req, res) => {
  res.json({
    type: "error",
    code: 404,
    message: "Not found",
  });
});

export default router;
