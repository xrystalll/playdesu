import createError from "http-errors";
import Vibrant from "node-vibrant";
import multer from "multer";

import Game from "../models/Game.js";
import storage from "../utils/storage.js";
import checkFileExec from "../utils/checkFileExec.js";

const upload = multer({
  storage: storage("uploads", "file"),
  fileFilter: (req, file, callback) => checkFileExec(file, callback),
}).fields([
  { name: "rom", maxCount: 1 },
  { name: "banner", maxCount: 1 },
  { name: "cover", maxCount: 1 },
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

      const { displayName, description, year, genre, studio, price, system } =
        req.body;

      if (!displayName)
        return next(createError.BadRequest("displayName must not be empty"));
      if (!description)
        return next(createError.BadRequest("Description must not be empty"));
      if (!system)
        return next(createError.BadRequest("System must not be empty"));

      const now = new Date().toISOString();
      const lowerName = displayName.toLowerCase().replace(/\s+/g, "");
      const screenshots = req.files?.screenshots
        ? req.files.screenshots
            .map((i) => i.filename)
            .map((i) => "/uploads/" + i)
        : [];
      const genreArray = genre ? genre.split(" ") : [];

      const vibrantData = await Vibrant.from(
        "./public/uploads/" + req.files.banner[0].filename
      ).getPalette();

      const newGame = new Game({
        createdAt: now,
        updatedAt: now,
        displayName, // required
        name: lowerName,
        colors: [
          vibrantData.Vibrant.hex,
          vibrantData.DarkVibrant.hex,
          vibrantData.LightVibrant.hex,
          vibrantData.Muted.hex,
          vibrantData.DarkMuted.hex,
          vibrantData.LightMuted.hex,
        ],
        banner: "/uploads/" + req.files.banner[0].filename, // required
        cover: "/uploads/" + req.files.cover[0].filename, // required
        description, // required
        screenshots,
        year,
        genre: genreArray,
        studio,
        price,
        system, // required
        size: req.files.rom[0].size,
        file: "/uploads/" + req.files.rom[0].filename, // required
      });

      const game = await newGame.save();

      res.json(game);
    });
  } catch (err) {
    console.log(err);
    next(createError.InternalServerError(err));
  }
};
