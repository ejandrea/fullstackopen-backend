const express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
const Contact = require("./models/contact");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("dist"));
app.use(morgan("tiny"));

morgan.token("contacts", (req, res) => {
    return JSON.stringify(req.body);
});

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :contacts"
    )
);

const findByName = async (name) => {
    return Contact.find({ name: name }).then((result) => result);
};

app.get("/api/persons", (request, response, next) => {
    Contact.find({})
        .then((contacts) =>
            contacts.length > 0
                ? response.status(200).send(contacts).end()
                : response.status(400).end()
        )
        .catch((error) => {
            console.log(error);
            next(error);
        });
});

app.get("/info", (request, response, next) => {
    const currentDate = new Date();
    Contact.find({})
        .then((result) => {
            const responseContent = `<p>Phonebook has info for ${
                result.length
            } persons.</p><p>${currentDate.toString()}</p>`;
            response.send(responseContent);
        })
        .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
    const contactId = request.params.id;

    Contact.findById(contactId)
        .then((result) =>
            result
                ? response.status(200).send(result).end()
                : response.status(404).end()
        )
        .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
    const contactId = request.params.id;

    Contact.findByIdAndDelete(contactId)
        .then((result) => {
            result ? response.status(204).end() : response.status(404).end();
        })
        .catch((error) => next(error));
});

app.post("/api/persons", async (request, response, next) => {
    const newContact = request.body;
    const { name, number } = newContact;
    const duplicateItem = await findByName(name);

    if (duplicateItem.length > 0)
        return response.status(409).json({
            error: "The user already exists. Name must be unique.",
            duplicateItem,
        });

    Contact.create({
        name: name,
        number: number,
    })
        .then((result) => {
            result ? response.status(201).end() : response.status(404).end();
        })
        .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
    const contactId = request.params.id;
    const contactBody = request.body;

    Contact.findByIdAndUpdate(contactId, { number: contactBody.number })
        .then((result) =>
            result ? response.status(200).end() : response.status(404).end()
        )
        .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    }

    next(error);
};

app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`App is running in port ${PORT}`);
});
