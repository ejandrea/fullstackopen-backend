const express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("tiny"));

morgan.token("contacts", (req, res) => {
    return JSON.stringify(req.body);
});

app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :contacts"
    )
);

let contacts = [
    {
        id: "1",
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: "3",
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: "4",
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
    {
        id: "5",
        name: "EJ Andrea Canatoy",
        number: "39-23-6423122",
    },
];

const generateId = () => {
    return (Math.random() + contacts.length).toString();
};

const checkIfDuplicate = (name) => {
    const isDuplicate = [...contacts].filter(
        (contact) => contact.name.toLowerCase() === name.toLowerCase()
    );

    return isDuplicate.length > 0;
};

app.get("/api/persons", (request, response) => {
    response.json(contacts);
});

app.get("/info", (request, response) => {
    const currentDate = new Date();
    const contactsLength = contacts.length;

    const responseContent = `<p>Phonebook has info for ${contactsLength} persons.</p><p>${currentDate.toString()}</p>`;

    response.send(responseContent);
});

app.get("/api/persons/:id", (request, response) => {
    const contactId = request.params.id;
    const contact = contacts.find((contact) => contact.id === contactId);

    if (!contact) response.status(404).send("Contact was not found");

    response.send(contact);
});

app.delete("/api/persons/:id", (request, response) => {
    const contactId = request.params.id;
    const contact = contacts.find((contact) => contact.id === contactId);

    if (!contact) response.status(404).send("Contact to delete is not found.");

    contacts = contacts.filter((contact) => contact.id !== contactId);
    response.status(200).send(contacts);
});

app.post("/api/persons", (request, response) => {
    const createdContact = request.body;

    if (!createdContact.name || !createdContact.number)
        return response.status(404).json({
            error: "The name and/or number is missing.",
        });

    const { name, number } = createdContact;

    if (checkIfDuplicate(name))
        return response.status(409).json({
            error: "The user already exists. Name must be unique.",
        });

    const newContact = {
        id: generateId(),
        name,
        number,
    };

    contacts = contacts.concat(newContact);
    response.status(201).send(contacts);
});

app.put("/api/persons/:id", (request, response) => {
    const contactId = request.params.id;

    const contactBody = request.body;

    const contact = contacts.find((contact) => {
        return contact.id === contactId;
    });

    if (!contact) response.status(404).send("Contact was not found").end();

    if (!contactBody.name || !contactBody.number)
        return response.status(404).json({
            error: "The name and/or number is missing.",
        });

    const { name, number } = contactBody;

    const updatedContact = {
        id: contactId,
        name,
        number,
    };

    contacts = contacts.map((contact) =>
        contact.id !== updatedContact.id ? contact : updatedContact
    );

    response.status(200).send(contacts);
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`App is running in port ${PORT}`);
});
