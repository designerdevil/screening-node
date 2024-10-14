import { getModels, resultExtractor } from './groqHandler.js';
import fetch from 'node-fetch';
import markdownit from 'markdown-it';
import { resumeHandler } from "../util/resumeHandler.js";

const md = markdownit({
	html: true,
	linkify: true,
	typographer: true
});

export const renderHandler = (req, res, next) => {
	const features = {
		title: 'Generative AI Showcase'
	}
	res.render('index', { features, form: true });
}

export const textgenerationHandler = async (req, res, next) => {
	const userInput = req.body.userInput;
	const jobId = req.body.userInput;
	const getJobDescriptionQuery = `job description for ${jobId}`
	// Select Type is either "RAG" or "Non - RAG"
	const selectedType = req.body.selectedType;
	let promptArray;
	let result;
	if (selectedType === "rag") {
		// Make a call to Rag Pipeline to retrieve context
		const url = `http://localhost:3001/get-context?question=${getJobDescriptionQuery}`;
		const primaryJDResp = await fetch(url);
		const jobDescriptionContext = await primaryJDResp.json();
		const resumeContext = await resumeHandler();
		// example of prompt crafting based on context
		promptArray = [
			{
				role: "system",
				content: "You are a helpful assistant for screening resumes based on job descriptions."
			},
			{
				role: "user",
				content: `
				You are a resume screening assistant. You will be provided with a dataset of job descriptions and a specific job ID. Your task is to:

				1. Find the job description that matches the given job ID.
				2. Extract the technical skills, tools, and experiences required for that job description, with particular attention to core technologies and whether they are frontend, backend, or full-stack.
				3. Compare the resume to the job description, making sure to:
				- Distinguish between similar but different technologies (e.g., **Java** vs. **JavaScript**, **Python** vs. **Python frameworks**).
				- Make a conscious distinction between frontend technologies (e.g., **React**, **Vue.js**) and backend technologies (e.g., **Node.js**, **Java**, **Python**).
				- Assess whether the candidate has relevant experience in either frontend, backend, or full-stack development, depending on the job requirements.

				**Core Technologies for this job:**
				- Backend: [List core backend technologies specific to the job, e.g., Node.js, Java, Python, etc.]
				- Frontend: [List core frontend technologies specific to the job, e.g., React, Angular, JavaScript, etc.]
				- Full-stack: [List if the job requires a combination of both frontend and backend.]

				4. Be flexible when matching terms that are similar but use different names or abbreviations (e.g., Mongo vs. MongoDB, JS vs. JavaScript), but make sure not to conflate unrelated technologies (e.g., Java vs. JavaScript).

				5. Rank the resume’s match with the job description based on:
				- **Core Technology Match (60%):** Check for an exact or related match for the required technologies (frontend/backend/full-stack) while being strict about core distinctions (e.g., Java is not the same as JavaScript).
				- **Supplementary Technology Match (20%):** Look for secondary technologies or tools mentioned in the job description.
				- **Experience Match (20%):** Evaluate the candidate's level of experience in the relevant technologies, whether it's frontend, backend, or full-stack.

				6. After calculating the total score, flag the resume as **ResumeMatched** if the overall score exceeds 60%, otherwise flag it as **ResumeNotMatched**.

				Here are the job descriptions:
				${jobDescriptionContext}

				Here is the resume:
				${resumeContext}

				The given job ID is: ${jobId}

				### Task:
				1. First, find the job description matching the job ID.
				2. Once the job description is identified, compare the technical skills, tools, and experiences in the resume with the job description. Be sure to differentiate between backend and frontend technologies as specified in the job description.
				3. Highlight the matched and missing skills, experiences, and tools, with particular attention to core technologies. 
				- Clearly distinguish between technologies that are closely related but not the same (e.g., Java vs. JavaScript).
				- Provide an overall match score and a summary of the candidate's suitability for the job.
				4. Finally, flag the resume as **ResumeMatched** if the overall score exceeds 60%, otherwise flag it as **ResumeNotMatched**.

				### Output Format:
				1. **Matched Skills:**
				- [List of matched skills]

				2. **Missing Skills:**
				- [List of missing skills]

				3. **Backend/Frontend Experience Comparison:**
				- **Backend Technologies:**
					- **Matched Backend Technologies:** [List of matched backend technologies]
					- **Missing Backend Technologies:** [List of missing backend technologies]
				- **Frontend Technologies:**
					- **Matched Frontend Technologies:** [List of matched frontend technologies]
					- **Missing Frontend Technologies:** [List of missing frontend technologies]

				4. **Tools/Technologies:**
				- **Matched Tools/Technologies:**
					- [List of matched tools/technologies]
				- **Missing Tools/Technologies:**
					- [List of missing tools/technologies]

				5. **Overall Match Score:**
				- **Core Technology Match:** X%
				- **Supplementary Technology Match:** X%
				- **Experience Match:** X%
				- **Total Score:** X%

				6. **Suitability Summary:**
				- [Brief summary of the candidate’s suitability for the role, highlighting strengths and weaknesses.]

				7. **Final Flag:**
				- **ResumeMatched** or **ResumeNotMatched**
				`
			},
		];
		result = await resultExtractor(promptArray, null);
	} else {
		// example of using basic chat
		promptArray = [
			{ role: "user", content: userInput },
		];
		result = await resultExtractor(promptArray);
	}
	result = md.render(result);
	res.json({ response: result });
}


export const modelHandler = (req, res, next) => {
	const features = {
		title: 'Generative AI Models'
	}
	// Getting list of all models available in groq
	const result = getModels();
	result.then((models) => {
		const modelslist = models.data;
		res.render('index', { features, listmodels: true, modelslist });
	});
}
