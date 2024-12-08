import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";

const App = () => {
  const [inputText, setInputText] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [mnemonics, setMnemonics] = useState("");

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  const formatResponse = (text) => text.replace(/\*/g, "").trim();

  const formatKeywords = (text) => {
    const cleanText = text.replace(/\*/g, "").trim();
    const keywords = cleanText.split("\n").filter(Boolean);
    return keywords.slice(0, 5).join(", ");
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleApiReq = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const [summarizeResponse, keywordResponse, mnemonicsResponse] =
        await Promise.all([
          model.generateContent(
            `Summarize the following text in layman's terms with examples: 
            ${inputText}`
          ),
          model.generateContent(
            `From the following text, extract important words that we should remember and provide them in bullet form:
            ${inputText}`
          ),
          model.generateContent(
            `Create mnemonics or a simple story from the following text to help people remember it easily:
            ${inputText}`
          ),
        ]);

      setSummarizedText(
        formatResponse(await summarizeResponse.response.text())
      );
      setKeyword(formatKeywords(await keywordResponse.response.text()));
      setMnemonics(formatResponse(await mnemonicsResponse.response.text()));
    } catch (error) {
      console.error(`Error calling Gemini API: ${error.message}`);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>MindSnap ProseMaster 🚀</h1>
        <p className="tagline">
          Learn, simplify, and remember with AI-driven insights.
        </p>
      </header>
      <main className="app-main">
        <div className="input-section">
          <textarea
            className="input-textarea"
            placeholder="Enter the text you wish to learn!"
            value={inputText}
            onChange={handleInputChange}
          />
          <button className="primary-btn" onClick={handleApiReq}>
            Get Insights!
          </button>
        </div>
        <div className="results-section">
          <ResultBox
            title="Summarized Text 📖"
            content={summarizedText}
            size="large"
          />
          <ResultBox
            title="Relevant Keywords 🌍"
            content={keyword}
            size="small"
          />
          <ResultBox
            title="Trick To Remember 💬"
            content={mnemonics}
            size="medium"
          />
        </div>
      </main>
      <footer className="app-footer">
        <a
          href="
        https://github.com/ujj1225"
        >
          Made with ❤️ by Ujj1225 | Powered by Gemini AI
        </a>
      </footer>
    </div>
  );
};

const ResultBox = ({ title, content, size }) => {
  const sizeClass = `result-box ${size}`;
  return (
    <div className={sizeClass}>
      <h2>{title}</h2>
      <div className="result-content">
        {content || <em>No content available yet. Submit some text!</em>}
      </div>
    </div>
  );
};

export default App;
