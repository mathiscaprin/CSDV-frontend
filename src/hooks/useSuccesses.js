import { useEffect, useRef, useState } from "react";
import { getSuccesses } from "../utils/api.js";

const LIST_KEYS = ["data", "successes", "succes", "items", "results"];
const ID_KEYS = ["id", "_id", "uuid", "slug"];
const NAME_KEYS = ["name", "nom", "title", "titre", "label", "libelle"];
const DESCRIPTION_KEYS = ["description", "desc", "details", "detail"];
const CONDITION_KEYS = ["condition", "conditions", "critere", "critereSucces"];
const METRIC_KEYS = [
  "metric",
  "metrique",
  "stat",
  "statistique",
  "type",
  "category",
  "categorie",
  "objectifType",
  "conditionType",
];
const THRESHOLD_KEYS = [
  "value",
  "valeur",
  "target",
  "objectif",
  "seuil",
  "threshold",
  "required",
  "minimum",
  "min",
  "amount",
  "count",
  "nombre",
  "total",
];
const UNLOCKED_KEYS = [
  "unlocked",
  "isUnlocked",
  "debloque",
  "debloquee",
  "completed",
  "complete",
  "termine",
  "achieved",
];

function normalizeKey(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getFirstValue(source, keys) {
  if (!source || typeof source !== "object") return undefined;

  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }

  const normalizedEntries = Object.entries(source).map(([key, value]) => [
    normalizeKey(key),
    value,
  ]);

  for (const key of keys) {
    const normalizedKey = normalizeKey(key);
    const found = normalizedEntries.find(([entryKey, value]) => {
      return (
        entryKey === normalizedKey &&
        value !== undefined &&
        value !== null &&
        value !== ""
      );
    });
    if (found) return found[1];
  }

  return undefined;
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") return null;

  const compact = value.replace(/\s/g, "").replace(",", ".");
  const direct = Number(compact);
  if (Number.isFinite(direct)) return direct;

  const match = compact.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function getFirstNumber(source, keys) {
  const value = getFirstValue(source, keys);
  return toNumber(value);
}

function extractSuccesses(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  for (const key of LIST_KEYS) {
    const value = getFirstValue(data, [key]);
    if (Array.isArray(value)) return value;
  }

  return [];
}

function getMetricValue(metricName, gameMetrics) {
  const key = normalizeKey(metricName);
  const aliases = {
    totalsups: gameMetrics.totalSups,
    supstotal: gameMetrics.totalSups,
    totalsup: gameMetrics.totalSups,
    score: gameMetrics.totalSups,
    points: gameMetrics.totalSups,
    total: gameMetrics.totalSups,
    sups: gameMetrics.sups,
    currentsups: gameMetrics.sups,
    solde: gameMetrics.sups,
    balance: gameMetrics.sups,
    clickcount: gameMetrics.clickCount,
    click: gameMetrics.clickCount,
    clic: gameMetrics.clickCount,
    clicks: gameMetrics.clickCount,
    clics: gameMetrics.clickCount,
    nbclick: gameMetrics.clickCount,
    nbclic: gameMetrics.clickCount,
    nbclicks: gameMetrics.clickCount,
    nombreclics: gameMetrics.clickCount,
    nbclics: gameMetrics.clickCount,
    supsperclick: gameMetrics.supsPerClick,
    supperclick: gameMetrics.supsPerClick,
    cpc: gameMetrics.supsPerClick,
    parclick: gameMetrics.supsPerClick,
    parclic: gameMetrics.supsPerClick,
    supspersecond: gameMetrics.supsPerSecond,
    supspersec: gameMetrics.supsPerSecond,
    supsparseconde: gameMetrics.supsPerSecond,
    cps: gameMetrics.supsPerSecond,
    sps: gameMetrics.supsPerSecond,
    upgradesowned: gameMetrics.upgradesOwned,
    upgrade: gameMetrics.upgradesOwned,
    upgrades: gameMetrics.upgradesOwned,
    amelioration: gameMetrics.upgradesOwned,
    ameliorations: gameMetrics.upgradesOwned,
    ameliorationsachetees: gameMetrics.upgradesOwned,
  };

  return aliases[key];
}

function inferMetric(success, condition, threshold) {
  const rawMetric = getFirstValue(success, METRIC_KEYS);
  const text = [
    rawMetric,
    typeof condition === "string" ? condition : "",
    getFirstValue(success, NAME_KEYS),
    getFirstValue(success, DESCRIPTION_KEYS),
  ]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/\b(cpc|par clic|par click|sups\/clic|sups par clic)\b/.test(text)) {
    return "supsPerClick";
  }
  if (/\b(clic|click|clics|clicks)\b/.test(text)) return "clickCount";
  if (/\b(cps|sps|sec|seconde|second|auto|passif)\b/.test(text)) {
    return "supsPerSecond";
  }
  if (/\b(upgrade|amelioration|achat|acheter|achete|achetee)\b/.test(text)) {
    return "upgradesOwned";
  }

  return threshold !== null ? "totalSups" : null;
}

function evaluateExpression(condition, gameMetrics) {
  let hasUnknownToken = false;
  const expression = condition.replace(
    /[A-Za-z_\u00c0-\u00ff][A-Za-z0-9_\u00c0-\u00ff]*/g,
    (token) => {
      const lowerToken = token.toLowerCase();
      if (lowerToken === "true" || lowerToken === "false") return lowerToken;

      const metricValue = getMetricValue(token, gameMetrics);
      if (metricValue !== undefined && metricValue !== null) {
        return String(Number(metricValue) || 0);
      }

      hasUnknownToken = true;
      return token;
    },
  );

  if (hasUnknownToken) return false;
  if (!/^[\d\s.+\-*/%<>=!&|()]+$/.test(expression)) return false;

  try {
    // eslint-disable-next-line no-new-func
    return Boolean(Function(`"use strict"; return (${expression})`)());
  } catch {
    return false;
  }
}

function isSuccessAchieved(success, gameMetrics) {
  const unlockedValue = getFirstValue(success, UNLOCKED_KEYS);
  if (
    unlockedValue === true ||
    unlockedValue === 1 ||
    String(unlockedValue).toLowerCase() === "true"
  ) {
    return true;
  }

  const condition = getFirstValue(success, CONDITION_KEYS);
  const conditionObject =
    condition && typeof condition === "object" && !Array.isArray(condition)
      ? condition
      : null;

  if (
    typeof condition === "string" &&
    /[<>=!]=?|&&|\|\|/.test(condition) &&
    evaluateExpression(condition, gameMetrics)
  ) {
    return true;
  }

  const threshold =
    getFirstNumber(success, THRESHOLD_KEYS) ??
    getFirstNumber(conditionObject, THRESHOLD_KEYS) ??
    toNumber(condition);

  if (threshold === null) return false;

  const metric =
    getFirstValue(success, METRIC_KEYS) ??
    getFirstValue(conditionObject, METRIC_KEYS) ??
    inferMetric(success, condition, threshold);

  if (!metric) return false;

  const currentValue = getMetricValue(metric, gameMetrics);
  return currentValue !== undefined && Number(currentValue) >= threshold;
}

function getSuccessId(success, index) {
  const id = getFirstValue(success, ID_KEYS);
  return String(id ?? getFirstValue(success, NAME_KEYS) ?? `success-${index}`);
}

function toPopupItem(success, id) {
  return {
    id,
    popupId: `${id}-${Date.now()}`,
    name: getFirstValue(success, NAME_KEYS) || "Succès débloqué",
    description: getFirstValue(success, DESCRIPTION_KEYS),
  };
}

export function useSuccesses(
  gameMetrics,
  { enabled = true, resetKey = "default" } = {},
) {
  const [successes, setSuccesses] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const unlockedIdsRef = useRef(new Set());
  const popupTimersRef = useRef(new Map());

  useEffect(() => {
    setSuccesses([]);
    setUnlockedIds([]);
    setPopups([]);
    setError(null);
    unlockedIdsRef.current = new Set();
    popupTimersRef.current.forEach((timer) => clearTimeout(timer));
    popupTimersRef.current.clear();
  }, [resetKey]);

  // Fetch successes on mount
  useEffect(() => {
    if (!enabled) return;

    let ignore = false;

    async function fetchSuccesses() {
      try {
        const res = await getSuccesses();
        const list = extractSuccesses(res.data);

        if (ignore) return;

        if (res.ok && list.length > 0) {
          setSuccesses(list);
          setError(null);
        } else if (res.ok) {
          setSuccesses([]);
          setError(null);
        } else {
          setSuccesses([]);
          setError(`Erreur ${res.status}`);
        }
      } catch (err) {
        if (ignore) return;
        setSuccesses([]);
        setError(err.message || String(err));
      }
    }

    fetchSuccesses();

    return () => {
      ignore = true;
    };
  }, [enabled, resetKey]);

  useEffect(() => {
    return () => {
      popupTimersRef.current.forEach((timer) => clearTimeout(timer));
      popupTimersRef.current.clear();
    };
  }, []);

  // Detect and show achievement popups
  useEffect(() => {
    if (!enabled || successes.length === 0 || !gameMetrics) return;

    const newlyUnlocked = [];

    successes.forEach((success, index) => {
      const id = getSuccessId(success, index);
      if (unlockedIdsRef.current.has(id)) return;
      if (!isSuccessAchieved(success, gameMetrics)) return;

      unlockedIdsRef.current.add(id);
      newlyUnlocked.push(toPopupItem(success, id));
    });

    if (newlyUnlocked.length === 0) return;

    setUnlockedIds((prev) => [
      ...prev,
      ...newlyUnlocked.map((popup) => popup.id),
    ]);
    setPopups((prev) => [...prev, ...newlyUnlocked]);

    newlyUnlocked.forEach((popup) => {
      const timer = setTimeout(() => {
        setPopups((prev) =>
          prev.filter((item) => item.popupId !== popup.popupId),
        );
        popupTimersRef.current.delete(popup.popupId);
      }, 4000);
      popupTimersRef.current.set(popup.popupId, timer);
    });
  }, [enabled, successes, gameMetrics]);

  return { successes, unlockedIds, popups, error };
}
