// ═══════════════════════════════════════════════════════════════════════════════
//  RFT Question Generator
//  Generates relational frame puzzles using pronounceable nonsense words.
// ═══════════════════════════════════════════════════════════════════════════════

const WORD_POOL = [
  'CUG', 'JEF', 'LOM', 'ZOG', 'KEP',
  'VIM', 'DAX', 'WUB', 'FOZ', 'TAL',
  'REB', 'SUP', 'MIV', 'POK', 'TUF',
  'GAL', 'BIX', 'ROF', 'NEP', 'WOZ',
]

// ─── Utilities ─────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle (returns new array) */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick N unique items from an array at random */
function sample(arr, n) {
  return shuffle(arr).slice(0, n)
}

// ─── Level configuration ───────────────────────────────────────────────────────

/**
 * Returns parameters for the question generator based on level.
 * @param {number} level
 * @returns {{ chainLength: number, frames: string[], questionGap: number }}
 */
function getLevelConfig(level) {
  if (level <= 2) {
    return {
      chainLength: level === 1 ? 3 : 4,
      frames: ['more'],       // only "more than"
      questionGap: level === 1 ? 2 : 2,
    }
  } else if (level <= 4) {
    return {
      chainLength: level === 3 ? 4 : 5,
      frames: ['more', 'less'],   // both directions
      questionGap: 2,
    }
  } else {
    return {
      chainLength: Math.min(5 + Math.floor((level - 5) / 2), 7),
      frames: ['more', 'less', 'same'],
      questionGap: level <= 6 ? 2 : 3,
    }
  }
}

// ─── Premise builders ──────────────────────────────────────────────────────────

/**
 * Build premises for a "more/less than" linear chain.
 * chain: [A, B, C, D] means A > B > C > D
 */
function buildLinearPremises(chain, frame) {
  const premises = []

  // Build adjacent-pair premises (shuffled order to avoid trivial reading)
  const pairs = []
  for (let i = 0; i < chain.length - 1; i++) {
    pairs.push([chain[i], chain[i + 1]])
  }

  for (const [higher, lower] of shuffle(pairs)) {
    if (frame === 'more') {
      premises.push(`${higher} is more than ${lower}`)
    } else {
      // Express the same relationship using "less than" phrasing
      premises.push(`${lower} is less than ${higher}`)
    }
  }

  return premises
}

/**
 * Build premises for a "same as" chain (equivalence).
 * All items in the chain are equivalent to the first anchor.
 */
function buildSamePremises(chain) {
  const anchor = chain[0]
  const premises = []
  const pairs = []
  for (let i = 1; i < chain.length; i++) {
    pairs.push(chain[i])
  }
  for (const word of shuffle(pairs)) {
    premises.push(`${word} is the same as ${anchor}`)
  }
  return premises
}

// ─── Main generator ────────────────────────────────────────────────────────────

/**
 * Generate a complete RFT question for the given level.
 *
 * @param {number} level - Current player level (1+)
 * @returns {{
 *   premises: string[],
 *   question: string,
 *   correctAnswer: boolean,
 *   frame: string
 * }}
 */
export function generateQuestion(level) {
  const config = getLevelConfig(level)
  const { chainLength, frames, questionGap } = config

  // Pick words for this question
  const words = sample(WORD_POOL, chainLength)

  // Choose a random relational frame for this question
  const frame = frames[Math.floor(Math.random() * frames.length)]

  let premises = []
  let question = ''
  let correctAnswer = false

  if (frame === 'same') {
    // ── Same-as frame ──────────────────────────────────────────────────────────
    premises = buildSamePremises(words)

    // Question: is [word1] the same as [word2]?
    // Both are equivalent → answer is always true for same-frame; sometimes ask opposite
    const askTrue = Math.random() < 0.5

    if (askTrue) {
      const [a, b] = sample(words, 2)
      question = `Is ${a} the same as ${b}?`
      correctAnswer = true
    } else {
      // Introduce a word NOT in the chain to make it false
      const outsider = sample(
        WORD_POOL.filter(w => !words.includes(w)),
        1
      )[0]
      const chainWord = words[Math.floor(Math.random() * words.length)]
      question = `Is ${chainWord} the same as ${outsider}?`
      correctAnswer = false
    }
  } else {
    // ── More/Less frame (linear ranking) ──────────────────────────────────────
    // words[0] is the highest, words[chainLength-1] is the lowest
    const premiseFrame = frame === 'less' && Math.random() < 0.5 ? 'less' : 'more'
    premises = buildLinearPremises(words, premiseFrame)

    // Pick two items separated by at least `questionGap` positions
    let indexA, indexB
    let attempts = 0
    do {
      indexA = Math.floor(Math.random() * (chainLength - questionGap))
      indexB = indexA + questionGap + Math.floor(Math.random() * (chainLength - indexA - questionGap))
      attempts++
    } while (indexB >= chainLength && attempts < 20)

    if (indexB >= chainLength) indexB = chainLength - 1

    const wordA = words[indexA] // higher-ranked
    const wordB = words[indexB] // lower-ranked

    // Randomly decide question phrasing and whether it's correct
    const questionType = Math.random() < 0.5 ? 'more' : 'less'
    const askTrue = Math.random() < 0.5

    if (questionType === 'more') {
      if (askTrue) {
        // A > B: correct
        question = `Is ${wordA} more than ${wordB}?`
        correctAnswer = true
      } else {
        // B > A: incorrect (B is lower)
        question = `Is ${wordB} more than ${wordA}?`
        correctAnswer = false
      }
    } else {
      if (askTrue) {
        // B < A: correct (B is lower)
        question = `Is ${wordB} less than ${wordA}?`
        correctAnswer = true
      } else {
        // A < B: incorrect (A is higher)
        question = `Is ${wordA} less than ${wordB}?`
        correctAnswer = false
      }
    }
  }

  return { premises, question, correctAnswer, frame }
}

export default generateQuestion
