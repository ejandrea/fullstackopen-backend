require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('connected to mongodb database'))

const contactSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String,
  },
  number: Number,
})

const Contact = mongoose.model('Contact', contactSchema)

// listing all contacts
Contact.find({}).then((contacts) => {
  contacts.forEach((contact) => console.log(contact))
  mongoose.connection.close()
})
