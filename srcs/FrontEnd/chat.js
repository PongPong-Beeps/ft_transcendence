document.addEventListener("DOMContentLoaded", function() {
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const chatMessages = document.getElementById("chat-messages");
  
    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  
    function sendMessage() {
      const message = messageInput.value.trim();
      if (message !== "") {
        appendMessage("You", message);
        messageInput.value = "";
      }
    }
  
    function appendMessage(sender, message) {
      const messageElement = document.createElement("div");
      messageElement.classList.add("mb-2");
      messageElement.innerHTML = `
        <strong>${sender}:</strong> ${message}
      `;
      chatMessages.appendChild(messageElement);
      // Auto-scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });
  