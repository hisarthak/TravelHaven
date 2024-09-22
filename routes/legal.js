const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const legalController = require("../controllers/legal.js");
const {redirectUrl} = require("../middleware.js");


router.get("/privacy", redirectUrl,legalController.privacy );

router.get("/terms", redirectUrl,legalController.terms );

router.get("/hidden",legalController.hidden)

module.exports = router;