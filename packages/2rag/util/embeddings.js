import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";

const embeddings = new HuggingFaceTransformersEmbeddings({
	modelName: "WhereIsAI/UAE-Large-V1",
});

export default embeddings;