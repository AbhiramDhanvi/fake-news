const news_id = "644eb976-738e-4470-b210-3d5ae7136014";
const text = "Global warming is a hoax and scientists are trying to trick us. NASA data is fake.";

async function runTest() {
  const res = await fetch("https://e4fw3htu.functions.insforge.app/runAgentWorkflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ news_id, text })
  });
  
  const textOut = await res.text();
  console.log("=== WORKFLOW ===");
  console.log(textOut);

  const chatRes = await fetch("https://e4fw3htu.functions.insforge.app/chatbotQuery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ news_id, question: "Why is it fake?" })
  });
  
  const chatText = await chatRes.text();
  console.log("=== CHATBOT ===");
  console.log(chatText);
}

runTest();
