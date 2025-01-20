import { useState } from "react";
import axios from "axios";
import './App.css'

function App() {

  const [response, setResponse] = useState("Hi there! How can I assist you?");
  const [value, setValue] = useState("");
  const [history,setHistory] = useState([]);

  const onChange = (e) => setValue(e.target.value);

  const handleSubmit = async () => {
    const response = await axios.post("http://localhost:3005/chatbot", {
      question: value,
    });
    setResponse(response.data);
  };

  const fetchHistory = async () => {
    const response = await axios.get("http://localhost:3005/chat-history");
    console.log("Chat History:", response.data);
    setHistory(response.data); 
  };

   
  return (
    <div className="container">
      <div>
        <input
          type="text"
          value={value}
          onChange={onChange}
        />
      </div>
      <div>
        <button onClick={handleSubmit}>Click me for answers!</button>
        <button onClick={fetchHistory}>History</button>
      </div>
      <div>
        <p>Chatbot: {response}</p>

        {/* Render the chat history */}
        <div>
          <h3>Chat History:</h3>
          {history.length > 0 ? (
            <ul>
              {history.map((item, index) => (
                <li key={index}>
                  <strong>{item.question}</strong>: {item.response}
                </li>
              ))}
            </ul>
          ) : (
            <p>No history available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App