const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async (req, res)=>{
    const selectedCategory = req.query.category || 'explore';
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings, selectedCategory });
     };

     module.exports.renderNewForm = (req, res) => {
        if (!req.isAuthenticated()) {
            req.flash('error', 'Please log in or sign up to create a new listing.');
        }
        res.render("listings/new.ejs", { isLoggedIn: req.isAuthenticated(), error: req.flash('error') });
    };

module.exports.showListing = async (req,res)=>{
        let {id} = req.params;
        const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
        if(!listing) {
            req.flash("error", "Listing you requested for does not exist");
            res.redirect("/listings");
        }
        // console.log(listing);
      res.render("listings/show.ejs", {listing});
    }

module.exports.createListing = async (req, res, next) => {
        // Geocoding the location
        let response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1
            })
            .send();
    
        // Extracting image details
        let url = req.file.path;
        let filename = req.file.filename;
    
        // Get the selected categories from the form
        const category = req.body.listing.category; // Make sure to access it correctly
    
        // Validate listing data
        if (!req.body.listing) {
            return res.status(400).send("Send valid data for listing");
        }
    
        
        if (category && category.includes('trending')) {
            return res.status(403).send('You cannot add items to the trending category.');
        }

        if (category && category.includes('new')) {
            return res.status(403).send('You cannot add items to the new category.');
        }
    
        // Create new listing with categories
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };
        newListing.geometry = response.body.features[0].geometry;
    
        // Save the listing to the database
        let savedListing = await newListing.save();
        console.log(savedListing);
    
        // Flash success message and redirect
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    };
    
   
module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs",{listing, originalImageUrl});
}

module.exports.updateListing =  async (req, res)=>{

    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();
        let {id} = req.params;

        const category = req.body.listing.category;
       
    
        // Validate listing data
        if (!req.body.listing) {
            return res.status(400).send("Send valid data for listing");
        }
    
        // Check if the 'trending' category is included in the user selection
        if (category && category.includes('trending')) {
            return res.status(403).send('You cannot add items to the trending category.');
        }

        if (category && category.includes('new')) {
            return res.status(403).send('You cannot add items to the new category.');
        }
    
        console.log(req.body.listing);
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing},);
 
    listing.geometry = response.body.features[0].geometry;


    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename}
    }

    await listing.save();

    req.flash("success", "Listing Updated!"); 
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

module.exports.searchListing =  async (req, res) => {
    const searchQuery = req.query.query;
    const selectedCategory = req.query.category || '';

      // Search the listings based on the search query
      const results = await Listing.find({
        $or: [
          { location: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search for location
          { country: { $regex: searchQuery, $options: 'i' } },   // Case-insensitive search for country
          { title: { $regex: searchQuery, $options: 'i' } }      // Case-insensitive search for title
        ]
      });
  
      // Render the search results (assuming you have a search-results view)
      res.render("listings/search.ejs", { searchResults: results || [], selectedCategory, searchQuery });

  }

  module.exports.listingCategory =  async (req, res) => {

    const selectedCategory = req.query.category || '';
    const allListings = await Listing.find({});

    if(selectedCategory=="explore"){
        res.render("listings/index.ejs", {allListings, selectedCategory });
    }
  
    // Search the listings based on the selected category
    const results = await Listing.find({
        category: selectedCategory // Match listings by category
    });
  
    // Render the search results page (make sure you have a search.ejs or similar view)
    res.render('listings/search.ejs', { searchResults: results || [] , selectedCategory});
  }

