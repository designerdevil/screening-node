import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import vectorizer from "./vectorizer.js";

function normalizeDocuments(docs) {
	return docs.map((doc) => {
		if (typeof doc.pageContent === "string") {
			return doc.pageContent;
		} else if (Array.isArray(doc.pageContent)) {
			return doc.pageContent.join("\n");
		}
	});
}

const embedHandler = async () => {
	try {
		const loader = new DirectoryLoader(`./uploads`, {
			".json": (path) => new JSONLoader(path),
			".txt": (path) => new TextLoader(path),
			".csv": (path) => new CSVLoader(path),
			".pdf": (path) => new PDFLoader(path),
		});

		const docs = await loader.load();
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
		});
		const normalizedDocs = normalizeDocuments(docs);
		const splitDocs = await textSplitter.createDocuments(normalizedDocs);
		await vectorizer(splitDocs);

		return "SUCCESS"
	} catch (err) {
		console.log(err);
		return "ERROR"
	}
};

export default embedHandler;