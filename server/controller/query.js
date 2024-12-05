const determinePromptType = (prompt) => {
  const questionKeywords = ["what", "why", "how", "when", "where", "who"];
  const promptLowerCase = prompt.toLowerCase();

  if (
    prompt.length < 100 &&
    questionKeywords.some((keyword) => promptLowerCase.includes(keyword))
  ) {
    console.log("question");
    return "question";
  } else {
    console.log("long_text");
    return "long_text";
  }
};

require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const formatResponse = (text) => {
  // Remove asterisks and trim whitespace
  const cleanText = text.replace(/\*/g, "").trim();
  return cleanText;
};

const formatKeywords = (text) => {
  const cleanText = text.replace(/\*/g, "").trim();
  const keywords = cleanText.split("\n").filter(Boolean); // Split by line and remove empty entries
  return keywords.slice(0, 5).join("\n "); // Limit to 5 keywords and join with commas
};

const query = async (req, res) => {
  const prompt = req.body.prompt;

  try {
    if (prompt == null) {
      throw new Error("No prompt was provided!");
    }

    const promptType = determinePromptType(prompt);

    if (promptType === "question") {
      console.log("Please enter a long text!");
      return res.status(200).json({
        success: true,
        message: "Please provide a text you want to understand!",
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const [summarizeResponse, keywordResponse, mnemonicsResponse] =
      await Promise.all([
        model.generateContent(
          `Summarize the following text in layman's terms with examples: 
          ${prompt}`
        ),
        model.generateContent(
          `From the following text, extract important words that we should remember and provide them in bullet form:
          ${prompt}`
        ),
        model.generateContent(
          `Create mnemonics or a simple story from the following text to help people remember it easily:
          ${prompt}`
        ),
      ]);

    const summarizeCompletion = formatResponse(
      summarizeResponse.response.text()
    );
    const keywordCompletion = formatKeywords(keywordResponse.response.text());
    const mnemonicsCompletion = formatResponse(
      mnemonicsResponse.response.text()
    );

    // Return the results
    return res.status(200).json({
      success: true,
      summary: summarizeCompletion,
      keywords: keywordCompletion,
      howToRemember: mnemonicsCompletion,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { query };
