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
        //create random price
        const randomprice = Math.floor(Math.random() * 1500) + 500;
        //new campground containing cities name and state name
        const camp = new Campground({
            //associate all campgrounds to user id below
            owner: '6107c21bc166683ffc99258d',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            //sample function is used to pick element at random inside descriptors and places arrays
            title: `${sample(descriptors)} ${sample(places)}`,
            //generate random pictures from unsplash
            images: [
                {
                    url: 'https://res.cloudinary.com/dcsoakvpl/image/upload/v1628596672/Yelpcamp/oici9z9m63lnkqn0mphg.jpg',
                    filename: 'Yelpcamp/oici9z9m63lnkqn0mphg'
                },
                {
                    url: 'https://res.cloudinary.com/dcsoakvpl/image/upload/v1628596672/Yelpcamp/ntk40oprhlzfwjrcwxxv.jpg',
                    filename: 'Yelpcamp/ntk40oprhlzfwjrcwxxv'
                },
                {
                    url: 'https://res.cloudinary.com/dcsoakvpl/image/upload/v1628596672/Yelpcamp/lnyz9snieucjoeo4czw8.jpg',
                    filename: 'Yelpcamp/lnyz9snieucjoeo4czw8'
                }
            ],
            geometry: { "type": "Point", "coordinates": [cities[random1000].longitude, cities[random1000].latitude] },
            price: randomprice,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ab asperiores molestias facilis ullam placeat consequatur omnis quos nam odit quis sunt, veritatis nobis! Eveniet animi explicabo recusandae deserunt nam eum?'

        });
        // save new datas in Mongo
        await camp.save();
    }
}
seedDB();
