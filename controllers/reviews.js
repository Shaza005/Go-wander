const Review = require("../models/review.js");
const Listing = require("../models/listings.js");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // ❌ BLOCK OWNER FROM REVIEWING
    if (listing.owner.equals(req.user._id)) {
        req.flash("error", "You cannot review your own listing");
        return res.redirect(`/listings/${listing._id}`);
    }

    // ❌ PREVENT DUPLICATE REVIEWS
    const existingReview = await Review.findOne({
        author: req.user._id,
        _id: { $in: listing.reviews }
    });

    if (existingReview) {
        req.flash("error", "You have already reviewed this listing");
        return res.redirect(`/listings/${listing._id}`);
    }

    // ✅ CREATE REVIEW
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    await newReview.save();

    listing.reviews.push(newReview);

    await listing.save();

    req.flash("success", "New review created!");
    res.redirect(`/listings/${listing._id}`);
};


module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }

    // remove review reference from listing
    listing.reviews.pull(reviewId);
    await listing.save();

    // delete review document
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
};