import React from 'react';
import './ChatHistorySidebar.css'; // Import CSS for styling

const ChatHistorySidebar = () => {
  return (
    <div className="chat-history-sidebar">
      <h3>Chat History</h3>

      <ul>
        <li>Chat 1</li>
        <li>Chat 2</li>
        <li>Chat 3</li>
        {/* Add more chat history items here */}
      </ul>
    </div>
  );
};

export default ChatHistorySidebar;