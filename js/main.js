let problems = [];
let currentProblemIndex = 0;
let score = 0;
let incorrectAnswers = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('problems.json')
    .then(response => response.json())
    .then(data => {
      problems = data;
      showProblem();
    });

  document.getElementById('next-btn').addEventListener('click', validateAnswer);
  document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
});

function showProblem() {
  const problem = problems[currentProblemIndex];
  document.getElementById('question').textContent = problem.question;

  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  problem.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('btn', 'btn-outline-primary', 'option-btn');
    button.onclick = () => selectOption(button, problem.answer);
    optionsContainer.appendChild(button);
  });

  document.getElementById('result-msg').textContent = '';
}

function selectOption(button, correctAnswer) {
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
  const resultMsg = document.getElementById('result-msg');

  if (button.textContent === correctAnswer) {
    button.classList.add('btn-success');
    resultMsg.textContent = "¡Correcto!";
    resultMsg.classList.remove('text-danger');
    resultMsg.classList.add('text-success');
    score += 5;
  } else {
    button.classList.add('btn-danger');
    resultMsg.textContent = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
    resultMsg.classList.remove('text-success');
    resultMsg.classList.add('text-danger');
    incorrectAnswers.push(problems[currentProblemIndex]);
  }
}

function validateAnswer() {
  const options = document.querySelectorAll('.option-btn');
  const resultMsg = document.getElementById('result-msg');

  if (![...options].some(btn => btn.disabled)) {
    resultMsg.textContent = "Por favor selecciona una respuesta antes de continuar.";
    resultMsg.style.color = "red";
    return;
  }

  if (currentProblemIndex < problems.length - 1) {
    currentProblemIndex++;
    showProblem();
  } else {
    showResults();
  }
}

function showResults() {
  const quizResult = {
    score: score,
    incorrectAnswers: incorrectAnswers.map(item => ({
      question: item.question,
      correctAnswer: item.answer
    })),
    date: new Date().toLocaleString()
  };

  let results = JSON.parse(localStorage.getItem('quizResults')) || [];
  results.push(quizResult);
  localStorage.setItem('quizResults', JSON.stringify(results));

  const resultContainer = document.getElementById('result');
  resultContainer.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-body">
        <h2 class="text-center">Resumen</h2>
        <p class="text-center">Puntaje final: <strong>${score}</strong></p>
        <h3>Respuestas incorrectas:</h3>
        ${incorrectAnswers.map(item => `
          <div>
            <p><strong>Pregunta:</strong> ${item.question}</p>
            <p><strong>Respuesta correcta:</strong> ${item.answer}</p>
            <hr>
          </div>
        `).join('')}
        <div class="text-center">
          <button id="restart-btn" class="btn btn-success">Reiniciar Quiz</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('restart-btn').addEventListener('click', restartQuiz);
}

function restartQuiz() {
  currentProblemIndex = 0;
  score = 0;
  incorrectAnswers = [];
  document.getElementById('result').innerHTML = '';
  showProblem();
}

function clearHistory() {
  localStorage.removeItem('quizResults');
  alert('Historial borrado.');
  restartQuiz();
}
