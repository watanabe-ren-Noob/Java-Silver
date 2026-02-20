let currentQuestionIndex = 0;
let selectedOptions = [];
let activeQuizData = [];

function prepareQuizData() {
    const range = localStorage.getItem('examRange');
    const targetIdx = localStorage.getItem('targetIndex');

    if (targetIdx !== null) {
        activeQuizData = [quizData[parseInt(targetIdx)]];
        localStorage.removeItem('targetIndex');
    } else {
        let filtered = (range === 'ch1') ? quizData.filter(q => q.id <= 9) :
                       (range === 'ch2') ? quizData.filter(q => q.id >= 10) : [...quizData];

        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        activeQuizData = filtered;
    }
}

prepareQuizData();

const questionText = document.getElementById('question-text');
const codeContainer = document.getElementById('code-container');
const optionsContainer = document.getElementById('options');
const submitBtn = document.getElementById('submit-btn');
const feedbackArea = document.getElementById('feedback');
const resultMessage = document.getElementById('result-message');
const explanationText = document.getElementById('explanation-text');
const nextBtn = document.getElementById('next-btn');
const progressText = document.getElementById('progress');

function loadQuestion() {
    const q = activeQuizData[currentQuestionIndex];
    selectedOptions = [];
    
    submitBtn.classList.add('hidden');
    feedbackArea.classList.add('hidden');
    progressText.innerText = `Question ${currentQuestionIndex + 1}/${activeQuizData.length}`;
    
    questionText.innerText = q.question;
    
    // コード表示のスマホ最適化
    if (q.code) {
        codeContainer.innerHTML = `
            <pre class="bg-black p-4 overflow-x-auto text-green-400 font-mono text-xs sm:text-sm leading-normal no-scrollbar"><code>${q.code}</code></pre>
        `;
    } else {
        codeContainer.innerHTML = '';
    }

    optionsContainer.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        // p-5 (タップ範囲の拡大) と active 時の色変化
        btn.className = "text-left p-5 rounded-xl border-2 border-slate-700 active:bg-blue-900/40 transition-all bg-slate-800/50 text-sm sm:text-base";
        btn.onclick = () => {
            if (feedbackArea.classList.contains('hidden')) {
                toggleOption(btn, i, q.requiredCount || 1);
            }
        };
        optionsContainer.appendChild(btn);
    });
}

function toggleOption(btn, index, max) {
    if (selectedOptions.includes(index)) {
        selectedOptions = selectedOptions.filter(i => i !== index);
        btn.classList.remove('border-blue-500', 'bg-blue-900/30', 'ring-2', 'ring-blue-500/20');
    } else {
        if (selectedOptions.length < max) {
            selectedOptions.push(index);
            btn.classList.add('border-blue-500', 'bg-blue-900/30', 'ring-2', 'ring-blue-500/20');
        }
    }
    submitBtn.classList.toggle('hidden', selectedOptions.length !== max);
}

submitBtn.onclick = () => {
    const q = activeQuizData[currentQuestionIndex];
    submitBtn.classList.add('hidden');
    const isCorrect = JSON.stringify([...selectedOptions].sort()) === JSON.stringify([...q.answer].sort());
    
    resultMessage.innerText = isCorrect ? "⭕ おけ～い" : "❌ ざんねぇ～ん";
    resultMessage.className = isCorrect ? "text-green-400 font-black text-2xl mb-2" : "text-red-400 font-black text-2xl mb-2";
    
    explanationText.innerText = q.explanation;
    feedbackArea.classList.remove('hidden');
    // 自動スクロール（スマホで解説が見えるように）
    feedbackArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

nextBtn.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuizData.length) {
        loadQuestion();
        window.scrollTo(0, 0);
    } else {
        alert("全問終了しました！");
        location.href = 'index.html';
    }
};

window.onload = loadQuestion;
