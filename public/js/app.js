
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');

let chatHistory = [];


function addMessageToChat(sender, message) {
  const messageElement = document.createElement('div');
  const isUser = sender === 'user';
  const renderedMessage = isUser ? escapeHtml(message) : marked.parse(message);

  messageElement.className = `flex items-start gap-3 ${isUser ? 'justify-end' : ''}`;

  const content = `
    <div class="${isUser ? 'bg-indigo-600' : 'bg-gray-700'} rounded-xl p-3 max-w-lg">
      <div class="prose prose-sm prose-invert text-gray-200">${renderedMessage}</div>
    </div>
  `;

  const userIcon = `
    <div class="bg-gray-600 p-2 rounded-full flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
  `;

  const aiIcon = `
    <div class="bg-indigo-500 p-2 rounded-full flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    </div>
  `;

  messageElement.innerHTML = isUser ? `${content}${userIcon}` : `${aiIcon}${content}`;
  chatWindow.appendChild(messageElement);
  scrollToBottom();
}

function escapeHtml(unsafe) {
  return unsafe.replace(/[&<"'>]/g, function(m) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]);
  });
}

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}


async function getGeminiResponse(prompt) {
  typingIndicator.classList.remove('hidden');
  scrollToBottom();

  chatHistory.push({ role: "user", parts: [{ text: prompt }] });

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: chatHistory })
    });

    if (!res.ok) {
      const err = await res.json().catch(()=>({message:res.statusText}));
      throw new Error(err.message || 'Gagal menghubungi server');
    }

    const data = await res.json();
    const aiText = data.reply || "Maaf, tidak ada respons.";
    chatHistory.push({ role: "model", parts: [{ text: aiText }] });
    addMessageToChat('ai', aiText);

  } catch (error) {
    console.error(error);
    addMessageToChat('ai', `Maaf, terjadi kesalahan: ${error.message}`);
  } finally {
    typingIndicator.classList.add('hidden');
  }
}

// Event form
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const userMessage = messageInput.value.trim();
  if (userMessage) {
    addMessageToChat('user', userMessage);
    getGeminiResponse(userMessage);
    messageInput.value = '';
  }
});

messageInput.focus();

