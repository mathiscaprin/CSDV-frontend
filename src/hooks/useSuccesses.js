import { useEffect, useRef, useState } from "react";
import { getSuccesses, addSessionSuccesses } from "../utils/api.js";

const LIST_KEYS = ["data", "successes", "succes", "items", "results"];
const ID_KEYS = ["id", "_id", "uuid", "slug"];
const NAME_KEYS = ["name", "nom", "title", "titre", "label", "libelle"];
const DESCRIPTION_KEYS = ["description", "desc", "details", "detail"];
const CONDITION_KEYS = ["condition", "conditions", "critere", "critereSucces"];
const CONDITION_TYPE_KEYS = [
  "conditionType",
  "condition_type",
  "typeCondition",
  "type_condition",
  "objectifType",
  "metric",
  "metrique",
  "type",
];
const CONDITION_VALUE_KEYS = [
  "conditionValeur",
  "condition_value",
  "valeurCondition",
  "valeur_condition",
  "objectifValeur",
  "objectif_value",
  "value",
  "valeur",
];
const NESTED_CONDITION_KEYS = [
  "condition",
  "conditions",
  "critere",
  "criteres",
  "critereSucces",
  "objectif",
  "objectifs",
  "requirement",
  "requirements",
  "requis",
];
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
  "conditionValeur",
  "condition_value",
  "valeurCondition",
  "valeur_condition",
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
const METRIC_DEFINITIONS = [
  {
    metric: "totalSups",
    aliases: [
      "totalSups",
      "supsTotal",
      "sups_total",
      "total_sups",
      "score",
      "points",
      "total",
      "supsTotalRequis",
      "supsRequis",
      "objectifSups",
      "seuilSups",
      "palier",
    ],
    pattern: /\b(sups?_?total|total_?sups?|score|points|palier|seuil)\b/,
  },
  {
    metric: "sups",
    aliases: ["sups", "supsMonney", "supsMoney", "solde", "balance"],
    pattern: /\b(solde|balance|sups?_?money|sups?_?monney)\b/,
  },
  {
    metric: "clickCount",
    aliases: [
      "clickCount",
      "click_count",
      "nbClicks",
      "nbClics",
      "nombreClics",
      "clics",
      "clicks",
      "clic",
      "click",
    ],
    pattern: /\b(clic|click|clics|clicks|nb_?clics?|nb_?clicks?)\b/,
  },
  {
    metric: "supsPerClick",
    aliases: [
      "supsPerClick",
      "sups_per_click",
      "supsParClic",
      "supsParClick",
      "cpc",
      "parClic",
      "parClick",
    ],
    pattern: /\b(cpc|par_?clic|par_?click|sups?\/clic|sups?_?par_?clic)\b/,
  },
  {
    metric: "supsPerSecond",
    aliases: [
      "supsPerSecond",
      "sups_per_second",
      "supsPerSec",
      "supsParSeconde",
      "supsParSec",
      "cps",
      "sps",
    ],
    pattern: /\b(cps|sps|sec|seconde|second|auto|passif)\b/,
  },
  {
    metric: "upgradesOwned",
    aliases: [
      "upgradesOwned",
      "upgrades",
      "upgrade",
      "ameliorations",
      "ameliorationsAchetees",
      "batiments",
      "batimentsAchetes",
      "batiments_total",
      "batimentsTotal",
      "totalBatiments",
      "nombreBatiments",
    ],
    pattern: /\b(upgrade|amelioration|batiment|achat|acheter|achete|achetee)\b/,
  },
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

function getObjectValues(source, keys) {
  const values = [];
  if (!source || typeof source !== "object") return values;

  keys.forEach((key) => {
    const value = getFirstValue(source, [key]);
    if (value !== undefined && value !== null && value !== "") {
      values.push(value);
    }
  });

  return values;
}

function flattenConditionValues(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenConditionValues(item));
  }

  if (value && typeof value === "object") {
    return [
      value,
      ...getObjectValues(value, NESTED_CONDITION_KEYS).flatMap((item) =>
        flattenConditionValues(item),
      ),
    ];
  }

  return value !== undefined && value !== null && value !== "" ? [value] : [];
}

function getConditionCandidates(success) {
  return [
    success,
    ...getObjectValues(success, NESTED_CONDITION_KEYS).flatMap((value) =>
      flattenConditionValues(value),
    ),
  ];
}

function getTextFromCandidate(candidate) {
  if (typeof candidate === "string") return candidate;
  if (!candidate || typeof candidate !== "object") return "";

  return [
    getFirstValue(candidate, METRIC_KEYS),
    getFirstValue(candidate, CONDITION_KEYS),
    getFirstValue(candidate, NAME_KEYS),
    getFirstValue(candidate, DESCRIPTION_KEYS),
  ]
    .filter((value) => typeof value === "string")
    .join(" ");
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

function mergeSuccesses(localSuccesses, fetchedSuccesses) {
  const merged = [];
  const seen = new Set();

  [...localSuccesses, ...fetchedSuccesses].forEach((success, index) => {
    const id = getSuccessId(success, index);
    if (seen.has(id)) return;

    seen.add(id);
    merged.push(success);
  });

  return merged;
}

function getMetricValue(metricName, gameMetrics) {
  const key = normalizeKey(metricName);

  const definition = METRIC_DEFINITIONS.find(({ metric, aliases }) => {
    return (
      metric === metricName ||
      aliases.some((alias) => normalizeKey(alias) === key)
    );
  });

  return definition ? gameMetrics[definition.metric] : undefined;
}

function getMetricName(metricName) {
  if (!metricName) return null;
  const key = normalizeKey(metricName);
  const definition = METRIC_DEFINITIONS.find(({ metric, aliases }) => {
    return (
      normalizeKey(metric) === key ||
      aliases.some((alias) => normalizeKey(alias) === key)
    );
  });

  return definition?.metric ?? null;
}

function getMetricFromCandidate(candidate) {
  const metric = getMetricName(getFirstValue(candidate, METRIC_KEYS));
  if (metric) return metric;

  const normalizedKeys =
    candidate && typeof candidate === "object"
      ? Object.keys(candidate).map((key) => normalizeKey(key))
      : [];

  const directField = METRIC_DEFINITIONS.find(({ metric, aliases }) => {
    return [metric, ...aliases].some((alias) =>
      normalizedKeys.includes(normalizeKey(alias)),
    );
  });
  if (directField) return directField.metric;

  const text = getTextFromCandidate(candidate)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return (
    METRIC_DEFINITIONS.find(({ pattern }) => pattern.test(text))?.metric ?? null
  );
}

function getMetricThresholdFromCandidate(candidate) {
  if (!candidate || typeof candidate !== "object") return null;

  for (const definition of METRIC_DEFINITIONS) {
    const threshold = getFirstNumber(candidate, [
      definition.metric,
      ...definition.aliases,
    ]);
    if (threshold !== null) {
      return { metric: definition.metric, threshold };
    }
  }

  return null;
}

function getBuildingQuantity(gameMetrics, buildingId) {
  if (!buildingId) return 0;

  return Number(gameMetrics.buildingQuantities?.[String(buildingId)] ?? 0);
}

function evaluateBackendCondition(candidate, gameMetrics) {
  if (!candidate || typeof candidate !== "object") return null;

  const rawConditionType = getFirstValue(candidate, CONDITION_TYPE_KEYS);
  const threshold = getFirstNumber(candidate, CONDITION_VALUE_KEYS);

  if (!rawConditionType || threshold === null) return null;

  const [rawType, targetId] = String(rawConditionType).split(":");
  const conditionType = normalizeKey(rawType);

  if (conditionType === "batimentquantite") {
    return getBuildingQuantity(gameMetrics, targetId) >= threshold;
  }

  if (conditionType === "batimentstotal") {
    return Number(gameMetrics.upgradesOwned ?? 0) >= threshold;
  }

  if (conditionType === "supspersecond") {
    return Number(gameMetrics.supsPerSecond ?? 0) >= threshold;
  }

  if (conditionType === "supstotal") {
    return Number(gameMetrics.totalSups ?? 0) >= threshold;
  }

  const metric = getMetricName(rawType);
  if (!metric) return null;

  return Number(gameMetrics[metric] ?? 0) >= threshold;
}

function inferMetric(success, condition, threshold) {
  const rawMetric = getMetricFromCandidate(success);
  if (rawMetric) return rawMetric;

  const text = [
    getTextFromCandidate(success),
    typeof condition === "string" ? condition : "",
  ]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const inferred = METRIC_DEFINITIONS.find(({ pattern }) => pattern.test(text));
  if (inferred) return inferred.metric;

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
  const candidates = getConditionCandidates(success);

  const backendConditionMatched = candidates
    .map((candidate) => evaluateBackendCondition(candidate, gameMetrics))
    .find((result) => result !== null);
  if (backendConditionMatched !== undefined) return backendConditionMatched;

  const expressionMatched = candidates.some((candidate) => {
    return (
      typeof candidate === "string" &&
      /[<>=!]=?|&&|\|\|/.test(candidate) &&
      evaluateExpression(candidate, gameMetrics)
    );
  });
  if (expressionMatched) return true;

  const directMetricThreshold = candidates
    .map((candidate) => getMetricThresholdFromCandidate(candidate))
    .find(Boolean);

  if (directMetricThreshold) {
    const currentValue = gameMetrics[directMetricThreshold.metric];
    return (
      currentValue !== undefined &&
      Number(currentValue) >= directMetricThreshold.threshold
    );
  }

  const threshold =
    candidates
      .map((candidate) => getFirstNumber(candidate, THRESHOLD_KEYS))
      .find((value) => value !== null) ?? toNumber(condition);

  if (threshold === null) return false;

  const metric =
    candidates
      .map((candidate) => getMetricFromCandidate(candidate))
      .find(Boolean) ?? inferMetric(success, condition, threshold);

  if (!metric) return false;

  const currentValue =
    gameMetrics[metric] ?? getMetricValue(metric, gameMetrics);
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
  {
    enabled = true,
    localSuccesses = [],
    resetKey = "default",
    sessionId,
    token,
  } = {},
) {
  const [successes, setSuccesses] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [popups, setPopups] = useState([]);
  const [error, setError] = useState(null);
  const unlockedIdsRef = useRef(new Set());
  const popupTimersRef = useRef(new Map());
  const hasCapturedInitialUnlockedRef = useRef(false);

  useEffect(() => {
    setSuccesses([]);
    setUnlockedIds([]);
    setPopups([]);
    setError(null);
    unlockedIdsRef.current = new Set();
    hasCapturedInitialUnlockedRef.current = false;
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

        if (res.ok) {
          setSuccesses(mergeSuccesses(localSuccesses, list));
          setError(null);
        } else {
          setSuccesses(localSuccesses);
          setError(`Erreur ${res.status}`);
        }
      } catch (err) {
        if (ignore) return;
        setSuccesses(localSuccesses);
        setError(err.message || String(err));
      }
    }

    fetchSuccesses();

    return () => {
      ignore = true;
    };
  }, [enabled, localSuccesses, resetKey]);

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

    if (newlyUnlocked.length === 0) {
      hasCapturedInitialUnlockedRef.current = true;
      return;
    }

    const succesIds = newlyUnlocked.map((popup) => popup.id);

    if (succesIds.length > 0) {
      console.log("POST succès", { sessionId, succesIds });

      addSessionSuccesses(token, succesIds).catch((err) => {
        console.error("Erreur ajout succès session :", err);
      });
    }

    setUnlockedIds((prev) => [
      ...prev,
      ...newlyUnlocked.map((popup) => popup.id),
    ]);

    if (!hasCapturedInitialUnlockedRef.current) {
      hasCapturedInitialUnlockedRef.current = true;
      return;
    }

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
  }, [enabled, successes, gameMetrics, token]);

  return { successes, unlockedIds, popups, error };
}
