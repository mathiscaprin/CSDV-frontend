import { useCallback, useEffect, useState } from 'react'
import { getSessionSuccesses } from '../../utils/api.js'
import './SuccessesPage.css'

const LIST_KEYS = ['data', 'successes', 'succes', 'items', 'results']
const SUCCESS_OBJECT_KEYS = ['succes', 'success', 'achievement', 'defi', 'challenge']
const ID_KEYS = ['id', '_id', 'uuid', 'slug']
const SUCCESS_ID_KEYS = [
  'succesId',
  'successId',
  'succes_id',
  'success_id',
  'idSucces',
  'id_success',
]
const NAME_KEYS = ['name', 'nom', 'title', 'titre', 'label', 'libelle']
const DESCRIPTION_KEYS = ['description', 'desc', 'details', 'detail']
const CONDITION_KEYS = ['condition', 'conditions', 'critere', 'critereSucces', 'objectif']
const DATE_KEYS = [
  'unlockedAt',
  'obtainedAt',
  'completedAt',
  'createdAt',
  'dateObtention',
  'dateRealisation',
  'realiseLe',
  'date',
]

function normalizeKey(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function getFirstValue(source, keys) {
  if (!source || typeof source !== 'object') return undefined

  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }

  const normalizedEntries = Object.entries(source).map(([key, value]) => [
    normalizeKey(key),
    value,
  ])

  for (const key of keys) {
    const normalizedKey = normalizeKey(key)
    const found = normalizedEntries.find(([entryKey, value]) => {
      return (
        entryKey === normalizedKey &&
        value !== undefined &&
        value !== null &&
        value !== ''
      )
    })
    if (found) return found[1]
  }

  return undefined
}

function extractSuccesses(data) {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []

  for (const key of LIST_KEYS) {
    const value = getFirstValue(data, [key])
    if (Array.isArray(value)) return value
  }

  return []
}

function getSuccessPayload(item) {
  if (!item || typeof item !== 'object') return {}

  const nested = getFirstValue(item, SUCCESS_OBJECT_KEYS)
  return nested && typeof nested === 'object' ? nested : item
}

function getSuccessId(item, payload, index) {
  const nestedId = getFirstValue(item, SUCCESS_OBJECT_KEYS)
  const rawId =
    getFirstValue(payload, ID_KEYS) ??
    getFirstValue(item, SUCCESS_ID_KEYS) ??
    (typeof nestedId === 'string' || typeof nestedId === 'number' ? nestedId : undefined) ??
    getFirstValue(item, ID_KEYS) ??
    `success-${index}`

  return String(rawId)
}

function formatDate(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function normalizeSuccess(item, index) {
  const payload = getSuccessPayload(item)
  const id = getSuccessId(item, payload, index)
  const title =
    getFirstValue(payload, NAME_KEYS) ??
    getFirstValue(item, NAME_KEYS) ??
    `Défi #${id}`
  const description =
    getFirstValue(payload, DESCRIPTION_KEYS) ??
    getFirstValue(item, DESCRIPTION_KEYS)
  const condition =
    getFirstValue(payload, CONDITION_KEYS) ??
    getFirstValue(item, CONDITION_KEYS)
  const rawDate =
    getFirstValue(item, DATE_KEYS) ??
    getFirstValue(payload, DATE_KEYS)

  return {
    id,
    title,
    description,
    condition: typeof condition === 'string' ? condition : null,
    dateLabel: formatDate(rawDate),
    dateTime: rawDate ? String(rawDate) : undefined,
  }
}

export default function SuccessesPage({ token }) {
  const [successes, setSuccesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadSuccesses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getSessionSuccesses(token)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Votre session a expiré. Reconnectez-vous pour voir vos défis.')
        }
        throw new Error('Impossible de charger vos défis réalisés.')
      }

      setSuccesses(
        extractSuccesses(response.data).map((item, index) =>
          normalizeSuccess(item, index),
        ),
      )
    } catch (err) {
      setError(err.message || 'Impossible de charger vos défis réalisés.')
      setSuccesses([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadSuccesses()
  }, [loadSuccesses])

  return (
    <section className="successes-page" aria-labelledby="successes-title">
      <div className="successes-header">
        <div>
          <div className="section-eyebrow">🏆 Défis réalisés</div>
          <h1 id="successes-title">Succès débloqués</h1>
        </div>
        <button
          type="button"
          className="successes-refresh"
          onClick={loadSuccesses}
          disabled={loading}
          aria-label="Actualiser les défis réalisés"
          title="Actualiser"
        >
          ↻
        </button>
      </div>

      <div className="successes-summary" aria-live="polite">
        <span className="successes-summary-value">{successes.length}</span>
        <span className="successes-summary-label">
          {successes.length === 1 ? 'défi réalisé' : 'défis réalisés'}
        </span>
      </div>

      {loading ? (
        <div className="successes-state">Chargement des défis...</div>
      ) : error ? (
        <div className="successes-state successes-state--error">{error}</div>
      ) : successes.length === 0 ? (
        <div className="successes-state">Aucun défi réalisé pour le moment.</div>
      ) : (
        <ul className="successes-list" aria-label="Défis réalisés">
          {successes.map((success, index) => (
            <li className="success-card" key={`${success.id}-${index}`} tabIndex={0}>
              <div className="success-card-icon" aria-hidden="true">
                ✓
              </div>
              <div className="success-card-body">
                <div className="success-card-title">{success.title}</div>
                {success.description ? (
                  <div className="success-card-desc">{success.description}</div>
                ) : null}
                {success.condition ? (
                  <div className="success-card-condition">{success.condition}</div>
                ) : null}
              </div>
              {success.dateLabel ? (
                <time className="success-card-date" dateTime={success.dateTime}>
                  {success.dateLabel}
                </time>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
