import React from 'react';
import './ChatHistorySidebar.css'; // Import CSS for styling
import { useTheme } from './ThemeContext'; // Adjust the path as necessary

const ChatHistorySidebar = () => {
  const { theme } = useTheme(); // Access the current theme

  return (
    <div className={`chat-history-sidebar ${theme}-theme`}>
      <h3>EduRAG</h3>
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