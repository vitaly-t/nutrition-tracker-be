const express = require("express");
const db = require("./foodItemDB");
const { getFoodHandler } = require("../fatsecret/fatsecret");
const mapFirebaseIDtoUserID = require("../../middleware/mapFirebaseIDtoUserID");

router = express.Router();

router.get(
  "/getfooditem/:foodlogID/user/:user_id",
  mapFirebaseIDtoUserID,
  async (req, res, next) => {
    const { user_id, foodlogID } = req.params;

    try {
      const [foodItem] = await db.getFoodItem(foodlogID, user_id);
      res.locals.foodItem = foodItem;
      next();
    } catch (err) {
      res.status(500).json({
        errorMessage: "Could not retrieve food item"
      });
    }
  },
  async (req, res) => {
    let foodItem = res.locals.foodItem;

    try {
      req.params.food_id = foodItem.fatsecret_food_id;
      res.locals.returnData = true;

      const fatSecretFoodData = await getFoodHandler(req, res);

      res.status(200).json({
        foodItem,
        fatSecretFoodData
      });
    } catch (err) {
      res.status(500).json({
        errorMessage: "Could not retrieve fat secret food data"
      });
    }
  }
);

router.put(
  "/updatefooditem/:foodLogID/user/:user_id",
  mapFirebaseIDtoUserID,
  async (req, res) => {
    const { foodLogID, user_id } = req.params;
    const updatedRecord = req.body;

    try {
      // call to db to update item;
      const item = await db.updateFoodItem(foodLogID, user_id, updatedRecord);
      res.status(201).json(item);
    } catch ({ message }) {
      res.status(500).json(message);
    }
  }
);

router.delete(
  "/deletefooditem/:foodLogID/user/:user_id",
  mapFirebaseIDtoUserID,
  async (req, res) => {
    const { foodLogID, user_id } = req.params;

    try {
      // call to db to delete record;
      const deletedRecord = await db.deleteFoodItem(foodLogID, user_id);
      res.status(200).json(deletedRecord);
    } catch ({ message }) {
      res.status(500).json(message);
    }
  }
);

function getFatSecretData(req, res) {
  const food_id = req.param.food_id;

  req.url = `/fatsecret/get-food/${food_id}`;

  return express.handle(req, res);
}

module.exports = router;

// const { fatsecret_food_id } = foodItem;
//now that we have our data from the db we need to go and get the fatsecret_food_id for this record and return that info.
// try {
//   var data;
//   await fetch(
//     `${BASE_URL}/fatsecret/get-food/${fatsecret_food_id}` //make a fetch request from our api and and get info
//   )
//     .then(checkStatus)
//     .then(res => res.json())
//     .then(json => (data = json)); // json is the actaul data being returned from out api call
//   const dataAtIndexOne = data[0];
