const mongoose = require("mongoose");
const { cloudinary } = require("../cloudinary");
const Review = require("./review");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

// To resize images everytime you call 'thumbnail'.
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_100,h_75,dpr_7.0");
});

/* Mongoose will not include virtuals by default when converting
    a document to JSON. So you  must set the 'options' to toJSON
    and set 'virtuals' to 'true'. See the Mongoose docs for more 
    information: {virtuals in JSON} @ 
    https://mongoosejs.com/docs/tutorials/virtuals.html#:~:text=By%20default%2C%20Mongoose%20does%20not,convert%20a%20document%20to%20JSON.&text=json()%20function%2C%20virtuals%20will,to%20%7B%20virtuals%3A%20true%20%7D%20..
*/

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
}, opts);

// Adds the popup Marker on the Cluster Map on the index.ejs page.
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 50)}...`;
});


// To Delete a Campground and all data along with it (like ratings,reviews, and images.):
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
  if (doc.images) {
    for (const img of doc.images) {
      await cloudinary.uploader.destroy(img.filename);
    }
  }
});

CampgroundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Campground", CampgroundSchema);
