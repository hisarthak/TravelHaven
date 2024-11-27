const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});


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
            res.redirect("/");
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
        res.redirect("/");
    };
    
   
module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist");
        res.redirect("/");
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
    res.redirect("/");
}

// module.exports.searchListing =  async (req, res) => {
//     const searchQ = req.query.query;
//     const searchQuery = searchQ.trim();
//     const selectedCategory = req.query.category || '';

//       // Search the listings based on the search query
//       const results = await Listing.find({
//         $or: [
//           { location: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search for location
//           { country: { $regex: searchQuery, $options: 'i' } },   // Case-insensitive search for country
//           { title: { $regex: searchQuery, $options: 'i' } }      // Case-insensitive search for title
//         ]
//       });
  
//       // Render the search results (assuming you have a search-results view)
//       res.render("listings/search.ejs", { searchResults: results || [], selectedCategory, searchQuery });

//   }


// module.exports.searchListing = async (req, res) => {
//     const searchQ = req.query.query || '';
//     const selectedCategory = req.query.category || '';

//     try {
//         // Perform fuzzy search
//         const results = await Listing.fuzzySearch(searchQ);
//         console.log(results);

//         // Optionally, filter by category if provided
//         const filteredResults = selectedCategory
//             ? results.filter(listing => listing.category === selectedCategory)
//             : results;

//         // Render the search results
//         res.render("listings/search.ejs", {
//             searchResults: filteredResults || [],
//             selectedCategory,
//             searchQuery: searchQ.trim(),
//         });
//     } catch (err) {
//         console.error("Error during search:", err);
//         res.status(500).send("An error occurred while searching.");
//     }
// };

module.exports.searchListing = async (req, res) => {
    const searchQ = req.query.query || '';
    const searchQuery = searchQ.trim();
    const selectedCategory = req.query.category || '';
const secondSearch = req.query.secondSearch;

if(secondSearch){
    const combinedResults = await Listing.find({
        $or: [
          { location: { $regex: searchQuery, $options: 'i' } }, // Case-insensitive search for location
          { country: { $regex: searchQuery, $options: 'i' } },   // Case-insensitive search for country
          { title: { $regex: searchQuery, $options: 'i' } }      // Case-insensitive search for title
        ]
      });

      let searchInstead = 0;
      let suggestion;
      if(combinedResults.length>0){
       suggestion =  {
        value: searchQuery, // Use the search query itself as the suggestion
        field: 'title', // Assume title as the field
    };
}else{
    suggestion = null;
   
}
      // Render the search results (assuming you have a search-results view)
      return res.render('listings/search.ejs', {
        searchResults: combinedResults || [],
        selectedCategory,
        searchQuery: searchQuery || "",
        searchInstead,
        suggestion: suggestion || null , // Pass suggestion to the view
    });
    
}
const fuzzyResults = await Listing.fuzzySearch(searchQuery);
    // Perform regex search
  
    let regexquery = searchQuery;
    const regexResults = await Listing.find({
         
            title: { $regex: regexquery, $options: 'i' } 
        
    });
    // Function to calculate similarity threshold
    const calculateSimilarityThreshold = (string) => {
        return Math.ceil(string.length * 0.4); // 40% of the string length
    };

    // Initialize variables for suggestion and minimum edit distance
    let suggestion = null;
    let minEditDistance = Infinity; // Initialize with a very high value
    let closestMatch = null;

    if (fuzzyResults.length > 0) {
        const topMatch = fuzzyResults[0]; // Get the best match

        // Check each relevant field for closeness to the query
        const fields = ['title', 'location', 'country'];
        for (const field of fields) {
            if (topMatch[field]) {
                const editDistance = calculateEditDistance(
                    searchQuery.toLowerCase(),
                    topMatch[field].toLowerCase()
                );
                const similarityThreshold = calculateSimilarityThreshold(topMatch[field]) || 3;
               
                if (editDistance < minEditDistance && editDistance<=similarityThreshold) {
                    minEditDistance = editDistance;
                    closestMatch = {
                        value: topMatch[field], // Store the closest match
                        field, // Track the matching field
                    };
                }
            }
        }
    }

    
    let regexSearchResults = [];
    if (closestMatch) {
        suggestion = closestMatch;
        regexSearchResults = await Listing.find({
            $or: [
                { location: { $regex: closestMatch.value, $options: 'i' } },
                { country: { $regex: closestMatch.value, $options: 'i' } },
                { title: { $regex: closestMatch.value, $options: 'i' } },
            ],
        });
    }
    

    let searchInstead = 1;
   

if (closestMatch && closestMatch.value.trim().toLowerCase() === searchQuery.toLowerCase()) {
    searchInstead = 0;
}

if(closestMatch==null){
    searchInstead = 0;
}

if (regexSearchResults.length === 0 && regexResults.length > 0) {
    suggestion = {
        value: searchQuery, // Use the search query itself as the suggestion
        field: 'title', // Assume title as the field
    }; 
    
   
}
   
    
    const combinedResults = mergeResults(regexResults, regexSearchResults);
   

    // Render the results
    return res.render('listings/search.ejs', {
        searchResults: combinedResults || [],
        selectedCategory,
        searchQuery: searchQuery || "",
        searchInstead,
        suggestion: suggestion || null , // Pass suggestion to the view
    });
};

// Helper function to merge results and remove duplicates
function mergeResults(array1, array2) {
    const merged = [...array1, ...array2];
    // Use a Map to remove duplicates based on the unique `_id` field
    const uniqueResults = new Map();
    for (const item of merged) {
        uniqueResults.set(item._id.toString(), item); // Ensure unique by `_id`
    }
    return Array.from(uniqueResults.values());
}


// Helper function to calculate edit distance (Levenshtein distance)
function calculateEditDistance(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
        Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // Deletion
                matrix[i][j - 1] + 1, // Insertion
                matrix[i - 1][j - 1] + cost // Substitution
            );
        }
    }
    return matrix[a.length][b.length];
}


  module.exports.listingCategory =  async (req, res) => {

    const selectedCategory = req.query.category || '';
   
    if(selectedCategory==="explore"){
       
        return res.redirect("/")
    }
  
    // Search the listings based on the selected category
    const results = await Listing.find({
        category: selectedCategory // Match listings by category
    });
  
    // Render the search results page (make sure you have a search.ejs or similar view)
    res.render('listings/search.ejs', {
         searchResults: results || [] ,
          selectedCategory,
          searchInstead: 0,
          suggestion: null ,
        });
  }

