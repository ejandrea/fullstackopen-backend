require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("connected to mongodb database"));

const contactSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String,
    },
    number: Number,
});

const Contact = mongoose.model("Contact", contactSchema);

// adding new contact
// const newContact = new Contact({
//     name: {
//         first: "EJ Andrea",
//         last: "Canatoy",
//     },
//     number: 19992254187,
// });

// newContact.save().then(() => {
//     console.log(`successfully added ${newContact}`);
//     mongoose.connection.close();
// });

// listing all contacts
Contact.find({}).then((contacts) => {
    contacts.forEach((contact) => console.log(contact));
    mongoose.connection.close();
});
