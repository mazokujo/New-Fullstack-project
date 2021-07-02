//establish connection with mongoose
const mongoose = require('mongoose');
// export Campground model from campground.js
const Campground = require('../models/Campground');
// export array of cities from city.js
const cities = require('./cities')
// export desciptors and places from seedhelpers.js

const { descriptors, places } = require('./seedHelpers');
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
// const sample is a function that can extract any element inside the array.
const sample = array => array[Math.floor(Math.random() * array.length)];
// we create 50 new campgrounds
const seedDB = async () => {
    //delete everything in the database
    await Campground.deleteMany({});
    // create 50 loops(for 50 city picked at random)
    for (let i = 0; i < 50; i++) {
        //the const cities contains a 1000 cities, therefore we create const random1000
        //random 1000 can generate number between 0 to 1000
        const random1000 = Math.floor(Math.random() * 1000);
        //new campground containing cities name and state name
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            //sample function is used to pick element at random inside descriptors and places arrays
            title: `${sample(descriptors)} ${sample(places)}`
        });
        // save new datas in Mongo
        await camp.save();
    }
}
seedDB();
