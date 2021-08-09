// require Campground model
const Campground = require('../models/Campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createNewForm = async (req, res) => {
    //if (!req.body.campground) throw new AppError('invalid Campground', 400)
    // const result = campgroundSchema.validate(req.body);
    // console.log(result);
    const newCampground = await new Campground(req.body.campground);
    //to add id of logedin user to object req.user._id
    newCampground.owner = req.user._id;
    await newCampground.save();
    req.flash('success', 'you made a new campground')
    res.redirect(`/campground/${newCampground._id}`);
}
module.exports.createCampground = async (req, res) => {
    //if (!req.body.campground) throw new AppError('invalid Campground', 400)
    // const result = campgroundSchema.validate(req.body);
    // console.log(result);
    const newCampground = await new Campground(req.body.campground);
    //to add id of logedin user to object req.user._id
    newCampground.owner = req.user._id;
    await newCampground.save();
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
    const item = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true });
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