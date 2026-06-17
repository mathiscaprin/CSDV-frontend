import { useEffect, useRef, useState } from "react";
import Header from "./components/Header/Header.jsx";
import Clicker from "./components/Clicker/Clicker.jsx";
import ProgressBar from "./components/ProgressBar/ProgressBar.jsx";
import UpgradesList from "./components/Upgrades/UpgradesList.jsx";
import RankUpAnnouncement from "./components/RankUpAnnouncement/RankUpAnnouncement.jsx";
import Confetti from "./components/Confetti/Confetti.jsx";
import LoginPage from "./components/Auth/LoginPage.jsx";
import Leaderboard from "./components/Leaderboard/Leaderboard.jsx";
import AchievementPopup from "./components/Achievements/AchievementPopup.jsx";
import { useGameState } from "./hooks/useGameState.js";
import { useSuccesses } from "./hooks/useSuccesses.js";
import { getCurrentRank, getNextRank, getProgress } from "./utils/ranks.js";
import {
  createSession,
  getSession,
  getUpgrade,
  getUpgradesBySession,
  saveSession,
  saveUpgrades,
  signOut,
} from "./utils/api.js";
import { INITIAL_UPGRADES } from "./data/upgrades.js";
import "./App.css";

const USER_STORAGE_KEY = "clicker-sdv-user";
const DEBUG_SUCCESSES = [
  {
    id: "debug-total-sups-100",
    name: "Test 100 SUPS",
    description: "Tu as atteint 100 sups_total.",
    metric: "sups_total",
    value: 100,
  },
];

function loadStoredUser() {
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  if (user) {
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }
}

function getSavedUpgradeId(savedUpgrade) {
  return (
    savedUpgrade?.batimentId ??
    savedUpgrade?.batiment?.id ??
    savedUpgrade?.idBatiment ??
    savedUpgrade?.buildingId
  );
}

function normalizeUpgrade(batiment, savedUpgrade) {
  const ordreAffichage = batiment.ordreAffichage;
  const isClickBooster = Number(ordreAffichage) === 0;

  return {
    ...batiment,
    id: batiment.id,
    name: batiment.name ?? batiment.nom,
    desc: batiment.desc ?? batiment.description,
    baseCost: batiment.baseCost ?? batiment.coutBase ?? 0,
    cps: isClickBooster ? 0 : (batiment.cps ?? batiment.multiplicateurCps ?? 0),
    cpc: isClickBooster ? 1 : (batiment.cpc ?? 0),
    ordreAffichage,
    owned: Number(savedUpgrade?.quantite ?? savedUpgrade?.owned ?? 0) || 0,
  };
}

function mapSessionData(session = {}, baseBatiments = [], userBatiments = []) {
  const baseList =
    Array.isArray(baseBatiments) && baseBatiments.length
      ? baseBatiments
      : INITIAL_UPGRADES;
  const savedUpgrades = Array.isArray(userBatiments) ? userBatiments : [];

  const validUpgrades = savedUpgrades.filter((saved) => {
    const savedId = getSavedUpgradeId(saved);
    return baseList.some((batiment) => String(batiment.id) === String(savedId));
  });

  const upgrades = baseList.map((batiment) => {
    const saved = validUpgrades.find(
      (item) => String(getSavedUpgradeId(item)) === String(batiment.id),
    );
    return normalizeUpgrade(batiment, saved);
  });

  const clickBoosterCount = upgrades.reduce((sum, upgrade) => {
    return (
      sum +
      (Number(upgrade.ordreAffichage) === 0 ? Number(upgrade.owned) || 0 : 0)
    );
  }, 0);

  const supsPerSecond = upgrades.reduce((sum, upgrade) => {
    const owned = Number(upgrade.owned) || 0;
    return sum + owned * (Number(upgrade.ordreAffichage) === 0 ? 0 : upgrade.cps);
  }, 0);

  return {
    sups: Number(session.supsMonney ?? session.supsTotal) || 0,
    totalSups: Number(session.supsTotal) || 0,
    supsPerClick: Math.max(1, 1 + clickBoosterCount),
    supsPerClickCount: clickBoosterCount,
    supsPerSecond: Number(session.supsPerSecond) || supsPerSecond,
    upgrades,
    filteredUserUpgrades: validUpgrades,
  };
}

export default function App() {
  const [auth, setAuth] = useState(loadStoredUser);
  const [sessionState, setSessionState] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [clickCount, setClickCount] = useState(0);

  const {
    sups,
    totalSups,
    supsPerClick,
    supsPerSecond,
    upgrades,
    click,
    buyUpgrade,
  } = useGameState(sessionState || {});

  const gameMetrics = {
    totalSups,
    sups,
    supsPerClick,
    supsPerSecond,
    clickCount,
    upgradesOwned: upgrades.reduce((acc, upgrade) => {
      return acc + (Number(upgrade.owned) || 0);
    }, 0),
    buildingQuantities: upgrades.reduce((acc, upgrade) => {
      acc[String(upgrade.id)] = Number(upgrade.owned) || 0;
      return acc;
    }, {}),
  };

  const {
    successes,
    unlockedIds,
    popups,
    error: successesError,
  } = useSuccesses(gameMetrics, {
    enabled: Boolean(auth && sessionState),
    localSuccesses: DEBUG_SUCCESSES,
    resetKey:
      auth?.userId ??
      auth?.id ??
      auth?._id ??
      auth?.email ??
      auth?.username ??
      "guest",
  });

  const currentRank = getCurrentRank(totalSups);
  const nextRank = getNextRank(totalSups);
  const progress = getProgress(totalSups);

  const [rankUp, setRankUp] = useState(null);
  const previousRankName = useRef(null);

  useEffect(() => {
    if (previousRankName.current === null) {
      previousRankName.current = currentRank.name;
      return;
    }
    if (previousRankName.current === currentRank.name) return;

    previousRankName.current = currentRank.name;
    setRankUp(currentRank);
    document.body.classList.add("shake");

    const shakeTimer = setTimeout(
      () => document.body.classList.remove("shake"),
      500,
    );
    const announceTimer = setTimeout(() => setRankUp(null), 2200);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(announceTimer);
    };
  }, [currentRank]);

  useEffect(() => {
    saveUser(auth);
  }, [auth]);

  async function buildSessionState(sessionData) {
    try {
      const [baseResponse, sessionBatimentsResponse] = await Promise.all([
        getUpgrade(auth?.token),
        getUpgradesBySession(auth?.token),
      ]);

      if (!baseResponse.ok || !Array.isArray(baseResponse.data)) {
        return mapSessionData(sessionData);
      }

      const savedBatiments = sessionBatimentsResponse.ok
        ? sessionBatimentsResponse.data
        : [];
      const mappedSession = mapSessionData(
        sessionData,
        baseResponse.data,
        savedBatiments,
      );

      if (sessionBatimentsResponse.ok && Array.isArray(savedBatiments)) {
        const obsoleteItems = savedBatiments.filter((saved) => {
          const savedId = getSavedUpgradeId(saved);
          return !baseResponse.data.some(
            (batiment) => String(batiment.id) === String(savedId),
          );
        });

        if (obsoleteItems.length > 0) {
          await saveUpgrades(mappedSession.upgrades, auth?.token);
        }
      }

      return mappedSession;
    } catch {
      return mapSessionData(sessionData);
    }
  }

  async function loadSession() {
    setLoadingSession(true);
    setSessionError(null);

    const response = await getSession();
    if (response.ok) {
      setSessionState(await buildSessionState(response.data));
      setLoadingSession(false);
      return;
    }

    if (response.status === 404) {
      const createResponse = await createSession();
      if (!createResponse.ok && createResponse.status !== 201) {
        setSessionError("Impossible de creer la session de jeu.");
        setLoadingSession(false);
        return;
      }

      const retry = await getSession();
      if (retry.ok) {
        setSessionState(await buildSessionState(retry.data));
      } else {
        setSessionState(mapSessionData());
      }
      setLoadingSession(false);
      return;
    }

    if (response.status === 401) {
      setSessionError("Votre session a expire. Merci de vous reconnecter.");
      setAuth(null);
      saveUser(null);
      setLoadingSession(false);
      return;
    }

    setSessionError("Impossible de charger la session de jeu.");
    setLoadingSession(false);
  }

  useEffect(() => {
    if (!auth) return;
    loadSession();
  }, [auth]);

  async function saveGameState(currentStatus) {
    const clickBoosterCount = upgrades.reduce((sum, upgrade) => {
      return (
        sum +
        (Number(upgrade.ordreAffichage) === 0 ? Number(upgrade.owned) || 0 : 0)
      );
    }, 0);

    await saveSession({
      totalSups,
      supsPerSecond,
      supsPerClick: clickBoosterCount,
      sups,
    });
    await saveUpgrades(upgrades, auth?.token);
    setSaveStatus(currentStatus);
  }

  useEffect(() => {
    if (!auth || !sessionState) return;

    const timeout = setTimeout(async () => {
      try {
        await saveGameState("Sauvegarde automatique");
      } catch {
        setSaveStatus("Erreur de sauvegarde");
      }
    }, 2500);

    return () => clearTimeout(timeout);
  }, [auth, sessionState, totalSups, supsPerSecond, supsPerClick, sups, upgrades]);

  async function handleLogin(newAuth) {
    setAuth(newAuth);
    setSessionState(null);
    setSaveStatus("");
  }

  async function handleManualSave() {
    if (!auth) return;
    try {
      await saveGameState("Sauvegarde envoyee");
    } catch {
      setSaveStatus("Erreur de sauvegarde");
    }
  }

  async function handleLogout() {
    await signOut();
    setAuth(null);
    setSessionState(null);
    setSaveStatus("");
    saveUser(null);
  }

  if (!auth) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loadingSession) {
    return <div className="loading-screen">Connexion au backend...</div>;
  }

  return (
    <>
      <div className="plus-grid"></div>

      <RankUpAnnouncement rank={rankUp} />
      <Confetti burst={rankUp} />

      <Header
        sups={sups}
        supsPerSecond={supsPerSecond}
        rankName={currentRank.name}
        username={auth.username}
        onLogout={handleLogout}
        onSave={handleManualSave}
        saveStatus={saveStatus}
      />

      <main>
        {sessionError ? (
          <div className="session-error">{sessionError}</div>
        ) : null}

        <Clicker
          onClick={() => {
            const gained = click();
            setClickCount((count) => count + 1);
            return gained;
          }}
        />

        <ProgressBar
          currentRank={currentRank}
          nextRank={nextRank}
          progress={progress}
        />

        <UpgradesList upgrades={upgrades} sups={sups} onBuy={buyUpgrade} />
      </main>

      <aside className="debug-window" aria-label="Debug succes">
        <div className="debug-window-title">Debug succes</div>
        <div className="debug-window-row">
          <span>Succes recuperes</span>
          <strong>{successes.length}</strong>
        </div>
        <div className="debug-window-row">
          <span>Succes reussis</span>
          <strong>{unlockedIds.length}</strong>
        </div>
        {successesError ? (
          <div className="debug-window-error">{successesError}</div>
        ) : null}
      </aside>

      <AchievementPopup items={popups} />
      <Leaderboard />
    </>
  );
}
