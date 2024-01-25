import fs from "fs";
import createError from "http-errors";
import Vibrant from "node-vibrant";
import multer from "multer";
import sharp from "sharp";

import Game from "../models/Game.js";
import storage from "../utils/storage.js";
import checkFileExec from "../utils/checkFileExec.js";

const upload = multer({
  storage: storage("uploads", "file"),
  fileFilter: (req, file, callback) => checkFileExec(file, callback),
}).fields([
  { name: "rom", maxCount: 1 },
  { name: "poster", maxCount: 1 },
  { name: "backdrop", maxCount: 1 },
  { name: "screenshots", maxCount: 10 },
]);

export const getAllGames = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, pagination = true } = req.query;

    let games;
    if (sort === "downloads") {
      games = await Game.paginate(
        {},
        {
          sort: { downloads: -1 },
          page,
          limit,
          pagination: JSON.parse(pagination),
        }
      );
    } else if (sort === "rating") {
      games = await Game.paginate(
        {},
        {
          sort: { rating: -1 },
          page,
          limit,
          pagination: JSON.parse(pagination),
        }
      );
    } else {
      games = await Game.paginate(
        {},
        {
          sort: { createdAt: -1 },
          page,
          limit,
          pagination: JSON.parse(pagination),
        }
      );
    }

    res.json(games);
  } catch (err) {
    next(createError.InternalServerError(err));
  }
};

export const getGame = async (req, res, next) => {
  try {
    const { gameId } = req.query;

    if (!gameId)
      return next(createError.BadRequest("gameId must not be empty"));

    const game = await Game.findById(gameId);

    res.json(game);
  } catch (err) {
    next(createError.InternalServerError(err));
  }
};

export const createGame = async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err) return next(createError.BadRequest(err.message));

      const { displayName, description, releaseYear, genre, studio, price, gameSystem } =
        req.body;

      if (!displayName)
        return next(createError.BadRequest("displayName must not be empty"));
      if (!description)
        return next(createError.BadRequest("description must not be empty"));
      if (!studio)
        return next(createError.BadRequest("studio must not be empty"));
      if (!gameSystem)
        return next(createError.BadRequest("gameSystem must not be empty"));
      if (!releaseYear)
        return next(createError.BadRequest("releaseYear must not be empty"));
      if (!genre)
        return next(createError.BadRequest("genre must not be empty"));

      const now = new Date().toISOString();
      const lowerName = displayName
        .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();
      const screenshots = req.files?.screenshots
        ? req.files.screenshots
            .map((i) => i.filename)
            .map((i) => "/uploads/" + i)
        : [];

      const resizeBackdrop = await sharp(req.files.backdrop[0].path)
        .resize(960, 540)
        .toBuffer();

      fs.writeFileSync(req.files.backdrop[0].path, resizeBackdrop);

      const resizePoster = await sharp(req.files.poster[0].path)
        .resize(392, 220)
        .toBuffer();

      fs.writeFileSync(req.files.poster[0].path, resizePoster);

      const vibrantData = await Vibrant.from(
        "./public/uploads/" + req.files.poster[0].filename
      ).getPalette();

      const newGame = new Game({
        createdAt: now,
        displayName, // required
        name: lowerName,
        color: vibrantData.Vibrant.hex,
        description, // required
        backdrop: "/uploads/" + req.files.backdrop[0].filename, // required
        poster: "/uploads/" + req.files.poster[0].filename, // required
        file: "/uploads/" + req.files.rom[0].filename, // required
        studio, // required
        gameSystem, // required
        releaseYear, // required
        genre, // required
        price,
        size: req.files.rom[0].size,
        screenshots,
      });

      const game = await newGame.save();

      res.json(game);
    });
  } catch (err) {
    next(createError.InternalServerError(err));
  }
};
