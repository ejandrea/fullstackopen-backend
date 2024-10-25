require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_URI)
    .then((result) => console.log("connected to mongodb database"))
    .catch((error) =>
        console.log("error connecting to MongoDB:", error.message)
    );

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: [true, "Contact name required."],
    },
    number: {
        type: String,
        minLength: 8,
        required: [true, "Contact phone number required."],
        validate: {
            validator: (v) => /^\d{2,3}-\d{5,}$/.test(v),
            message: (props) => `${props.value} is not a correct phone number!`,
        },
    },
});

contactSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Contact", contactSchema);
