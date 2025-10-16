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
//  4. 保存ボタンを押したときの処理（改良版：適用可能なルールのみ抽選）
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
saveButton.addEventListener('click', function() {

  // --- 変換ルールのリスト（変更なし） ---
  const transformations = [
    { name: 'あ→る',   transform: (text) => text.replaceAll('あ', 'る'), image: 'images/agemono.png' },
    { name: 'たぬき',   transform: (text) => text.replaceAll('た', ''),   image: 'images/tanuki.png' },
    { name: 'い抜き',   transform: (text) => text.replaceAll('い', ''),   image: 'images/no-i.png' },
    { name: '母音抜き', transform: (text) => text.replace(/[あいうえお]/g, ''), image: 'images/vowel.png' }
  ];

  // ★ 1. まずユーザーの入力を取得する
  const originalTitle = memoTitle.value;
  const originalContent = memoContent.value;
  const combinedInput = originalTitle + originalContent; // タイトルと内容を結合してチェックしやすくする

  // ★ 2. 入力された文字に「適用可能」なルールだけを絞り込む
  const applicableTransformations = transformations.filter(rule => {
    // 変換を試してみて、元のテキストと変化があるかチェックする
    return rule.transform(combinedInput) !== combinedInput;
  });

  let selectedTransformation;

  // ★ 3. 適用可能なルールがある場合のみ、ランダムに選ぶ
  if (applicableTransformations.length > 0) {
    const randomIndex = Math.floor(Math.random() * applicableTransformations.length);
    selectedTransformation = applicableTransformations[randomIndex];
  } else {
    // どのルールも適用できない場合、変換しない（そのまま保存）
    selectedTransformation = {
      name: '変換なし',
      transform: (text) => text,
      image: null
    };
  }

  // ★ 4. 選ばれたルールで文字を変換
  const title = selectedTransformation.transform(originalTitle);
  const content = selectedTransformation.transform(originalContent);
  // --- 以下、保存処理 ---
  if (content === '') {
    alert('メモの内容を入力してください');
    return;
  } 

  // ★★★★★ ここからが重要 ★★★★★
  const newMemo = {
    id: Date.now(),
    title: title || '無題',
    content: content,
    originalContent: originalContent, // ★変換前の内容を保存
    date: new Date().toLocaleString('ja-JP'),
    image: selectedTransformation.image
  };
  // ★★★★★ ここまで ★★★★★

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

    // ★★★★★ ここからクイズ機能を追加 ★★★★★
    const quizArea = document.createElement('div');
    quizArea.className = 'quiz-area';

    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.placeholder = '元の言葉は？';

    const checkButton = document.createElement('button');
    checkButton.textContent = '答え合わせ';
    checkButton.addEventListener('click', function() {
      if (answerInput.value === memo.originalContent) {
        alert('正解です！🎉');
      } else {
        alert('残念！正解は「' + memo.originalContent + '」でした。');
      }
    });

    quizArea.appendChild(answerInput);
    quizArea.appendChild(checkButton);
    // ★★★★★ ここまで ★★★★★

    // カードに要素を追加
    card.appendChild(titleElement);
    card.appendChild(contentElement);
    card.appendChild(dateElement);
    card.appendChild(quizArea); // ★クイズエリアをカードに追加
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
