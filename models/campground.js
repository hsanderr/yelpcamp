const mongoose = require('mongoose');
const Review = require('./review');
const { Schema } = mongoose;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload');
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/campgrounds/${this.id}">${this.title}</a></strong>
    <p>Price: $${this.price}</p>`;
});

CampgroundSchema.post('findOneAndDelete', async doc => {
    if (doc) await Review.remove({ _id: { $in: doc.reviews } });
});

module.exports = mongoose.model('Campground', CampgroundSchema);
