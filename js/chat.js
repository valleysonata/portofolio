/**
 * chat.js ΓÇö chat orchestration
 */

(function () {
  "use strict";

  const { API_ENDPOINT, MODEL, USE_MOCK_MODE } = window.PORTFOLIO_CONFIG;
  let chatInput;

  const KNOWLEDGE_BASE = {
    "hello|hi|hey|greetings": "hey! i'm raka's ai resume agent. ask me about his background, skills, experience, or anything else from his resume.",
    "what|who|about": "i'm an ai trained on raka's resume. you can ask me about his education, work experience, technical skills, certifications, or projects.",
    "skill|languages|stack|tech": "raka works with python, javascript, c, and sql. he's strong in data analysis (pandas, numpy, scipy), visualization (matplotlib, seaborn), and modern ai tech like prompt engineering, rag systems, and autonomous agents. he also uses cloud platforms like alibaba cloud.",
    "experience|intern|work": "raka did a data analyst internship at work unusual in jakarta from jan-apr 2026. he processed 2024-2025 operational records, performed statistical analysis with pandas/numpy/scipy, built visualizations with matplotlib and seaborn, and generated actionable business insights through eda.",
    "education|university|nycu|school": "raka's an incoming cs student at nycu (national yang ming chiao tung university) in hsinchu, taiwan, starting september 2026. he got the nycu international student scholarship type b. he also completed ontario secondary school diploma (ossd) at rosedale global high school.",
    "project|portfolio|github": "check out raka's github (github.com/valleysonata) and this portfolio site for his projects. he works on ai applications, data analysis tools, and full-stack web development.",
    "contact|email|phone|reach": "you can reach raka at banyulangitadyaraka@gmail.com or +62-877-4311-0466.",
    "certifications|cert|course": "raka has certifications in hackerrank sql basic (joins, subqueries, optimization), alibaba cloud academy (generative ai, prompt engineering, ml/dl, gpu), hp life data science & analytics, and coding bee academy python programming (grade a).",
    "location|jakarta|taiwan|ontario": "raka's from jakarta, indonesia. he studied in ontario, canada, and is now heading to taiwan for university at nycu.",
    "age|born|birthday": "raka is 18 years old.",
    "default": "hmm, i'm not sure about that. try asking about raka's skills, experience, education, or certifications!"
  };

  function getMockResponse(userInput) {
    const lower = userInput.toLowerCase().trim();
    for (const [keywords, response] of Object.entries(KNOWLEDGE_BASE)) {
      const keywordList = keywords.split("|");
      if (keywordList.some(kw => lower.includes(kw))) {
        return response;
      }
    }
    return KNOWLEDGE_BASE.default;
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = "";
    chatInput.disabled = true;

    window.Messages.append("user", text);
    const contentEl = window.Messages.append("agent", "", true);

    try {
      let reply = "";

      if (USE_MOCK_MODE) {
        reply = getMockResponse(text);
      } else {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              { role: "system", content: window.SYSTEM_PROMPT },
              { role: "user", content: text },
            ],
            model: MODEL,
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          reply = data[0]?.generated_text || "";
        } else if (data.choices && data.choices[0]) {
          reply = data.choices[0].message?.content || data.choices[0].generated_text || "";
        } else {
          throw new Error("Unexpected API response format");
        }
      }

      document.querySelector(".typing-dot")?.remove();

      reply = reply.toLowerCase().trim();

      window.Messages.typeOut(contentEl, reply, () => {
        contentEl.parentElement.classList.add("done");
        finalizeInput();
      });

    } catch (err) {
      document.querySelector(".typing-dot")?.remove();
      contentEl.textContent = "error: communication channel closed. retry request.";
      console.error("[raka-agent]", err);
      finalizeInput();
    }
  }

  function finalizeInput() {
    chatInput.disabled = false;
    chatInput.focus();
    window.Cursor.update();
  }

  function init() {
    chatInput = document.getElementById("chat-input");
    if (!chatInput) return;
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") sendMessage();
    });
    window.Messages.init();
    window.Cursor.init();
    window.Cursor.update();
  }

  window.Chat = { init };
})();
