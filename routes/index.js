var express = require("express");
var router = express.Router();
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const _ = require("lodash");
pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flying",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];
/* GET home page. */

router.get("/", function (req, res, next) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const filterName = req.query.search || "";
  const type = req.query.type;
  try {
    const database = JSON.parse(fs.readFileSync("db.json", "utf8"));
    let data = database.data;
    if (filterName) {
      const newData = data.filter((pkm) =>
        pkm.pokemon.toLowerCase().includes(filterName.toLowerCase()),
      );
      data = newData;
    }
    if (type) {
      const newData = data.filter(
        (pkm) => pkm.type_1 === type || pkm.type_2 === type,
      );
      data = newData;
    }

    const numberOfData = data.length;

    database.page = page;

    if (numberOfData > limit) {
      database.totalPages = Math.ceil(numberOfData / limit);
      const startPoint = (page - 1) * limit;
      const endPoint = startPoint + limit;
      const newData = data.slice(startPoint, endPoint);
      data = newData;
    } else {
      database.totalPages = 1;
    }
    database.data = data;
    res.status(200).send(database);
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
});

router.post("/", function (req, res, next) {
  try {
    const { body } = req;
    const { name, id, url_image, type_1, type_2 } = body;
    if (!name || !id || !url_image || !type_1) {
      throw new Error("name, id, url_image and type_1 must be provided");
    }

    if (!pokemonTypes.includes(type_1)) {
      throw new Error(
        "type_1 must be bug, dragon, fairy, fire, ghost, ground, normal, psychic, steel, dark, electric, fighting, flying, grass, ice, poison, rock, water",
      );
    }
    if (type_2 && !pokemonTypes.includes(type_2)) {
      throw new Error(
        "type_2 must be bug, dragon, fairy, fire, ghost, ground, normal, psychic, steel, dark, electric, fighting, flying, grass, ice, poison, rock, water or empty",
      );
    }
    const database = JSON.parse(fs.readFileSync("db.json", "utf8"));
    const data = database.data;
    const isExisted = data.find((pkm) => pkm.id === body.id);
    if (isExisted === undefined) {
      data.push(body);
      database.data = data;
      const response = {
        data: body,
        status: "Add Pokemon Success",
      };
      fs.writeFileSync("db.json", JSON.stringify(database));
      res.status(200).send(response);
    } else {
      throw new Error("Data pokemon already exists");
    }
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
});

router.get("/:id", function (req, res, next) {
  try {
    const database = JSON.parse(fs.readFileSync("db.json", "utf8"));
    const pkmId = req.params.id;
    const data = database.data;
    const numberOfPkms = data.length;
    const indexPkm = data.findIndex((pkm) => pkm.id === pkmId);
    if (indexPkm !== undefined) {
      const pkmDetail = data[indexPkm];
      const pkmPrev =
        indexPkm === 0 ? data[numberOfPkms - 1] : data[indexPkm - 1];
      const pkmNext =
        indexPkm === numberOfPkms - 1 ? data[0] : data[indexPkm + 1];
      const response = {
        data: [pkmPrev, pkmDetail, pkmNext],
      };
      res.status(200).send(response);
    } else {
      throw new Error("Can not find pokemon");
    }
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
});

router.put("/:id", function (req, res, next) {
  try {
    const { body } = req;
    const { name, id, url_image, type_1, type_2 } = body;
    if (!name || !id || !url_image || !type_1) {
      throw new Error("name, id, url_image and type_1 must be provided");
    }

    if (!pokemonTypes.includes(type_1)) {
      throw new Error(
        "type_1 must be bug, dragon, fairy, fire, ghost, ground, normal, psychic, steel, dark, electric, fighting, flying, grass, ice, poison, rock, water",
      );
    }
    if (type_2 !== "NA" && !pokemonTypes.includes(type_2)) {
      throw new Error(
        "type_2 must be bug, dragon, fairy, fire, ghost, ground, normal, psychic, steel, dark, electric, fighting, flying, grass, ice, poison, rock, water or empty",
      );
    }
    const database = JSON.parse(fs.readFileSync("db.json", "utf8"));
    const pkmId = req.params.id;
    const data = database.data;
    data.forEach((pkm, index) => {
      if (pkm.id === pkmId) {
        data[index] = { ...pkm, ...body };
      }
    });
    database.data = data;
    fs.writeFileSync("db.json", JSON.stringify(database));
    const response = {
      data: body,
      status: "Update Pokemon Success",
    };
    res.status(200).send(response);
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
});

router.delete("/:id", function (req, res, next) {
  try {
    const database = JSON.parse(fs.readFileSync("db.json", "utf8"));
    const pkmIdDelete = req.params.id;
    const data = database.data;

    const indexPkm = data.findIndex((pkm) => pkm.id === pkmIdDelete);

    if (indexPkm) {
      data.splice(indexPkm, 1);
    } else {
      throw new Error("Pokemon deleted not found!");
    }

    database.data = data;
    fs.writeFileSync("db.json", JSON.stringify(database));
    const response = {
      status: "Delete Pokemon Success",
    };
    res.status(200).send(response);
  } catch (error) {
    error.statusCode = 400;
    next(error);
  }
});

module.exports = router;
