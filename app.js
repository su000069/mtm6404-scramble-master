/**********************************************
 * STARTER CODE
 **********************************************/

/**
 * shuffle()
 * Shuffle the contents of an array
 *   depending the datatype of the source
 * Makes a copy. Does NOT shuffle the original.
 * Based on Steve Griffith's array shuffle prototype
 * @Parameters: Array or string
 * @Return: Scrambled Array or string, based on the provided parameter
 */
function shuffle (src) {
  const copy = [...src]

  const length = copy.length
  for (let i = 0; i < length; i++) {
    const x = copy[i]
    const y = Math.floor(Math.random() * length)
    const z = copy[y]
    copy[i] = z
    copy[y] = x
  }

  if (typeof src === 'string') {
    return copy.join('')
  }

  return copy
}

/**********************************************
 * YOUR CODE BELOW
 **********************************************/

// Starting word database (letters only, no spaces or special characters)
const WORDS = [
  'react',
  'javascript',
  'component',
  'browser',
  'function',
  'variable',
  'scramble',
  'keyboard',
  'developer',
  'frontend',
  'storage',
  'assignment'
]

// Maximum strikes allowed before game over
const MAX_STRIKES = 3

// Number of passes given at the start of a game
const MAX_PASSES = 3

// localStorage key used to persist the game
const STORAGE_KEY = 'scrambleGame'

/**
 * Create a fresh game state with shuffled words
 */
function createNewGame () {
  // Shuffle the full word list for a new round
  const shuffledWords = shuffle(WORDS)

  return {
    wordList: shuffledWords,
    currentIndex: 0,
    // Scramble the letters of the first word
    scrambledWord: shuffle(shuffledWords[0]),
    points: 0,
    strikes: 0,
    passes: MAX_PASSES,
    feedback: '',
    gameOver: false
  }
}

/**
 * Load saved game from localStorage, or start a new game
 */
function loadGame () {
  const saved = localStorage.getItem(STORAGE_KEY)

  // If nothing is saved yet, start a brand new game
  if (!saved) {
    return createNewGame()
  }

  // Parse the saved JSON string back into an object
  return JSON.parse(saved)
}

function App () {
  // Load saved progress once for all starting state values
  const [initialGame] = React.useState(function () {
    return loadGame()
  })

  // Remaining words for the current game
  const [wordList, setWordList] = React.useState(initialGame.wordList)
  // Index of the word the player is currently guessing
  const [currentIndex, setCurrentIndex] = React.useState(initialGame.currentIndex)
  // The scrambled version of the current word
  const [scrambledWord, setScrambledWord] = React.useState(initialGame.scrambledWord)
  // Text currently typed into the guess input
  const [guess, setGuess] = React.useState('')
  // Number of correct guesses
  const [points, setPoints] = React.useState(initialGame.points)
  // Number of incorrect guesses
  const [strikes, setStrikes] = React.useState(initialGame.strikes)
  // Number of skips remaining
  const [passes, setPasses] = React.useState(initialGame.passes)
  // Message shown after each guess
  const [feedback, setFeedback] = React.useState(initialGame.feedback || '')
  // Whether the game has ended
  const [gameOver, setGameOver] = React.useState(initialGame.gameOver)

  // Save important game state whenever it changes
  React.useEffect(() => {
    const gameState = {
      wordList,
      currentIndex,
      scrambledWord,
      points,
      strikes,
      passes,
      feedback,
      gameOver
    }

    // Store the full game state as a JSON string
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
  }, [wordList, currentIndex, scrambledWord, points, strikes, passes, feedback, gameOver])

  /**
   * Update the guess text as the player types
   */
  function handleGuessChange (e) {
    setGuess(e.target.value)
  }

  /**
   * Move to the next word, or end the game if none remain
   */
  function goToNextWord (updatedWordList, nextIndex) {
    // If every word has been used, the game is over
    if (nextIndex >= updatedWordList.length) {
      setGameOver(true)
      setFeedback('Game over! You finished all the words. / 游戏结束！你已完成所有单词。')
      return
    }

    // Scramble the next remaining word
    setCurrentIndex(nextIndex)
    setScrambledWord(shuffle(updatedWordList[nextIndex]))
  }

  /**
   * Handle form submit when the player presses Enter
   */
  function handleSubmit (e) {
    // Prevent the browser from refreshing the page
    e.preventDefault()

    // Ignore empty guesses
    if (guess.trim() === '') {
      return
    }

    // Get the current answer word
    const currentWord = wordList[currentIndex]

    // Compare guesses without worrying about letter case
    if (guess.trim().toLowerCase() === currentWord.toLowerCase()) {
      // Correct guess: award a point
      const newPoints = points + 1
      setPoints(newPoints)
      setFeedback('Correct! / 正确！')

      // Remove the guessed word from the list
      const updatedWordList = wordList.filter(function (word, index) {
        return index !== currentIndex
      })
      setWordList(updatedWordList)

      // After removal, the next word sits at the same index
      goToNextWord(updatedWordList, currentIndex)
    } else {
      // Incorrect guess: add a strike
      const newStrikes = strikes + 1
      setStrikes(newStrikes)
      setFeedback('Incorrect! / 错误！')

      // End the game if the player reaches the strike limit
      if (newStrikes >= MAX_STRIKES) {
        setGameOver(true)
        setFeedback('Game over! Too many strikes. / 游戏结束！失误次数过多。')
      }
      // Keep the same scrambled word after a wrong guess
    }

    // Clear the input box after submission
    setGuess('')
  }

  /**
   * Skip the current word when the player still has passes left
   */
  function handlePass () {
    // Do nothing if no passes remain or the game is over
    if (passes <= 0 || gameOver) {
      return
    }

    // Use one pass
    setPasses(passes - 1)
    setFeedback('Word passed. / 已跳过该单词。')

    // Remove the passed word from the list
    const updatedWordList = wordList.filter(function (word, index) {
      return index !== currentIndex
    })
    setWordList(updatedWordList)

    // Show the next scrambled word (or end the game)
    goToNextWord(updatedWordList, currentIndex)

    // Clear any leftover text in the input
    setGuess('')
  }

  /**
   * Restart the game without refreshing the browser page
   */
  function handleRestart () {
    // Build a brand new shuffled game
    const newGame = createNewGame()

    setWordList(newGame.wordList)
    setCurrentIndex(newGame.currentIndex)
    setScrambledWord(newGame.scrambledWord)
    setGuess('')
    setPoints(newGame.points)
    setStrikes(newGame.strikes)
    setPasses(newGame.passes)
    setFeedback('')
    setGameOver(newGame.gameOver)
  }

  // Game Over screen
  if (gameOver) {
    return (
      <div className="app">
        <h1>Scramble</h1>
        <h2>Game Over / 游戏结束</h2>
        <p>Points / 得分: {points}</p>
        <p>Strikes / 失误: {strikes}</p>
        <p>Passes left / 剩余跳过: {passes}</p>
        <p>{feedback}</p>
        <button type="button" onClick={handleRestart}>
          Play Again / 再玩一次
        </button>
      </div>
    )
  }

  // Main gameplay screen
  return (
    <div className="app">
      <h1>Scramble</h1>

      <p className="scrambled-word">{scrambledWord}</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="guess-input">
          Your guess / 你的猜测:
        </label>
        <input
          id="guess-input"
          type="text"
          value={guess}
          onChange={handleGuessChange}
          autoComplete="off"
        />
        <button type="submit">Guess / 猜测</button>
      </form>

      <button type="button" onClick={handlePass} disabled={passes <= 0}>
        Pass / 跳过 ({passes})
      </button>

      <p className="feedback">{feedback}</p>

      <div className="stats">
        <p>Points / 得分: {points}</p>
        <p>Strikes / 失误: {strikes} / {MAX_STRIKES}</p>
        <p>Passes / 跳过: {passes}</p>
        <p>Words left / 剩余单词: {wordList.length}</p>
      </div>
    </div>
  )
}

// Create a root and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
