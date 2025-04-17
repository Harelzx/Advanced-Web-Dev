const learningPaths = {
  grade1: {
    math: [
      { title: "Counting to 10", description: "Learn to count from 1 to 10." },
      { title: "Basic Addition", description: "Introduction to adding numbers." }
    ],
    science: [
      { title: "Plants and Animals", description: "Discover the differences between plants and animals." }
    ]
  },
  grade2: {
    math: [
      { title: "Multiplication Tables", description: "Learn multiplication basics." },
      { title: "Fractions Introduction", description: "Understand simple fractions." }
    ],
    science: [
      { title: "Solar System", description: "Explore the planets in our solar system." }
    ]
  },
  grade3: {
    math: [
      { title: "Division Basics", description: "Learn how to divide numbers." }
    ],
    science: [
      { title: "Human Body", description: "Introduction to human anatomy." }
    ]
  }
};

let score = 0;
let completedModules = 0;
let totalModules = 0;

document.getElementById('generate-btn').addEventListener('click', () => {
  const grade = document.getElementById('grade-select').value;
  const subjects = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  if (!grade || subjects.length === 0) {
    alert('Please select a grade and at least one subject.');
    return;
  }
  const modules = [];
  subjects.forEach(subject => {
    if (learningPaths[grade] && learningPaths[grade][subject]) {
      modules.push(...learningPaths[grade][subject]);
    }
  });
  totalModules = modules.length;
  const learningPathDiv = document.getElementById('learning-path');
  learningPathDiv.innerHTML = '';
  modules.forEach((module, index) => {
    const moduleCard = document.createElement('div');
    moduleCard.className = 'module-card border border-gray-300 rounded-md p-4 m-2 bg-white';
    moduleCard.innerHTML = `
      <h3 class="m-0">${module.title}</h3>
      <p class="my-1">${module.description}</p>
      <span class="status font-bold">Not Started</span>
      <button class="start-btn bg-green-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-green-600">Start Lesson</button>
      <input type="checkbox" class="complete-checkbox" id="module-${index}">
      <label for="module-${index}">Completed</label>
    `;
    learningPathDiv.appendChild(moduleCard);
  });
  const progressSummary = document.getElementById('progress-summary');
  progressSummary.classList.remove('hidden');
  progressSummary.textContent = 'Progress: 0 / ' + totalModules + ' lessons completed';
});

document.getElementById('learning-path').addEventListener('change', (e) => {
  if (e.target.classList.contains('complete-checkbox')) {
    const moduleCard = e.target.closest('.module-card');
    const statusSpan = moduleCard.querySelector('.status');
    if (e.target.checked) {
      statusSpan.textContent = 'Completed';
      score += 10;
      completedModules++;
    } else {
      statusSpan.textContent = 'Not Started';
      score -= 10;
      completedModules--;
    }
    const progress = (completedModules / totalModules) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('your-score').textContent = score;
    document.getElementById('progress-summary').textContent = 'Progress: ' + completedModules + ' / ' + totalModules + ' lessons completed';
  }
});

document.getElementById('pomodoro-btn').addEventListener('click', () => {
  alert('Pomodoro started! Focus for 25 minutes.');
  setTimeout(() => alert('Time for a 5-minute break!'), 25 * 60 * 1000);
});

document.getElementById('chat-btn').addEventListener('click', () => {
  alert('Mock chat with students and teachers.');
});