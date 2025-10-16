// history.js (コンフリクト解消版)

// ========================================
// 1. HTML要素を取得する
// ========================================
const memoList = document.getElementById('memoList');
const body = document.querySelector('body');
const deleteAllButton = document.getElementById('deleteAllButton');

// ========================================
// 2. メモを保存する配列
// ========================================
let memos = [];

// ========================================
// 3. ページを開いたときに実行する
// ========================================
loadMemos();
showMemos();

// ========================================
// 4. 正解時のポップアップ表示関数
// ========================================
function showCorrectPopup() {
  const popup = document.createElement('div');
  popup.textContent = '🎉大正解！🎉';
  popup.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background-color: rgba(40, 167, 69, 0.95); color: white;
    padding: 30px 60px; border-radius: 10px; font-size: 3em;
    font-weight: bold; z-index: 1000; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    animation: fadeInOut 1.8s forwards;
  `;
  body.appendChild(popup);
  setTimeout(() => { popup.remove(); }, 1800);

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

  memos.forEach(function(memo) {
    let isSolved = memo.isSolved || false;
    const card = document.createElement('div');
    card.className = 'memo-card';

    const titleElement = document.createElement('h3');
    titleElement.textContent = isSolved ? memo.originalTitle || '無題' : memo.title;

    const contentElement = document.createElement('p');
    contentElement.textContent = isSolved ? memo.originalContent : memo.content;

    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = memo.date;

    let hintImage = null;
    if (memo.image && !isSolved) {
      hintImage = document.createElement('img');
      hintImage.src = memo.image;
      hintImage.className = 'hint-image';
      card.appendChild(hintImage);
    }

    const footer = document.createElement('div');
    footer.className = 'card-footer';
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() { deleteMemo(memo.id); });

    if (memo.ruleName !== '変換なし' && !isSolved) {
      const quizArea = document.createElement('div');
      quizArea.className = 'quiz-area';
      const answerInput = document.createElement('input');
      answerInput.type = 'text';
      answerInput.placeholder = '適用されたルールは？';
      const checkButton = document.createElement('button');
      checkButton.textContent = '答え合わせ';

      checkButton.addEventListener('click', function() {
        const userAnswer = answerInput.value;
        const hiraganaRegex = /^[ぁ-んー]+$/;
        if (!hiraganaRegex.test(userAnswer) && userAnswer !== "") {
          alert('答えはひらがなで書いてね');
          return;
        }

        if (userAnswer === memo.ruleName) {
          showCorrectPopup();
          titleElement.textContent = memo.originalTitle || '無題';
          contentElement.textContent = memo.originalContent;
          card.removeChild(footer);
          if (hintImage) { card.removeChild(hintImage); }

          const index = memos.findIndex(m => m.id === memo.id);
          if (index !== -1) {
            memos[index].isSolved = true;
            saveMemos();
          }
        } else {
          alert('残念！正解は「' + memo.ruleName + '」でした。');
        }
      });
      quizArea.appendChild(answerInput);
      quizArea.appendChild(checkButton);
      footer.appendChild(quizArea);
    }

    footer.appendChild(deleteButton);
    card.appendChild(titleElement);
    card.appendChild(contentElement);
    card.appendChild(dateElement);
    card.appendChild(footer);

    memoList.appendChild(card);
  });
}

// ========================================
// 6. メモを削除する関数
// ========================================
function deleteMemo(id) {
  if (!confirm('このメモを削除しますか？')) { return; }
  memos = memos.filter(function(memo) { return memo.id !== id; });
  saveMemos();
  showMemos();
}

// ========================================
// 7. メモをローカルストレージに保存する関数
// ========================================
function saveMemos() {
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ========================================
// 8. メモをローカルストレージから読み込む関数
// ========================================
function loadMemos() {
  const saved = localStorage.getItem('memos');
  if (saved) { memos = JSON.parse(saved); }
}

// ========================================
// 9. 全てのメモを削除する機能
// ========================================
deleteAllButton.addEventListener('click', function() {
  if (confirm('本当にすべてのメモを削除しますか？この操作は元に戻せません。')) {
    memos = [];
    saveMemos();
    showMemos();
  }
});