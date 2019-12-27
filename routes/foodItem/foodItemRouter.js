const express = require("express");
const { getFoodHandler } = require("../fatsecret/fatsecret");
const db = require("./foodItemDB");
const mapFirebaseIDtoUserID = require("../../middleware/mapFirebaseIDtoUserID");

router = express.Router();

router.get(
  "/getfooditem/:foodlogID/user/:user_id",
  mapFirebaseIDtoUserID,
  async (req, res, next) => {
    const { user_id, foodlogID } = req.params;

    try {
      const [foodItem] = await db.getFoodItem(foodlogID, user_id);
      // creates a variable scoped to this request to
      // be consumed by the subsequent middle-ware function call.
      // stores the foodItem returned from the above query
      res.locals.foodItem = foodItem;
      next();
    } catch (err) {
      res.status(500).json({
        errorMessage: "Could not retrieve food item"
      });
    }
  },
  getAllServingTypes
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

/********************************************************
 *                  GET FAT SECRET DATA                 *
 ********************************************************/
async function getAllServingTypes(req, res) {
  // retrieves the foodItem variable
  const foodItem = res.locals.foodItem;
  req.params.food_id = foodItem.fatsecret_food_id;
  // creates a new variable called returnData
  // to be consumed by getFoodHandler below
  // redirects getFoodHandler to return the data
  // instead of sending the data in a response
  res.locals.returnData = true;

  try {
    const servingTypes = await getFoodHandler(req, res);

    res.status(200).json({
      foodItem,
      servingTypes
    });
  } catch (err) {
    res.status(500).json({
      errorMessage: "Could not retrieve fat secret food data"
    });
  }
}

module.exports = router;
