const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing, redirectUrl} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

// Index and Create Route
router
  .route("/")
  .get( wrapAsync(listingController.index))
  .post( isLoggedIn,
     upload.single("listing[image]"),
     validateListing,
      wrapAsync(listingController.createListing)
    );

    
// Category Route 
router.get('/category', redirectUrl,wrapAsync(listingController.listingCategory));

// New Route 
router.get("/new", redirectUrl,listingController.renderNewForm);    

// Search Route
router.get("/search", redirectUrl,wrapAsync(listingController.searchListing));





// Show, Update and Delete Route
router.route("/:id")
.get(redirectUrl,wrapAsync(listingController.showListing))   
.put( isLoggedIn, isOwner,upload.single("listing[image]"),validateListing, wrapAsync(listingController.updateListing))
.delete( isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner,
    wrapAsync(listingController.renderEditForm));

module.exports = router;

