// ========================================
// 1. HTML要素を取得する
// ========================================
const memoTitle = document.getElementById('memoTitle');
const memoContent = document.getElementById('memoContent');
const saveButton = document.getElementById('saveButton');
const memoList = document.getElementById('memoList');

// ========================================
// 2. メモを保存する配列
// ========================================
let memos = [];

// ========================================
// 3. ページを開いたときに実行する
// ========================================
// ローカルストレージからメモを読み込む
loadMemos();
// メモを画面に表示する
showMemos();

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//  4. 保存ボタンを押したときの処理（画像ヒント機能付き）
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
saveButton.addEventListener('click', function() {

  // --- 変換ルールのリスト（画像パスを追加） ---
  const transformations = [
    { name: 'あ→る',   transform: (text) => text.replaceAll('あ', 'る'), image: 'images/agemono.png' },
    { name: 'たぬき',   transform: (text) => text.replaceAll('た', ''),   image: 'images/tanuki.png' },
    
  ];

  // --- ランダムに1つの変換ルールを選ぶ ---
  const randomIndex = Math.floor(Math.random() * transformations.length);
  const selectedTransformation = transformations[randomIndex];

  // --- ユーザーの入力を取得 & 変換 ---
  let title = selectedTransformation.transform(memoTitle.value);
  let content = selectedTransformation.transform(memoContent.value);

  // --- 以下、保存処理 ---
  if (content === '') {
    alert('メモの内容を入力してください');
    return;
  }

  const newMemo = {
    id: Date.now(),
    title: title || '無題', // テキストのヒントは削除
    content: content,
    date: new Date().toLocaleString('ja-JP'),
    image: selectedTransformation.image // ★画像パスをメモに保存
  };

  memos.unshift(newMemo);
  saveMemos();
  memoTitle.value = '';
  memoContent.value = '';
  showMemos();
});

// ========================================
//  Enterキーで保存する機能
// ========================================
memoContent.addEventListener('keydown', function(event) {
  // 押されたキーがEnterキーで、Shiftキーが押されていない場合
  if (event.key === 'Enter' && !event.shiftKey) {
    // デフォルトのEnterキーの動作（改行）をキャンセル
    event.preventDefault();

    // 保存ボタンのクリックイベントを強制的に発生させる
    saveButton.click();
  }
});

// ========================================
// 5. メモを画面に表示する関数
// ========================================
function showMemos() {
  // 一旦表示をクリア
  memoList.innerHTML = '';

  // メモがない場合
  if (memos.length === 0) {
    memoList.innerHTML = '<p class="empty">メモがまだありません</p>';
    return;
  }

// ↓ ここを修正！ slice(0, 3) で配列の先頭から3つだけ取得する
  const recentMemos = memos.slice(0, 3);

  // 3つのメモを1つずつ表示
  recentMemos.forEach(function(memo) {
    // メモカードを作る
    const card = document.createElement('div');
    card.className = 'memo-card';

    // タイトル
    const titleElement = document.createElement('h3');
    titleElement.textContent = memo.title;

    // 内容
    const contentElement = document.createElement('p');
    contentElement.textContent = memo.content;

    // 日付
    const dateElement = document.createElement('div');
    dateElement.className = 'date';
    dateElement.textContent = memo.date;

    // 削除ボタン
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '削除';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
      deleteMemo(memo.id);
    });

    // ★★★★★ ここから3行追加 ★★★★★
    if (memo.image) { // もし画像パスがあれば
      const hintImage = document.createElement('img');
      hintImage.src = memo.image;
      hintImage.className = 'hint-image';
      card.appendChild(hintImage);
    }
    // ★★★★★ ここまで追加 ★★★★★

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
// 6. メモを削除する関数
// ========================================
function deleteMemo(id) {
  // 確認
  if (!confirm('このメモを削除しますか？')) {
    return;
  }

  // IDが一致しないメモだけ残す（=削除）
  memos = memos.filter(function(memo) {
    return memo.id !== id;
  });

  // ローカルストレージに保存
  saveMemos();

  // 画面を更新
  showMemos();
}

// ========================================
// 7. メモをローカルストレージに保存する関数
// ========================================
function saveMemos() {
  // 配列を文字列に変換して保存
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ========================================
// 8. メモをローカルストレージから読み込む関数
// ========================================
function loadMemos() {
  // ローカルストレージから読み込む
  const saved = localStorage.getItem('memos');

  // 保存されていたら配列に戻す
  if (saved) {
    memos = JSON.parse(saved);
  }
}

// ========================================
// 9. 拡張アイデア（チャレンジ課題）
// ========================================
// - 検索機能を追加する
// - メモを編集できるようにする
// - タグやカテゴリを追加する
// - 色を変えられるようにする
// - 重要度をつけられるようにする
