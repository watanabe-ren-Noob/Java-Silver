/**
 * Java Silver 対策アプリ - Main Logic
 */

let currentQuestionIndex = 0;
let selectedOptions = [];
let activeQuizData = []; // 今回出題される問題のリスト

/**
 * 出題データの準備（フィルタリングとシャッフル）
 */
function prepareQuizData() {
    const range = localStorage.getItem('examRange');
    const targetIdx = localStorage.getItem('targetIndex');

    if (targetIdx !== null) {
        // --- 【個別問題モード】 ---
        activeQuizData = [quizData[parseInt(targetIdx)]];
        // 読み込んだらフラグを消す
        localStorage.removeItem('targetIndex');
    } else {
        // --- 【試験モード（ランダム）】 ---
        let filtered = [];
        if (range === 'ch1') {
            filtered = quizData.filter(q => q.id <= 9);
        } else if (range === 'ch2') {
            filtered = quizData.filter(q => q.id >= 10);
        } else {
            // 指定がない、または 'all' の場合は全範囲
            filtered = [...quizData];
        }

        // シャッフル（Fisher-Yates Shuffle）
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        activeQuizData = filtered;
    }
}

// データの準備を実行
prepareQuizData();

// DOM要素の取得
const questionText = document.getElementById('question-text');
const codeContainer = document.getElementById('code-container');
const optionsContainer = document.getElementById('options');
const submitBtn = document.getElementById('submit-btn');
const feedbackArea = document.getElementById('feedback');
const resultMessage = document.getElementById('result-message');
const explanationText = document.getElementById('explanation-text');
const nextBtn = document.getElementById('next-btn');
const progressText = document.getElementById('progress');

/**
 * 問題を表示する
 */
function loadQuestion() {
    if (activeQuizData.length === 0) {
        alert("問題データが見つかりません。TOPに戻ります。");
        location.href = 'index.html';
        return;
    }

    const q = activeQuizData[currentQuestionIndex];
    selectedOptions = [];
    
    // UIのリセット
    submitBtn.classList.add('hidden');
    feedbackArea.classList.add('hidden');
    progressText.innerText = `Question ${currentQuestionIndex + 1}/${activeQuizData.length}`;
    
    // 問題文とコードの表示
    questionText.innerText = q.question;
    if (q.code) {
        // 改行を正しく保持するために <pre><code> を使用
        codeContainer.innerHTML = `<pre class="bg-black p-4 rounded-xl overflow-x-auto text-green-400 font-mono text-sm leading-relaxed"><code>${q.code}</code></pre>`;
    } else {
        codeContainer.innerHTML = '';
    }

    // 選択肢の生成
    optionsContainer.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.className = "text-left p-4 rounded-xl border-2 border-slate-700 hover:border-blue-500 transition-all duration-200 bg-slate-800/50";
        btn.onclick = () => {
            // 回答後は選択不可にする
            if (feedbackArea.classList.contains('hidden')) {
                toggleOption(btn, i, q.requiredCount || 1);
            }
        };
        optionsContainer.appendChild(btn);
    });
}

/**
 * 選択肢のクリック制御
 */
function toggleOption(btn, index, max) {
    if (selectedOptions.includes(index)) {
        // すでに選択済みなら解除
        selectedOptions = selectedOptions.filter(i => i !== index);
        btn.classList.remove('bg-blue-900/50', 'border-blue-500', 'ring-2', 'ring-blue-500/20');
    } else {
        // 必要数（max）に達していなければ追加
        if (selectedOptions.length < max) {
            selectedOptions.push(index);
            btn.classList.add('bg-blue-900/50', 'border-blue-500', 'ring-2', 'ring-blue-500/20');
        }
    }
    
    // 必要数選んだら回答ボタンを表示
    if (selectedOptions.length === max) {
        submitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.add('hidden');
    }
}

/**
 * 回答をチェック
 */
submitBtn.onclick = () => {
    const q = activeQuizData[currentQuestionIndex];
    submitBtn.classList.add('hidden');
    
    // 回答の正誤判定（ソートして比較）
    const isCorrect = JSON.stringify([...selectedOptions].sort()) === JSON.stringify([...q.answer].sort());
    
    resultMessage.innerText = isCorrect ? "⭕ 正解！" : "❌ 不正解...";
    resultMessage.className = isCorrect ? "text-green-400 font-bold text-2xl mb-2" : "text-red-400 font-bold text-2xl mb-2";
    
    explanationText.innerText = q.explanation;
    feedbackArea.classList.remove('hidden');
};

/**
 * 次の問題、または終了処理
 */
nextBtn.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuizData.length) {
        loadQuestion();
    } else {
        // リザルト表示などの代わりにアラート
        alert("すべての問題が終了しました！TOPに戻ります。");
        location.href = 'index.html';
    }
};

// ページ読み込み時に開始
window.onload = loadQuestion;