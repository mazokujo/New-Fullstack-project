const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
// require Campground model
const Campground = require('./models/Campground');
//require method override for put, push, delete route
const methodOverride = require('method-override');

//mongoose connection, our database is yelpcamp
mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// handling error in mongoose connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Database connected")
});
//use method override
app.use(methodOverride('_method'));

// setting ejs in view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// we need to parse req.body to make a post request
app.use(express.urlencoded({ extended: true }));

//home
app.get('/', (req, res) => {
    res.render('home')
});

//establishing port connection
app.listen(8080, () => {
    console.log('Receiving from port 8080');
});
//create a new campground
app.get('/campground/new', (req, res) => {
    res.render('campgrounds/new');
})
app.post('/campground', async (req, res) => {
    const newCampground = await new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campground/${newCampground._id}`);
});
//create a new campground
// app.get('/newcamp', async (req, res) => {
//     const camp = new Campground({ title: 'bay area', description: 'affordable' });
//     const newCamp = await camp.save();
//     console.log(newCamp)
//     // res.render('/camp', { newCamp });
// })
// Edit a campground
app.get('/campground/:id/edit', async (req, res) => {
    const { id } = req.params
    const item = await Campground.findById(id);
    res.render('campgrounds/edit', { item });
});
app.put('/campground/:id', async (req, res) => {
    const { id } = req.params;
    const item = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true });
    res.redirect(`/campground/${item._id}`)
})

// create a route to all campgrounds
app.get('/campground', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});
// Delete Campground
app.delete('/campground/:id', async (req, res) => {
    const { id } = req.params;
    const deleteCamp = await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
})
// create a show route 
app.get('/campground/:id', async (req, res) => {
    const { id } = req.params
    const item = await Campground.findById(id);
    res.render('campgrounds/show', { item });
})


