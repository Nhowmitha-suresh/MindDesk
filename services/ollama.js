async function askAI() {
  aiOutput.textContent = "Thinking...";
  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        model: "llama3",
        prompt: aiInput.value,
        stream: false
      })
    });
    const data = await res.json();
    aiOutput.textContent = data.response;
  } catch {
    aiOutput.textContent = "Ollama not running";
  }
}
