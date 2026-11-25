const jsonInput = document.getElementById("jsonInput");
const runBtn = document.getElementById("runBtn");
const sampleBtn = document.getElementById("sampleBtn");
const errorText = document.getElementById("errorText");

const silenceLayer = document.getElementById("silenceLayer");
const hookLayer = document.getElementById("hookLayer");
const insightLayer = document.getElementById("insightLayer");
const opportunityLayer = document.getElementById("opportunityLayer");
const actionsLayer = document.getElementById("actionsLayer");
const dominanceLayer = document.getElementById("dominanceLayer");
const detailsLayer = document.getElementById("detailsLayer");

const hookStatement = document.getElementById("hookStatement");
const insightList = document.getElementById("insightList");
const opportunityList = document.getElementById("opportunityList");
const actionsList = document.getElementById("actionsList");
const othersFailList = document.getElementById("othersFailList");
const yourAdvantageList = document.getElementById("yourAdvantageList");
const confidenceSummary = document.getElementById("confidenceSummary");
const fullReport = document.getElementById("fullReport");

const sample = {
  behavioural_truth: "Teams keep optimizing output while silently losing conversion momentum in the first 12 seconds.",
  key_insights: [
    "Users delay commitment when the opening view asks them to interpret before it signals immediate relevance.",
    "Decision confidence rises when ambiguity is compressed into fewer, high-contrast options with clear first actions.",
    "Most competitors expose analysis first and action second, causing attention decay before value recognition."
  ],
  opportunity_gaps: [
    "No immediate value cue after data paste.",
    "Insights presented with equal visual weight.",
    "Too many possible next moves create hesitation."
  ],
  recommended_directions: [
    "Lead with a single provocative truth statement before any detail.",
    "Reveal insight bursts sequentially with one distinct memory anchor.",
    "Offer only the top three action paths, each with a first executable step."
  ],
  confidence_summary: "Confidence is high: behavioral signals and interface constraints are aligned toward faster commitment."
};

let runId = 0;

function clampItems(arr, min = 0, max = 5) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(Boolean).slice(min, max);
}

function splitLeadAndDetail(text) {
  const clean = String(text || "").trim().replace(/\s+/g, " ");
  if (!clean) return { lead: "No signal available", detail: "" };
  const split = clean.split(/[:;.-]\s+|,\s+|\s+but\s+|\s+while\s+/i);
  const lead = (split[0] || clean).trim();
  const leadShort = lead.length > 78 ? `${lead.slice(0, 78).trim()}...` : lead;
  const detail = clean.slice(lead.length).trim().replace(/^[,;:.-]\s*/, "");
  return { lead: sentenceCase(leadShort), detail: detail || "Tap to apply this signal in your next move." };
}

function sentenceCase(input) {
  if (!input) return "";
  return input.charAt(0).toUpperCase() + input.slice(1);
}

function deriveHook(text) {
  const clean = String(text || "").trim();
  if (!clean) return "You are not blocked by data volume. You are blocked by sequence.";
  const firstSentence = clean.split(/[.!?]/)[0].trim();
  const compact = firstSentence.length > 120 ? `${firstSentence.slice(0, 120).trim()}...` : firstSentence;
  return sentenceCase(compact);
}

function toActionCard(text, index) {
  const { lead, detail } = splitLeadAndDetail(text);
  const verbs = ["Start", "Deploy", "Activate"];
  return {
    title: lead,
    explain: detail,
    firstStep: `${verbs[index] || "Start"} with the smallest testable slice in the next 15 minutes.`
  };
}

function clearAll() {
  [hookLayer, insightLayer, opportunityLayer, actionsLayer, dominanceLayer, detailsLayer].forEach((el) => {
    el.classList.add("hidden");
  });
  [insightList, opportunityList, actionsList, othersFailList, yourAdvantageList].forEach((el) => {
    el.innerHTML = "";
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(base, variance = 120) {
  return Math.max(120, Math.round(base + (Math.random() * variance - variance / 2)));
}

function show(el) {
  el.classList.remove("hidden");
}

function renderInsightBursts(insights) {
  const limited = clampItems(insights, 0, 4);
  const anchorIndex = Math.floor(Math.random() * Math.max(1, limited.length));
  limited.forEach((item, idx) => {
    const { lead, detail } = splitLeadAndDetail(item);
    const burst = document.createElement("article");
    burst.className = `burst ${idx === anchorIndex ? "memorable" : ""}`;
    burst.innerHTML = `<p class="lead">${lead}</p><p class="detail">${detail}</p>`;
    burst.style.animationDelay = `${Math.round(idx * 120 + Math.random() * 90)}ms`;
    insightList.appendChild(burst);
  });
}

function renderOpportunities(gaps) {
  clampItems(gaps, 0, 3).forEach((gap) => {
    const signal = document.createElement("div");
    signal.className = "signal";
    signal.textContent = splitLeadAndDetail(gap).lead;
    signal.style.opacity = "0.96";
    opportunityList.appendChild(signal);
  });
}

function renderActions(recommendations) {
  clampItems(recommendations, 0, 3).map(toActionCard).forEach((card, idx) => {
    const action = document.createElement("article");
    action.className = "action";
    action.innerHTML = `
      <h3>${card.title}</h3>
      <p>${card.explain}</p>
      <div class="first-step"><strong>First step:</strong> ${card.firstStep}</div>
    `;
    action.style.animationDelay = `${Math.round(idx * 150 + Math.random() * 60)}ms`;
    actionsList.appendChild(action);
  });
}

function renderDominance(gaps, recommendations, confidence) {
  const fail = clampItems(gaps, 0, 3).map((v) => splitLeadAndDetail(v).lead);
  const win = clampItems(recommendations, 0, 3).map((v) => splitLeadAndDetail(v).lead);
  fail.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f;
    othersFailList.appendChild(li);
  });
  win.forEach((w) => {
    const li = document.createElement("li");
    li.textContent = w;
    yourAdvantageList.appendChild(li);
  });
  confidenceSummary.textContent = sentenceCase(
    String(confidence || "Confidence available: your next move is clearer than the market average.")
  );
}

function validateInput(data) {
  const required = ["behavioural_truth", "key_insights", "opportunity_gaps", "recommended_directions", "confidence_summary"];
  const missing = required.filter((k) => !(k in data));
  if (missing.length) {
    throw new Error(`Missing fields: ${missing.join(", ")}`);
  }
  return true;
}

async function runExperience(data) {
  const currentRun = ++runId;
  clearAll();
  errorText.textContent = "";
  fullReport.textContent = JSON.stringify(data, null, 2);

  silenceLayer.classList.remove("hidden");
  await sleep(jitter(600, 180));
  if (currentRun !== runId) return;

  silenceLayer.classList.add("hidden");
  hookStatement.textContent = deriveHook(data.behavioural_truth);
  show(hookLayer);
  await sleep(jitter(850, 220));
  if (currentRun !== runId) return;

  renderInsightBursts(data.key_insights);
  show(insightLayer);
  await sleep(jitter(740, 260));
  if (currentRun !== runId) return;

  renderOpportunities(data.opportunity_gaps);
  show(opportunityLayer);
  await sleep(jitter(760, 200));
  if (currentRun !== runId) return;

  renderActions(data.recommended_directions);
  show(actionsLayer);
  await sleep(jitter(700, 220));
  if (currentRun !== runId) return;

  renderDominance(data.opportunity_gaps, data.recommended_directions, data.confidence_summary);
  show(dominanceLayer);
  await sleep(jitter(400, 140));
  if (currentRun !== runId) return;

  show(detailsLayer);
}

function parseInput() {
  const raw = jsonInput.value.trim();
  if (!raw) throw new Error("Input is empty. Paste a JSON payload first.");
  return JSON.parse(raw);
}

runBtn.addEventListener("click", async () => {
  try {
    const parsed = parseInput();
    validateInput(parsed);
    await runExperience(parsed);
  } catch (err) {
    errorText.textContent = err.message || "Invalid JSON input.";
  }
});

sampleBtn.addEventListener("click", async () => {
  jsonInput.value = JSON.stringify(sample, null, 2);
  errorText.textContent = "";
  await runExperience(sample);
});

jsonInput.value = JSON.stringify(sample, null, 2);
