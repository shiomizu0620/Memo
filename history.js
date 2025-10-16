// history.js （新規作成）

// ========================================
// 1. HTML要素を取得する
// ========================================
const memoList = document.getElementById('memoList');

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
    const card = document.createElement('div');
    card.className = 'memo-card';

    const titleElement = document.createElement('h3');
    titleElement.textContent = memo.title;

    const contentElement = document.createElement('p');
    contentElement.textContent = memo.content;

    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = memo.date;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
      deleteMemo(memo.id);
    });

    // ★★★★★ ここから追加 ★★★★★
    if (memo.image) { // もしメモデータに画像パスがあれば
      const hintImage = document.createElement('img'); // img要素を作る
      hintImage.src = memo.image;                      // 画像の場所を指定
      hintImage.className = 'hint-image';              // CSSを適用
      card.appendChild(hintImage);                     // カードに追加
    }

    // カードに要素を追加
    card.appendChild(titleElement);
    card.appendChild(contentElement);
    card.appendChild(dateElement);
    card.appendChild(deleteButton);

    // リストに追加
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