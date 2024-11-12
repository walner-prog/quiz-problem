let problems = [];
let currentProblemIndex = 0;
let score = 0;
let incorrectAnswers = [];

document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/problems')
    .then(response => response.json())
    .then(data => {
      problems = data;
      showProblem();
    });

  document.getElementById('next-btn').addEventListener('click', validateAnswer);
});

function showProblem() {
  const problem = problems[currentProblemIndex];
  document.getElementById('question').textContent = problem.question;

  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  problem.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('option-btn');
    button.onclick = () => selectOption(button, problem.answer);
    optionsContainer.appendChild(button);
  });

  document.getElementById('result-msg').textContent = ''; // Limpia el mensaje anterior
}

function selectOption(button, correctAnswer) {
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
  const resultMsg = document.getElementById('result-msg');

  if (button.textContent === correctAnswer) {
    button.classList.add('correct');
    resultMsg.textContent = "¡Correcto!";
    score += 5;
  } else {
    button.classList.add('incorrect');
    resultMsg.textContent = `Incorrecto. La respuesta correcta es: ${correctAnswer}`;
    incorrectAnswers.push(problems[currentProblemIndex]);
  }
}

function validateAnswer() {
    const options = document.querySelectorAll('.option-btn');
    const resultMsg = document.getElementById('result-msg');
  
    // Verificar si alguna opción fue seleccionada
    if (![...options].some(btn => btn.disabled)) {
      resultMsg.textContent = "Por favor selecciona una respuesta antes de continuar.";
      resultMsg.style.color = "red"; // Resaltar el mensaje
      return;
    }
  
    // Avanzar si se seleccionó una opción
    if (currentProblemIndex < problems.length - 1) {
      currentProblemIndex++;
      showProblem();
    } else {
      showResults();
    }
  }
  
  function showResults() {
    // Guarda los resultados en localStorage
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
  
    // Mostrar resultados en pantalla
    const resultContainer = document.getElementById('result');
    resultContainer.innerHTML = `
      <h2>Resumen</h2>
      <p>Puntaje final: ${score}</p>
      <h3>Respuestas incorrectas:</h3>
      <ul>
        ${incorrectAnswers.map(item => `
          <li>
            <strong>Pregunta:</strong> ${item.question} <br>
            <strong>Respuesta correcta:</strong> ${item.answer}
            <hr>
          </li>`).join('')}
      </ul>
      <button id="restart-btn">Reiniciar Quiz</button>
      <button id="view-history-btn">Ver Historial</button>
    `;
  
    document.getElementById('restart-btn').addEventListener('click', restartQuiz);
    document.getElementById('view-history-btn').addEventListener('click', showHistory);
  }
  
  function showHistory() {
    const results = JSON.parse(localStorage.getItem('quizResults')) || [];
  
    const historyContainer = document.getElementById('result');
    historyContainer.innerHTML = `
      <h2>Historial de Resultados</h2>
      ${results.map((result, index) => `
        <div>
          <h3>Intento ${index + 1} - ${result.date}</h3>
          <p>Puntaje: ${result.score}</p>
          <h4>Respuestas incorrectas:</h4>
          <ul>
            ${result.incorrectAnswers.map(item => `
              <li>
                <strong>Pregunta:</strong> ${item.question} <br>
                <strong>Respuesta correcta:</strong> ${item.correctAnswer}
                <hr>
              </li>`).join('')}
          </ul>
        </div>
      `).join('')}
      <button id="restart-btn">Reiniciar Quiz</button>
    `;
  
    document.getElementById('restart-btn').addEventListener('click', restartQuiz);
  }
  
  document.getElementById('clear-history-btn').addEventListener('click', clearHistory);

  function clearHistory() {
    localStorage.removeItem('quizResults');
    alert('Historial borrado.');
    restartQuiz();
  }
    

function restartQuiz() {
  currentProblemIndex = 0;
  score = 0;
  incorrectAnswers = [];
  document.getElementById('result').innerHTML = '';
  showProblem();
}
