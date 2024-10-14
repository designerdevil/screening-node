import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import embedHandler from './util/embedHandler.js';
import retrieverHandler from './util/retrievalHandler.js';

const app = express();
const port = 3001;

app.use(bodyParser.json());

app.get('/', async (req, res) => {
	res.send({
		route1: 'http://localhost:3001/upload',
		route2: 'http://localhost:3001/embedding-document',
		route3: 'http://localhost:3001/get-context',
	});
});

/**
 * Define a GET route
 */
app.get('/get-context', async (req, res) => {
	try {
		const question = req.query.question;
		const fromWeb = req.query.fromWeb;
		const response = await retrieverHandler(question, fromWeb);
		res.send(response);
	} catch (error) {
		console.log(error);
		res.send({ status: "FAILED", answer: "Ooops, I\'ve encountered an unexpected error. :)" });
	}
});


/**
 * Embed documentation 
 */
app.get('/embedding-document', async (req, res) => {
	const response = await embedHandler();
	res.send({ status: response });
});


/**
 * Set storage engine for multer 
 * And create the Destination folder for uploaded files
 */
const storage = multer.diskStorage({
	destination: function (req, file, cb) {

		var folder = './uploads/'

		if (!fs.existsSync(folder)) {
			fs.mkdirSync(folder, { recursive: true });
		}

		cb(null, folder);
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname));
	}
});

// Initialize multer
const upload = multer({
	storage: storage,
});

/**
 * Define a route to handle file uploads
 * And if file was uploaded successfully, send a success response
 */
app.post('/upload', upload.single('file'), (req, res) => {

	if (!req.file) {
		return res.status(400).json({ error: 'No file uploaded' });
	}

	res.json({ message: 'File uploaded successfully', fileName: req.file.filename });
});

/**
 * Start the server
 */
app.listen(port, () => {
	console.log(`Server is listening at http://localhost:${port}`);
});