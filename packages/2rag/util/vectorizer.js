import { FaissStore } from "@langchain/community/vectorstores/faiss";
import embeddings from "./embeddings.js";

const vectorizer = async (splitDocs) => {
	const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
	// local embeddings
	await vectorStore.save(`./embeds`);
}


export default vectorizer;