import { useEffect } from 'react';

declare global {
  interface Window {
    renderChatWidget: (containerId: string, options: { backgroundColor: string }) => void;
  }
}


function ChatTestWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'http://localhost:3001/chatWidget.js';
    script.async = true;

    script.onload = () => {
      if (window.renderChatWidget) {
        window.renderChatWidget('chat-widget-container', {
          backgroundColor: '#fff',
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="chat-widget-container"></div>;
}

export default ChatTestWidget;
