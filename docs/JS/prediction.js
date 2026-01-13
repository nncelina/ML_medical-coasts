/*************************************************
 * CONFIG
 *************************************************/
const API_BASE_URL = "https://ml-medical-coasts-kz1m.onrender.com";
const $ = (id) => document.getElementById(id);

/*************************************************
 * UTILITAIRES UI
 *************************************************/
function fmtUSD(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return String(x);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(n);
}

function renderTable(data, tableId, limit = 5) {
  const table = $(tableId);
  table.innerHTML = "";

  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  table.innerHTML += `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;

  data.slice(0, limit).forEach(row => {
    table.innerHTML += `<tr>${headers.map(h => `<td>${row[h]}</td>`).join("")}</tr>`;
  });
}

/*************************************************
 * ====== PARTIE 1 : PRÉDICTION INDIVIDUELLE ======
 *************************************************/
function readForm() {
  return {
    age: Number($("age").value),
    sex: $("sex").value,
    bmi: Number($("bmi").value),
    children: Number($("children").value),
    smoker: $("smoker").value,
    region: $("region").value,
  };
}

function validateSingle(payload) {
  const errors = [];
  if (!Number.isFinite(payload.age) || payload.age <= 0) errors.push("Âge invalide");
  if (!Number.isFinite(payload.bmi) || payload.bmi <= 0) errors.push("BMI invalide");
  if (!Number.isFinite(payload.children) || payload.children < 0) errors.push("Children invalide");
  if (!payload.sex) errors.push("Sexe manquant");
  if (!payload.smoker) errors.push("Fumeur manquant");
  if (!payload.region) errors.push("Région manquante");
  return errors;
}

async function callPredict(payload) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload })
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(JSON.stringify(json.detail || json));
  }
  return json;
}

function showSingleResult(prediction, payload) {
  $("resultBox").style.display = "block";
  $("predValue").textContent = fmtUSD(prediction);
  $("sentPayload").textContent = JSON.stringify(payload, null, 2);
}

/*************************************************
 * ====== PARTIE 2 : PRÉDICTION CSV (BATCH) ======
 *************************************************/
const REQUIRED_COLUMNS = ["age", "sex", "bmi", "children", "smoker", "region"];
const SEX_VALUES = ["male", "female"];
const SMOKER_VALUES = ["yes", "no"];
const REGION_VALUES = ["southeast", "southwest", "northeast", "northwest"];

let parsedCSV = null;

function validateCSV(data) {
  const errors = [];

  if (!data.length) {
    errors.push("CSV vide");
    return errors;
  }

  const cols = Object.keys(data[0]);
  const missing = REQUIRED_COLUMNS.filter(c => !cols.includes(c));
  if (missing.length) {
    errors.push("Colonnes manquantes : " + missing.join(", "));
    return errors;
  }

  data.forEach((row, i) => {
    const line = i + 2;
    if (+row.age <= 0) errors.push(`Ligne ${line} : âge invalide`);
    if (+row.bmi <= 0) errors.push(`Ligne ${line} : BMI invalide`);
    if (+row.children < 0) errors.push(`Ligne ${line} : children invalide`);
    if (!SEX_VALUES.includes(row.sex)) errors.push(`Ligne ${line} : sex invalide`);
    if (!SMOKER_VALUES.includes(row.smoker)) errors.push(`Ligne ${line} : smoker invalide`);
    if (!REGION_VALUES.includes(row.region)) errors.push(`Ligne ${line} : region invalide`);
  });

  return errors;
}

/*************************************************
 * EVENTS
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {

  /* === BOUTON PRÉDICTION SIMPLE === */
  $("predictForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = readForm();
    const errors = validateSingle(payload);

    if (errors.length) {
      showSingleResult("—", errors.join(" | "));
      return;
    }

    $("predictStatus").textContent = "Calcul en cours…";

    try {
      const res = await callPredict(payload);
      showSingleResult(res.prediction, payload);
    } catch (err) {
      showSingleResult("—", err.message);
    } finally {
      $("predictStatus").textContent = "";
    }
  });

  /* === LECTURE CSV + APERÇU === */
  $("csvFile").addEventListener("change", () => {
    const file = $("csvFile").files[0];
    if (!file) return;

    $("batchStatus").textContent = "Lecture du fichier…";

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        parsedCSV = results.data;
        const errors = validateCSV(parsedCSV);

        if (errors.length) {
          $("csvValidation").innerHTML = "❌ " + errors.join("<br>");
          $("btnBatchPredict").disabled = true;
          $("csvPreview").style.display = "none";
          return;
        }

        $("csvValidation").innerHTML = "✅ Fichier conforme";
        $("csvPreview").style.display = "block";
        renderTable(parsedCSV, "csvTable");
        $("btnBatchPredict").disabled = false;
        $("batchStatus").textContent = "";
      }
    });
  });

  /* === BOUTON PRÉDICTION CSV === */
  $("btnBatchPredict").addEventListener("click", async () => {
    if (!parsedCSV) return;

    $("batchStatus").textContent = "🚀 Envoi à l’API…";

    const formData = new FormData();
    formData.append("file", $("csvFile").files[0]);

    try {
      $("batchStatus").textContent = "🧠 Prédiction en cours…";

      const res = await fetch(`${API_BASE_URL}/predict_batch`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Erreur API");

      const text = await res.text();
      const parsed = Papa.parse(text, { header: true }).data;

      $("batchResultPreview").style.display = "block";
      renderTable(parsed, "batchResultTable");

      const blob = new Blob([text], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "predictions.csv";
      a.click();

      $("batchStatus").textContent = "✅ Prédictions terminées";
    } catch (e) {
      $("batchStatus").textContent = "❌ Erreur lors des prédictions";
    }
  });

});
