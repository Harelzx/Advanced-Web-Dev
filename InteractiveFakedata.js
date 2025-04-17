let currentSubject; // Current subject selected by the user
let currentQuestions = []; // Questions for the current quiz
let currentQuestionIndex = 0; // Index of the current question in the quiz, for now its 0 because there is only one question
let score = 0; // User's score
let timeLeft = 30; // Time left for the current question in seconds
let timer; // Timer for the question countdown

const quizzes = { // Quiz data for different subjects and difficulties
    math: {
      easy: [{ question: "1+1?", options: ["2", "3", "4"], answer: "2", explanation: "Basic addition" }],
      medium: [{ question: "5*5?", options: ["25", "30", "35"], answer: "25", explanation: "Multiplication" }],
      hard: [{ question: "Square root of 16?", options: ["4", "8", "16"], answer: "4", explanation: "Square root of 16 is 4" }]
    },
    science: {
      easy: [{ question: "What is H2O?", options: ["Water", "Oxygen", "Hydrogen"], answer: "Water", explanation: "H2O is water" }],
      medium: [{ question: "What is the boiling point of water?", options: ["100°C", "0°C", "50°C"], answer: "100°C", explanation: "Water boils at 100°C" }],
      hard: [{ question: "What is the chemical symbol for gold?", options: ["Au", "Ag", "Fe"], answer: "Au", explanation: "Gold is Au" }]
    },
    history: {
      easy: [{ question: "Who was the first president of the USA?", options: ["Washington", "Lincoln", "Jefferson"], answer: "Washington", explanation: "George Washington was the first president" }],
      medium: [{ question: "When did WWII end?", options: ["1945", "1939", "1918"], answer: "1945", explanation: "WWII ended in 1945" }],
      hard: [{ question: "Who wrote the Declaration of Independence?", options: ["Jefferson", "Washington", "Adams"], answer: "Jefferson", explanation: "Thomas Jefferson wrote it" }]
    },
    english: {
      easy: [{ question: "Synonym of happy?", options: ["Sad", "Joyful", "Angry"], answer: "Joyful", explanation: "Happy means joyful" }],
      medium: [{ question: "What is a noun?", options: ["Person, place, thing", "Action", "Description"], answer: "Person, place, thing", explanation: "Nouns name things" }],
      hard: [{ question: "What is an adverb?", options: ["Describes a verb", "Names a thing", "Connects words"], answer: "Describes a verb", explanation: "Adverbs modify verbs" }]
    }
};

function showDifficultySelection(subject) { // Show difficulty selection for the selected subject
    currentSubject = subject;
    document.getElementById('difficulty-selection').style.display = 'block'; 
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('flashcard-section').classList.add('hidden');
    document.getElementById('quiz-modal').classList.remove('hidden');
 }

function selectDifficulty(difficulty) { // Select difficulty and load questions
    currentQuestions = quizzes[currentSubject][difficulty];
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('quiz-section').classList.remove('hidden');
    loadQuestion();
}

function loadQuestion() { // Load the current question and options
    const question = currentQuestions[currentQuestionIndex];
    document.getElementById('quiz-question').textContent = question.question;
    const options = document.querySelectorAll('#quiz-form input');
    const spans = document.querySelectorAll('#quiz-form span');
    question.options.forEach((opt, index) => {
      options[index].value = opt;
      spans[index].textContent = opt;
    });
    document.getElementById('feedback').textContent = '';
    timeLeft = 30;
    document.getElementById('timer').textContent = 'Time left: 30 seconds';
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      document.getElementById('timer').textContent = 'Time left: ' + timeLeft + ' seconds';
      if (timeLeft <= 0) {
        clearInterval(timer);
        document.getElementById('feedback').textContent = 'Time\'s up!';
        document.getElementById('feedback').className = 'incorrect';
      }
    }, 1000);
}

function loadFlashcard() { // Load the current flashcard question and answer
    const question = currentQuestions[currentQuestionIndex];
    document.getElementById('flashcard-question').textContent = question.question;
    document.getElementById('flashcard-answer').textContent = question.answer;
    document.getElementById('flashcard-answer').classList.add('hidden');
}

document.getElementById('submit-btn').addEventListener('click', () => { // Submit the answer and check if it's correct
  clearInterval(timer);
  const selected = document.querySelector('#quiz-form input:checked');
  const feedback = document.getElementById('feedback');
  if (selected) {
    const question = currentQuestions[currentQuestionIndex];
    if (selected.value === question.answer) {
      feedback.textContent = 'Correct! ' + question.explanation;
      feedback.className = 'correct';
      score += 10;
    } else {
      feedback.textContent = `Incorrect. The correct answer is ${question.answer}. Explanation: ${question.explanation}`;
      feedback.className = 'incorrect';
    }
  } else {
    feedback.textContent = 'Please select an option.';
  }
});

document.getElementById('flashcard-mode-btn').addEventListener('click', () => { // Switch to flashcard mode
  document.getElementById('quiz-section').classList.add('hidden');
  document.getElementById('flashcard-section').classList.remove('hidden');
  loadFlashcard();
});

document.getElementById('show-answer-btn').addEventListener('click', () => { // Show the answer on the flashcard
  document.getElementById('flashcard-answer').classList.toggle('hidden');
});

document.getElementById('next-flashcard-btn').addEventListener('click', () => { // Load the next flashcard
  currentQuestionIndex = (currentQuestionIndex + 1) % currentQuestions.length;
  loadFlashcard();
});

document.getElementById('close-btn').addEventListener('click', () => { // Close the quiz modal
  document.getElementById('quiz-modal').classList.add('hidden');
});

document.getElementById('easy-btn').addEventListener('click', () => selectDifficulty('easy')); // Easy difficulty button
document.getElementById('medium-btn').addEventListener('click', () => selectDifficulty('medium')); // Medium difficulty button
document.getElementById('hard-btn').addEventListener('click', () => selectDifficulty('hard')); // Hard difficulty button
document.querySelectorAll('.study-btn').forEach(btn => { // Add event listeners to study buttons
  btn.addEventListener('click', () => {
    const subject = btn.parentElement.dataset.subject;
    showDifficultySelection(subject);
  });
});