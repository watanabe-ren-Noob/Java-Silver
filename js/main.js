/**
 * Java Silver 学習ロジック（日本語・ステップアップ版）
 */

let currentQuestionIndex = 0;
let selectedOptions = [];
let activeQuizData = [];
let originalCode = "";

// 起動準備
function prepareQuizData() {
    const range = localStorage.getItem('examRange');
    const targetIdx = localStorage.getItem('targetIndex');

    if (targetIdx !== null) {
        activeQuizData = [quizData[parseInt(targetIdx)]];
        localStorage.removeItem('targetIndex');
    } else {
        let filtered = (range === 'ch1') ? quizData.filter(q => q.id <= 9) :
                       (range === 'ch2') ? quizData.filter(q => q.id >= 10) : [...quizData];
        activeQuizData = filtered.sort(() => Math.random() - 0.5);
    }
}

// 要素取得
const elements = {
    progress: document.getElementById('progress'),
    question: document.getElementById('question-text'),
    options: document.getElementById('options'),
    submit: document.getElementById('submit-btn'),
    feedback: document.getElementById('feedback'),
    result: document.getElementById('result-message'),
    explanation: document.getElementById('explanation-text'),
    correctArea: document.getElementById('correct-answer-area'),
    correctOptions: document.getElementById('correct-options'),
    nextBtn: document.getElementById('next-btn'),
    retryBtn: document.getElementById('retry-btn'),
    displaySection: document.getElementById('display-section'),
    codeDisplay: document.getElementById('code-display'),
    codeInput: document.getElementById('code-input'),
    console: document.getElementById('console-output')
};

function loadQuestion() {
    const q = activeQuizData[currentQuestionIndex];
    selectedOptions = [];
    
    // UI初期化
    elements.submit.classList.add('hidden');
    elements.feedback.classList.add('hidden');
    elements.correctArea.classList.add('hidden');
    elements.retryBtn.classList.add('hidden');
    elements.nextBtn.classList.remove('hidden');
    elements.console.innerText = "> 実行ボタンを押すとここに結果が出ます";
    elements.console.className = "mt-2 p-3 bg-black rounded-lg border border-slate-800 text-xs font-mono text-slate-500 min-h-[40px] whitespace-pre-wrap";
    
    elements.progress.innerText = `問題 ${currentQuestionIndex + 1} / ${activeQuizData.length}`;
    elements.question.innerText = q.question;

    if (q.code) {
        elements.displaySection.classList.remove('hidden');
        originalCode = q.code;
        elements.codeDisplay.innerHTML = `<pre><code>${originalCode}</code></pre>`;
        elements.codeInput.value = ""; 
        autoResize(elements.codeInput);
    } else {
        elements.displaySection.classList.add('hidden');
        elements.codeInput.value = "";
    }

    renderOptions();
}

function renderOptions() {
    const q = activeQuizData[currentQuestionIndex];
    elements.options.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = "text-left p-4 rounded-xl border border-slate-800 transition-all bg-slate-900/50 text-sm hover:border-slate-600";
        btn.onclick = () => toggleOption(btn, i, q.requiredCount || 1);
        elements.options.appendChild(btn);
    });
}

function copyToEditor() {
    elements.codeInput.value = originalCode;
    autoResize(elements.codeInput);
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight + 10) + 'px';
}

function toggleOption(btn, index, max) {
    if (!elements.feedback.classList.contains('hidden')) return;

    if (selectedOptions.includes(index)) {
        selectedOptions = selectedOptions.filter(i => i !== index);
        btn.classList.remove('border-blue-500', 'bg-blue-900/30', 'ring-1', 'ring-blue-500');
    } else if (selectedOptions.length < max) {
        selectedOptions.push(index);
        btn.classList.add('border-blue-500', 'bg-blue-900/30', 'ring-1', 'ring-blue-500');
    }
    elements.submit.classList.toggle('hidden', selectedOptions.length !== max);
}

// 実行エンジン（簡易版）
function runCode() {
    let rawCode = elements.codeInput.value;
    if(!rawCode.trim()) return;
    elements.console.innerText = "実行中...\n";
    
    try {
        let jsCode = rawCode
            .replace(/public\s+class\s+\w+\s*\{/g, "")
            .replace(/public\s+static\s+void\s+main\s*\(.*?\)\s*\{/g, "")
            .replace(/System\.out\.println/g, "output.push")
            .replace(/int|String|var|boolean|double|float/g, "let")
            .replace(/\s*\}\s*$/g, "");

        let output = [];
        const func = new Function("output", jsCode);
        func(output);
        elements.console.innerText = output.length > 0 ? output.join("\n") : "（出力なし）";
        elements.console.className = "mt-2 p-3 bg-black rounded-lg border border-emerald-900/50 text-xs font-mono text-emerald-400 min-h-[40px] whitespace-pre-wrap";
    } catch (e) {
        elements.console.innerText = "エラー: " + e.message;
        elements.console.className = "mt-2 p-3 bg-black rounded-lg border border-red-900/50 text-xs font-mono text-red-400 min-h-[40px] whitespace-pre-wrap";
    }
}

// 正解を確認・表示する処理
elements.submit.onclick = () => {
    const q = activeQuizData[currentQuestionIndex];
    elements.submit.classList.add('hidden');
    
    const isCorrect = JSON.stringify([...selectedOptions].sort()) === JSON.stringify([...q.answer].sort());
    
    elements.feedback.classList.remove('hidden');
    elements.explanation.innerText = q.explanation;

    if (isCorrect) {
        elements.result.innerText = "⭕ 正解！";
        elements.result.className = "text-emerald-400 font-black text-2xl mb-2";
        showCorrectAnswer(q);
        elements.nextBtn.innerText = "次の問題へ";
    } else {
        elements.result.innerText = "❌ 不正解";
        elements.result.className = "text-amber-500 font-black text-2xl mb-2";
        elements.explanation.innerText += "\n\n上の【練習場】でコードを動かして、もう一度考えてみましょう。";
        elements.retryBtn.classList.remove('hidden');
        elements.nextBtn.innerText = "諦めて答えを見る";
    }
    
    elements.feedback.scrollIntoView({ behavior: 'smooth' });
};

// 正解そのものを表示する
function showCorrectAnswer(q) {
    elements.correctArea.classList.remove('hidden');
    const correctTexts = q.answer.map(idx => q.options[idx]);
    elements.correctOptions.innerText = correctTexts.join(' ／ ');
    elements.retryBtn.classList.add('hidden');
}

// 解き直し
function retryQuestion() {
    elements.feedback.classList.add('hidden');
    selectedOptions = [];
    renderOptions();
    window.scrollTo(0, 0);
}

// 諦めて次へ（答えを表示してから次へ）
elements.nextBtn.onclick = () => {
    const q = activeQuizData[currentQuestionIndex];
    // まだ正解を表示していない状態でクリックされたら、まず正解を見せる
    if (elements.correctArea.classList.contains('hidden') && elements.result.innerText.includes("不正解")) {
        showCorrectAnswer(q);
        elements.nextBtn.innerText = "理解したので次へ";
        return;
    }

    if (currentQuestionIndex < activeQuizData.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        window.scrollTo(0, 0);
    } else {
        location.href = 'index.html';
    }
};

prepareQuizData();
window.onload = loadQuestion;
