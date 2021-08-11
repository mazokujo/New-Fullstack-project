// require Campground model
const Campground = require('../models/Campground');
// cloudinary
const { cloudinary } = require("../cloudinary");
// require mapbox
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeoCoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}
module.exports.createCampground = async (req, res) => {
    const geolocation = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const newCampground = await new Campground(req.body.campground);
    newCampground.geometry = geolocation.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    //to add id of logedin user to object req.user._id
    newCampground.owner = req.user._id;
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', 'you made a new campground')
    res.redirect(`/campground/${newCampground._id}`);
}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const item = await Campground.findById(id);
    if (!item) {
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campground')
    }
    res.render('campgrounds/edit', { item });
}
module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const item = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    item.images.push(...imgs);
    await item.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await item.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }, { new: true })
    }
    res.redirect(`/campground/${item._id}`)
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params
    const item = await Campground.findById(id).populate({
        path: 'review',
        populate: {
            path: 'owner'
        }
    }).populate('owner');
    console.log(item);
    if (!item) {
        req.flash('error', 'Cannot find that campground')
        res.redirect('/campground')
    }
    res.render('campgrounds/show', { item });
}
module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const deleteCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}