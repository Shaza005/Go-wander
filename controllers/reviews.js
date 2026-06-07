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

    // ⭐ VALIDATION FIX (IMPORTANT)
    const { rating, comment } = req.body.review;

    let errorMsg = null;

    if (!rating) {
        errorMsg = "Please select a rating";
    } else if (!comment || comment.trim() === "") {
        errorMsg = "Please add a comment";
    }

    if (errorMsg) {
        await listing.populate({
            path: "reviews",
            populate: { path: "author" }
        });

        return res.render("listings/show", {
            listing,
            errorMsg
        });
    }

    // ✅ CREATE REVIEW
    const newReview = new Review({
        rating,
        comment,
        author: req.user._id
    });

    await newReview.save();

    listing.reviews.push(newReview);

    await listing.save();

    req.flash("success", "New review created!");
    res.redirect(`/listings/${listing._id}`);
};