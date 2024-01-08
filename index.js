const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const multer  = require('multer')
const upload = multer({ dest: './src/things/' })

const app = express();
app.use(express.static("src"));
app.use(bodyParser.json());

app.post("/things/new", upload.single("thing"), (req, res) => {
	const {filename} = req.body;
	if(!filename) {
		res.status(400).send("No filename provided.");
		return;
	}

	// set upload to have the correct filename
	fs.renameSync(path.join(__dirname, "src", "things", req.file.filename), path.join(__dirname, "src", "things", `${filename}.js`));
	res.send("ok");
});

app.post("/api", (req, res) => {
	const {action} = req.body;

	if(action === "loadThings") {
		fs.readdir(path.join(__dirname, "src", "things"), (err, files) => {
			if(err) {
				res.status(500).send("Error reading things directory.");
				return;
			}

			res.send(files);
		});

		return;
	}

	if(action === "deleteThing") {
		const {filename} = req.body;
		if(!filename) {
			res.status(400).send("No filename provided.");
			return;
		}

		fs.rmSync(path.join(__dirname, "src", "things", `${filename}.js`));
		res.send("ok");
		return;
	}

	res.send("Error: no action provided.");
});

app.listen("3000");