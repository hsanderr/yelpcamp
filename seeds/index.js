const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

main().catch(err => console.log(err));

async function main() {
    const connection = await mongoose.connect('mongodb://localhost:27017/yelp-camp');
    console.log('Database connected\n');

    const getRandomElement = array => array[Math.floor(Math.random() * array.length)];

    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '621cfa761cd73dfd338eef95',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${getRandomElement(descriptors)} ${getRandomElement(places)}`,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dtwotjjae/image/upload/v1646157143/YelpCamp/waabyaz5i5ckbsjt2umh.jpg',
                    filename: 'YelpCamp/waabyaz5i5ckbsjt2umh'
                },
                {
                    url: 'https://res.cloudinary.com/dtwotjjae/image/upload/v1646157142/YelpCamp/olswtjlrm8eycrsmq92y.jpg',
                    filename: 'YelpCamp/olswtjlrm8eycrsmq92yh'
                }
            ],
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sapiente, illo non. Error sint suscipit eum vitae commodi quae necessitatibus facere, veritatis repellendus delectus! Delectus sint eius voluptatibus pariatur perspiciatis blanditiis.',
            price
        });
        await camp.save();
    }
    mongoose.connection.close();
}