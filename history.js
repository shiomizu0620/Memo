// history.js

// ========================================
// 1. HTML要素を取得する
// ========================================
const memoList = document.getElementById('memoList');
// ★ 履歴ページ全体（body）を取得
const body = document.querySelector('body'); 

// ========================================
// 2. メモを保存する配列
// ========================================
let memos = [];

// ========================================
// 3. ページを開いたときに実行する
// ========================================
loadMemos();
showMemos(); // ここでは全てのメモを表示する

// ========================================
// 4. ★ 正解時のポップアップ表示関数
// ========================================
function showCorrectPopup() {
    // ポップアップコンテナを作成
    const popup = document.createElement('div');
    popup.textContent = '🎉大正解！🎉';
    popup.id = 'correct-popup';
    
    // スタイルを適用（CSSは別途定義が必要です）
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(40, 167, 69, 0.95); /* 緑色 */
        color: white;
        padding: 30px 60px;
        border-radius: 10px;
        font-size: 3em;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        animation: fadeInOut 1.8s forwards; /* 2.5秒で表示・フェードアウト */
    `;

    // 画面に追加
    body.appendChild(popup);

    // 2.5秒後に削除
    setTimeout(() => {
        popup.remove();
    }, 1800);

    // ★ オプション：簡単なCSSアニメーション（CSSファイルに入れる代わりにインラインで記述）
    if (!document.getElementById('popup-style')) {
        const style = document.createElement('style');
        style.id = 'popup-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// 5. メモを画面に表示する関数
// ========================================
function showMemos() {
  memoList.innerHTML = '';

  if (memos.length === 0) {
    memoList.innerHTML = '<p class="empty">メモがまだありません</p>';
    return;
  }

  // 全てのメモを1つずつ表示（sliceは使わない）
  memos.forEach(function(memo) {
    // ★ 正解状態によって初期表示を切り替えるための変数
    let isSolved = memo.isSolved || false; 

    const card = document.createElement('div');
    card.className = 'memo-card';

    const titleElement = document.createElement('h3');
    // ★ 正解済みなら変換前のタイトルを表示
    titleElement.textContent = isSolved ? memo.originalTitle || '無題' : memo.title;

    const contentElement = document.createElement('p');
    // ★ 正解済みなら変換前の内容を表示
    contentElement.textContent = isSolved ? memo.originalContent : memo.content;

    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = memo.date;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
      deleteMemo(memo.id);
    });

    // ★ヒント画像の変数をここで宣言しておく
    let hintImage = null; 
    // ★ 正解済みでなければ画像を表示
    if (memo.image && !isSolved) { 
      hintImage = document.createElement('img'); // ★ここで代入
      hintImage.src = memo.image;
      hintImage.className = 'hint-image';
      card.appendChild(hintImage);
    }

    // ★「変換なし」の場合と、既に正解済みの場合はクイズエリアを作らない
    if (memo.ruleName !== '変換なし' && !isSolved) {
      const quizArea = document.createElement('div');
      quizArea.className = 'quiz-area';
      const answerInput = document.createElement('input');
      answerInput.type = 'text';
      answerInput.placeholder = '適用されたルールは？';
      const checkButton = document.createElement('button');
      checkButton.textContent = '答え合わせ';

      checkButton.addEventListener('click', function() {
        if (answerInput.value === memo.ruleName) {
          // ★★★ 正解したときの処理 ★★★
          
          // 0. ★ ポップアップを表示
          showCorrectPopup();

          // 1. 元の文章に戻す
          titleElement.textContent = memo.originalTitle || '無題';
          contentElement.textContent = memo.originalContent;
          
          // 2. クイズエリアとヒント画像を消す
          card.removeChild(quizArea);
          if (hintImage) { // hintImageが存在すれば消す
            card.removeChild(hintImage);
          }
          
          // 3. 正解状態をメモに保存し、ローカルストレージを更新
          const index = memos.findIndex(m => m.id === memo.id);
          if (index !== -1) {
            memos[index].isSolved = true;
            saveMemos(); // 状態を永続化する
          }

        } else {
          // ★ 不正解だったときの処理
          alert('残念！正解は「' + memo.ruleName + '」でした。');
        }
      });

      quizArea.appendChild(answerInput);
      quizArea.appendChild(checkButton);
      card.appendChild(quizArea); // カードにクイズエリアを追加
    }

    card.appendChild(titleElement);
    card.appendChild(contentElement);
    card.appendChild(dateElement);
    card.appendChild(deleteButton);

    memoList.appendChild(card);
  });
}

// ========================================
// 6. メモを削除する関数（script.jsからコピー）
// ========================================
function deleteMemo(id) {
  if (!confirm('このメモを削除しますか？')) {
    return;
  }
  memos = memos.filter(function(memo) {
    return memo.id !== id;
  });
  saveMemos();
  showMemos();
}

// ========================================
// 7. メモをローカルストレージに保存する関数（script.jsからコピー）
// ========================================
function saveMemos() {
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ========================================
// 8. メモをローカルストレージから読み込む関数（script.jsからコピー）
// ========================================
function loadMemos() {
  const saved = localStorage.getItem('memos');
  if (saved) {
    memos = JSON.parse(saved);
  }
}
// ========================================
// 9. 全てのメモを削除する機能
// ========================================
const deleteAllButton = document.getElementById('deleteAllButton');

deleteAllButton.addEventListener('click', function() {
  // ユーザーに最終確認
  if (confirm('本当にすべてのメモを削除しますか？この操作は元に戻せません。')) {
    // メモの配列を空にする
    memos = [];

    // ローカルストレージを更新（空の配列を保存）
    saveMemos();

    // 画面を更新
    showMemos();
  }
});