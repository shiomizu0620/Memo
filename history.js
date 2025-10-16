// history.js 

// ========================================
// 1. HTML要素を取得する
// ========================================
const memoList = document.getElementById('memoList');
// ★ body要素を取得（ポップアップ表示に必要）
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
    popup.textContent = '大正解！';
    popup.id = 'correct-popup';
    
    // スタイルを適用（正解: 緑色）
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(40, 167, 69, 0.95);
        color: white;
        padding: 30px 60px;
        border-radius: 10px;
        font-size: 3em;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        animation: fadeInOut 2.5s forwards; 
    `;

    // 画面に追加
    body.appendChild(popup);

    // 2.5秒後に削除
    setTimeout(() => {
        popup.remove();
    }, 2500);

    // ★ オプション：簡単なCSSアニメーション
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
// 4.1. ★ 不正解時のポップアップ表示関数
// ========================================
function showIncorrectPopup(message) {
    // ポップアップコンテナを作成
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.id = 'incorrect-popup';
    
    // スタイルを適用（不正解: 赤色）
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(220, 53, 69, 0.95); /* 赤色 */
        color: white;
        padding: 30px 60px;
        border-radius: 10px;
        font-size: 3em;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        animation: fadeInOut 2s forwards; 
    `;

    // 画面に追加
    body.appendChild(popup);

    // 2秒後に削除
    setTimeout(() => {
        popup.remove();
    }, 2000);
}

// ========================================
// 4.2. ★ 削除時の最終警告ポップアップを追加
// ========================================
function showDeletePopup(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.id = 'delete-popup';
    
    // スタイルを適用（削除: 暗い赤/黒）
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(33, 37, 41, 0.95); /* 濃い灰色 */
        color: white;
        padding: 40px 80px;
        border-radius: 15px;
        font-size: 2.5em;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
        animation: fadeInOut 3s forwards; /* 3秒表示 */
    `;

    body.appendChild(popup);

    // 3秒後に削除
    setTimeout(() => {
        popup.remove();
    }, 3000);
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
    // ★ 正解状態とエラーカウントを取得
    let isSolved = memo.isSolved || false; 
    let errorCount = memo.errorCount || 0; 

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

    // ★ エラーカウント表示
    const errorCountElement = document.createElement('div');
    errorCountElement.className = 'error-count';
    errorCountElement.textContent = `失敗回数: ${errorCount}`;
    card.appendChild(errorCountElement);

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
          const memoIndex = memos.findIndex(m => m.id === memo.id);
          if (memoIndex === -1) return;
          const currentMemo = memos[memoIndex];
          
        if (answerInput.value === currentMemo.ruleName) {
          // ★★★ 正解したときの処理 ★★★
          
          // 0. ポップアップを表示
          showCorrectPopup();

          // 1. 元の文章に戻す
          titleElement.textContent = currentMemo.originalTitle || '無題';
          contentElement.textContent = currentMemo.originalContent;
          
          // 2. クイズエリアとヒント画像を消す
          card.removeChild(quizArea);
          if (hintImage) { 
            card.removeChild(hintImage);
          }
          
          // 3. 正解状態をメモに保存し、ローカルストレージを更新
          currentMemo.isSolved = true;
          currentMemo.errorCount = 0;
          saveMemos(); 

        } else {
          // ★★★ 不正解だったときの処理 ★★★
            
            // 1. 間違い回数をインクリメント
            currentMemo.errorCount = (currentMemo.errorCount || 0) + 1;
            errorCountElement.textContent = `失敗回数: ${currentMemo.errorCount}`;
            saveMemos(); // カウントを永続化

            // 2. カウントに基づいて処理を分岐
            if (currentMemo.errorCount === 2) {
                // 2回間違いで警告（ポップアップ）
                showIncorrectPopup('もう一回間違えると削除されます！');
            } else if (currentMemo.errorCount >= 3) {
                // 3回間違いでメモを削除（ポップアップと削除実行）
                showDeletePopup('3回失敗。メモは削除されました。');
                
                // ポップアップの表示時間（3秒）を考慮して、削除処理を遅延させる
                // ただし、即座に削除しないと削除されたメモが画面に残り続ける可能性があるため、
                // ポップアップ表示後、即座に削除・画面更新を行います。
                deleteMemo(currentMemo.id, false); 
                return; 
            } else {
                // 1回間違い時の通知（ポップアップ）
                showIncorrectPopup('残念！不正解！');
            }
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
// ★ 削除確認の引数を追加
function deleteMemo(id, requireConfirm = true) { 
  if (requireConfirm && !confirm('このメモを削除しますか？')) {
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
    // ★ ロード時に errorCount がないメモに 0 を設定して初期化
    memos.forEach(memo => {
        if (memo.errorCount === undefined) {
            memo.errorCount = 0;
        }
    });
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