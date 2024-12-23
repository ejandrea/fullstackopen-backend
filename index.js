const express = require('express')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var cors = require('cors')
const Contact = require('./models/contact')
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

morgan.token('contacts', (req) => {
  return JSON.stringify(req.body)
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :contacts'
  )
)

const findByName = async (name) => {
  return Contact.find({ name: name }).then((result) => result)
}

app.get('/api/persons', (request, response, next) => {
  Contact.find({})
    .then((contacts) => {
      contacts.length > 0
        ? response.status(200).send(contacts).end()
        : response.status(404).send({ error: 'No data found' })
    })
    .catch((error) => {
      next(error)
    })
})

app.get('/info', (request, response, next) => {
  const currentDate = new Date()
  Contact.find({})
    .then((result) => {
      const responseContent = `<p>Phonebook has info for ${
        result.length
      } persons.</p><p>${currentDate.toString()}</p>`
      response.send(responseContent)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  const contactId = request.params.id

  Contact.findById(contactId)
    .then((result) =>
      result
        ? response.status(200).send(result)
        : response.status(404).send({ error: 'No data found' })
    )
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const contactId = request.params.id

  Contact.findByIdAndDelete(contactId)
    .then((result) => {
      result
        ? response.status(204).end()
        : response
          .status(404)
          .send({ error: 'Data to delete not found.' })
    })
    .catch((error) => next(error))
})

app.post('/api/persons', async (request, response, next) => {
  const newContact = request.body
  const { name, number } = newContact

  const duplicateItem = await findByName(name)
  if (duplicateItem.length > 0)
    return response.status(409).send(duplicateItem).end()

  Contact.create({ name: name, number: number })
    .then((savedContact) => response.json(savedContact))
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const contactId = request.params.id
  const contactBody = request.body

  Contact.findByIdAndUpdate(
    contactId,
    { number: contactBody.number },
    { runValidators: true }
  )
    .then((result) =>
      result ? response.status(200).end() : response.status(404).end()
    )
    .catch((error) => next(error))
})

const errorHandler = (error, request, response) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
}

app.use(errorHandler)

const PORT = 3001
app.listen(PORT, () => {
  console.log(`App is running in port ${PORT}`)
})
