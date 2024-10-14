import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function resultExtractor(messageArray, jobId = null) {
	const chatCompletion = await getGroqChatCompletion(messageArray);
	// Print the completion returned by the LLM.
	const result = chatCompletion.choices[0]?.message?.content || "";
	if (!jobId) return result;
	// Extract the final flag (Matched/Not Matched) from the result (simplified approach)
	const matchedFlag = result.includes('ResumeMatched');
	let matchedOrNonMatched;
	if (matchedFlag) {
		matchedOrNonMatched = `Matched with Job Id: ${jobId}`;
	} else {
		matchedOrNonMatched =`NOT MATCHED SORRY!`;
	}
	return matchedOrNonMatched;
}

export async function getGroqChatCompletion(messageArray = []) {
	return groq.chat.completions.create({
		messages: [...messageArray],
		model: "llama3-8b-8192",
	});
}

export async function getModels() {
	return groq.models.list();
};