import React, { useState, useEffect } from 'react';
    import axios from 'axios';

    const App = () => {
      const [models, setModels] = useState([]);
      const [selectedModel, setSelectedModel] = useState('');
      const [messages, setMessages] = useState([]);
      const [inputValue, setInputValue] = useState('');
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState('');

      useEffect(() => {
        // Fetch available models from Ollama
        setLoading(true);
        axios.get('http://localhost:11434/api/models')
          .then(response => {
            setModels(response.data.models);
            setSelectedModel(response.data.models[0]?.name || '');
          })
          .catch(error => {
            console.error('Error fetching models:', error);
            setError('Failed to fetch models. Please check your Ollama server.');
          })
          .finally(() => setLoading(false));
      }, []);

      const sendMessage = async () => {
        if (!inputValue.trim()) return;

        setMessages(prevMessages => [...prevMessages, { type: 'user', text: inputValue }]);
        setInputValue('');
        setLoading(true);
        setError('');

        try {
          // Send message to Ollama
          const response = await axios.post('http://localhost:11434/api/chat', {
            model: selectedModel,
            messages: [{ role: 'user', content: inputValue }]
          });

          setMessages(prevMessages => [...prevMessages, { type: 'bot', text: response.data.choices[0].message.content }]);
        } catch (error) {
          console.error('Error sending message:', error);
          setError('Failed to send message. Please try again.');
          setMessages(prevMessages => [...prevMessages, { type: 'bot', text: 'An error occurred while processing your request.' }]);
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="container">
          <div className="header">
            <h1>Ollama Web UI</h1>
          </div>
          {loading && <p>Loading models...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && (
            <>
              <div className="model-selector">
                <label htmlFor="model">Select Model:</label>
                <select id="model" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                  {models.map(model => (
                    <option key={model.name} value={model.name}>{model.name}</option>
                  ))}
                </select>
              </div>
              <div className="chat-container">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.type}`}>
                    <div className="message-text">{message.text}</div>
                  </div>
                ))}
              </div>
              <div className="input-container">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  disabled={loading}
                />
                <button onClick={sendMessage} disabled={loading}>
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      );
    };

    export default App;
