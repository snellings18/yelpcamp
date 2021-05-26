const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

// You can use the following mongodb url for web building.
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database Connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "60a854e2c6d8b8bfd022c4e2",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorum eius aut ex quod veritatis, cumque eum tenetur? Perferendis, laudantium, laborum voluptatibus optio dolore sequi amet necessitatibus suscipit eum cupiditate ut?",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url:
          "https://res.cloudinary.com/dct4adnkg/image/upload/v1621875629/YelpCamp/pexels-photo-2603681_ytfta2.jpg",
          filename: "YelpCamp/vvnztyuigpf0rfadfppg",
        },
        {
          url:
          "https://res.cloudinary.com/dct4adnkg/image/upload/v1621875562/YelpCamp/pexels-photo-1061640_d5vruv.jpg",
          filename: "YelpCamp/txftiwdmebtpv4yluqw7",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
