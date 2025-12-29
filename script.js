let questions = [];
let currentQuestion = null;
let currentIndex = 0;
let mode = "order";

let currentYear = "2023";
let currentSubject = "theory";

function loadQuestions() {
  const path = `data/${currentYear}_${currentSubject}.json`;

  fetch(path)
    .then(res => res.json())
    .then(data => {
      questions = data;
      wrongList = JSON.parse(
  localStorage.getItem(getWrongListKey())
) || [];

      currentIndex = 0;
      showQuestion();
    })
    .catch(() => {
      document.getElementById("question").textContent =
        "問題データがありません";
      document.getElementById("choices").innerHTML = "";
    });
}

function getWrongListKey() {
  return `${currentYear}_${currentSubject}_wrongList`;
}


document.getElementById("yearSelect").addEventListener("change", e => {
  currentYear = e.target.value;
  loadQuestions();
});

document.getElementById("subjectSelect").addEventListener("change", e => {
  currentSubject = e.target.value;
  loadQuestions();
});


// 間違えた問題IDを保存
let wrongList = [];
let correctCount = Number(localStorage.getItem("correctCount")) || 0;
let wrongCount = Number(localStorage.getItem("wrongCount")) || 0;


// モード切替
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.addEventListener("change", e => {
    mode = e.target.value;
    currentIndex = 0;
    showQuestion();
  });
});

// 復習モード切替
document.getElementById("reviewMode").addEventListener("change", () => {
  currentIndex = 0;
  showQuestion();
});

// JSON読み込み
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion();
  });

// 出題対象の問題リストを決める
function getActiveQuestions() {
  const review = document.getElementById("reviewMode").checked;
  if (!review) return questions;

  return questions.filter(q => wrongList.includes(q.id));
}

// 問題表示
function showQuestion() {
  const activeQuestions = getActiveQuestions();

  if (activeQuestions.length === 0) {
    document.getElementById("question").textContent =
      "復習する問題がありません 🎉";
    document.getElementById("choices").innerHTML = "";
    document.getElementById("counter").textContent = "";
    return;
  }

  if (mode === "order") {
    currentQuestion = activeQuestions[currentIndex];
  } else {
    const rand = Math.floor(Math.random() * activeQuestions.length);
    currentQuestion = activeQuestions[rand];
  }

  document.getElementById("counter").textContent =
    `問題 ${currentIndex + 1} / ${activeQuestions.length}`;

  document.getElementById("question").textContent =
    currentQuestion.question;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  currentQuestion.choices.forEach((choice, i) => {
    const btn = document.createElement("button");
    btn.textContent = `(${i + 1}) ${choice}`;
    btn.onclick = () => checkAnswer(i + 1);
    choicesDiv.appendChild(btn);
  });

  document.getElementById("result").textContent = "";
  updateScore();
}

// 正誤判定
function checkAnswer(selected) {
  const result = document.getElementById("result");

  if (selected === currentQuestion.answer) {
    result.textContent = "⭕ 正解！";
    correctCount++;

    wrongList = wrongList.filter(id => id !== currentQuestion.id);
  } else {
    result.textContent =
      `❌ 不正解。正解は (${currentQuestion.answer})`;
    wrongCount++;

    if (!wrongList.includes(currentQuestion.id)) {
      wrongList.push(currentQuestion.id);
    }
  }

  // ★ 年度・科目別に保存
  localStorage.setItem(
    getWrongListKey(),
    JSON.stringify(wrongList)
  );

  updateScore();
}



// 次の問題
document.getElementById("nextBtn").addEventListener("click", () => {
  const activeQuestions = getActiveQuestions();

  if (mode === "order") {
    currentIndex++;
    if (currentIndex >= activeQuestions.length) {
      alert("最後の問題です");
      currentIndex = activeQuestions.length - 1;
    }
  }
  showQuestion();
});

loadQuestions();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker registered"));
}

