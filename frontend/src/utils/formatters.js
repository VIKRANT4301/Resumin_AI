export function normalizeListInput(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getRiskLevel(feedback) {
  const severities = (feedback?.risk_signals || []).map((item) => String(item?.severity || "").toLowerCase());
  if (severities.includes("high")) return { label: "High Risk", value: "high" };
  if (severities.includes("medium")) return { label: "Medium Risk", value: "medium" };
  return { label: "Low Risk", value: "low" };
}
