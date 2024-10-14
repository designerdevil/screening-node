import { FaissStore } from "@langchain/community/vectorstores/faiss";
import embeddings from "./embeddings.js";

const retrieverHandler = async (query) => {
	const vectorStore = await FaissStore.load(`./embeds`, embeddings);
	let context = [];
	let records;
	if(process.env.SCORING || true === true) {
		records = await vectorStore.similaritySearchWithScore(query, 10);
		context = records.reduce((a, c) => {
			return [...a, c[0].pageContent]
		}, [])
	} else {
		records = await vectorStore.similaritySearch(query);
		context = [...records.map((item) => item.pageContent)];
	}
	return context
}

export default retrieverHandler;