require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_URI)
    .then((result) => console.log("connected to mongodb database"))
    .catch((error) =>
        console.log("error connecting to MongoDB:", error.message)
    );

const contactSchema = new mongoose.Schema({
    name: String,
    number: Number,
});

contactSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Contact", contactSchema);
