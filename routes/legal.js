const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const legalController = require("../controllers/legal.js");


router.get("/privacy", legalController.privacy );

router.get("/terms", legalController.terms );

router.get("/hidden", legalController.hidden)

module.exports = router;