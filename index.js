const express = require("express");
const { nanoid } = require("nanoid");
const cors = require("cors");
const { Client } = require("pg");
const bodyParser = require("body-parser");

const connectionString = "postgres://george:root@localhost:5432/xuri";

const client = new Client({
  connectionString: connectionString,
});

client.connect();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({
	"message": "zing.ga, short urls for all!",
  })
})

app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
	const { rows } = await client.query("SELECT url FROM urls WHERE id = $1", [slug]);
	let redirectUrl = rows[0]
	if (redirectUrl.url.startsWith("http") == false) redirectUrl = "http://" + redirectUrl.url
	res.redirect(redirectUrl);
  } catch (err) {
	res.json({ message: "error", stack: err.stack })
  }
});

app.post("/", async (req, res) => {
  let { url, slug } = req.body;
  if (slug == "") slug = nanoid(7);

  try {
	const { rows } = await client.query("INSERT INTO urls(id, url) VALUES($1, $2)", [slug, url]);
	res.send({ id: id, url: url, res: rows })
  } catch (err) {
	res.json({ message: "error", stack: err.stack })
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
});

