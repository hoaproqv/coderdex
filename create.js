var express = require("express");
const fs = require("fs");

const handle = () => {
  const database = JSON.parse(fs.readFileSync("db.json", "utf8"));
  let data = database.data;
  data.forEach((item) => {
    item.url_image = `https://res.cloudinary.com/dinzblou9/image/upload/v1691657349/pokemon/${item.url_image}`;
  });
  database.data = data;
  fs.writeFileSync("db.json", JSON.stringify(database));
};

handle();
