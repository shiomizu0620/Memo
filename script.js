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
    { name: 'あがる',   transform: (text) => text.replaceAll('あ', 'る'), image: 'images/agemono.png' },
    { name: 'たぬき',   transform: (text) => text.replaceAll('た', ''),   image: 'images/tanuki.png' },
  ];

  // ★ 1. まず元の入力を取得
  const originalTitle = memoTitle.value;
  const originalContent = memoContent.value;

  // ★ 2. 元の入力が空の場合だけ、ここで処理を止める
  if (originalContent === '') {
    alert('メモの内容を入力してください');
    return;
  }

  // ★ タイトルと内容を結合した変数（これが抜けていました）
  const combinedInput = originalTitle + originalContent;

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

  // ★★★★★ ここからが重要 ★★★★★
  const newMemo = {
    id: Date.now(),
    title: title || '無題',
    content: content,
    originalTitle: originalTitle,     // ★変換前のタイトルを保存
    originalContent: originalContent, // ★変換前の内容を保存
    ruleName: selectedTransformation.name,
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
//  タイトル欄でEnterキーで保存する機能
// ========================================
memoTitle.addEventListener('keydown', function(event) {
  // 押されたキーがEnterキーの場合
  if (event.key === 'Enter') {
    // デフォルトのEnterキーの動作（フォーム送信など）をキャンセル
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

    // ★ヒント画像の変数をここで宣言しておく
    let hintImage = null;
    if (memo.image) {
      hintImage = document.createElement('img'); // ★ここで代入
      hintImage.src = memo.image;
      hintImage.className = 'hint-image';
      card.appendChild(hintImage);
    }

    // ★「変換なし」の場合はクイズエリアを作らない
    if (memo.ruleName !== '変換なし') {
      const quizArea = document.createElement('div');
      quizArea.className = 'quiz-area';
      const answerInput = document.createElement('input');
      answerInput.type = 'text';
      answerInput.placeholder = '適用されたルールは？';
      const checkButton = document.createElement('button');
      checkButton.textContent = '答え合わせ';

      checkButton.addEventListener('click', function() {
        const userAnswer = answerInput.value;

        // ★ひらがな以外の文字が含まれているかチェックする正規表現
        const hiraganaRegex = /^[ぁ-んー]+$/;

        if (!hiraganaRegex.test(userAnswer) && userAnswer !== "") {
          alert('答えはひらがなで書いてね');
          return; // ここで処理を中断
        }

        if (answerInput.value === memo.ruleName) {
          // ★★★ 正解したときの処理 ★★★
          // 1. 元の文章に戻す
          titleElement.textContent = memo.originalTitle || '無題';
          contentElement.textContent = memo.originalContent;

          // 2. クイズエリアとヒント画像を消す
          card.removeChild(quizArea);
          if (hintImage) { // hintImageが存在すれば消す
            card.removeChild(hintImage);
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
