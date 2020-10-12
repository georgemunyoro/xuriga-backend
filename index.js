const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const { Client } = require("pg");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const getDatabaseConnection = () => {
    console.log(process.env.DATABASE_CONNECTION_STRING);
    const client = new Client({ connectionString: process.env.DATABASE_CONNECTION_STRING });
    client.connect();
    return client;
};

getDatabaseConnection().end();

app.get("/api/:endpoint", async (req, res) => {
    const { endpoint } = req.params;
    if (endpoint == "urls") {
	try {
	    const client = getDatabaseConnection();
	    const { rows } = await client.query("SELECT url, id FROM urls");
	    res.json({ message: "urls", data: rows });
	    client.end();
	} catch (err) {
	    res.json({ message: "err", stack: err.stack });
	}
    }
});

app.post("/api/:endpoint", async (req, res) => {
    const { endpoint } = req.params;

    switch (endpoint) {
	case "create":
	    let { slug, url } = req.body;
	    slug = slug == "" ? nanoid(11) : slug;
	    try {
		const client = getDatabaseConnection();
		const { rows } = await client.query("INSERT INTO urls(id, url) VALUES($1, $2)", [slug, url]);
		res.json({ id: slug, res: rows, url: url });
		client.end();
	    } catch (err) {
		res.json({ message: err, stack: err.stack });
	    }
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, (err) => {
    if (err) console.error(err.stack);
    console.log("Server started on port : " + PORT);
});

