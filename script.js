// script.js
// ========================================
// 1. HTML要素を取得する
// ========================================
const memoTitle = document.getElementById('memoTitle');
const memoContent = document.getElementById('memoContent');
const saveButton = document.getElementById('saveButton');
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
// ローカルストレージからメモを読み込む
loadMemos();
// メモを画面に表示する
showMemos();

// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//  4. 保存ボタンを押したときの処理（改良版：適用可能なルールのみ抽選）
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
saveButton.addEventListener('click', function() {

  // --- 変換ルールのリスト（変更なし） ---
  const transformations = [
    { name: 'あがる',   transform: (text) => text.replaceAll('あ', 'る'), image: 'images/agemono.png' },
    { name: 'たぬき',   transform: (text) => text.replaceAll('た', ''),   image: 'images/tanuki.png' },
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
    originalTitle: originalTitle,     // ★変換前のタイトルを保存
    originalContent: originalContent, // ★変換前の内容を保存
    ruleName: selectedTransformation.name,
    date: new Date().toLocaleString('ja-JP'),
    image: selectedTransformation.image,
    isSolved: false // ★ 新規保存時、クイズは未回答状態
  };
  // ★★★★★ ここまで ★★★★★

  memos.unshift(newMemo);
  saveMemos();
  memoTitle.value = '';
  memoContent.value = '';
  showMemos();
});

// ========================================
//  Enterキーで保存する機能
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
// 5. ★ 正解時のポップアップ表示関数を追加
// ========================================
function showCorrectPopup() {
    // ポップアップコンテナを作成
    const popup = document.createElement('div');
    popup.textContent = '大正解！';
    popup.id = 'correct-popup';
    
    // スタイルを適用
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
        animation: fadeInOut 2.5s forwards; /* 2.5秒で表示・フェードアウト */
    `;

    // 画面に追加
    body.appendChild(popup);

    // 2.5秒後に削除
    setTimeout(() => {
        popup.remove();
    }, 2500);

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
// 6. メモを画面に表示する関数 (★関数名が5ですが実質的な5の機能です)
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
    // ★ 正解状態によって初期表示を切り替えるための変数
    let isSolved = memo.isSolved || false; 

    // メモカードを作る
    const card = document.createElement('div');
    card.className = 'memo-card';

    // タイトル
    const titleElement = document.createElement('h3');
    // ★ 正解済みなら変換前のタイトルを表示
    titleElement.textContent = isSolved ? memo.originalTitle || '無題' : memo.title;

    // 内容
    const contentElement = document.createElement('p');
    // ★ 正解済みなら変換前の内容を表示
    contentElement.textContent = isSolved ? memo.originalContent : memo.content;

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

          // 3. ★ 正解状態をメモに保存し、ローカルストレージを更新
          const index = memos.findIndex(m => m.id === memo.id);
          if (index !== -1) {
            memos[index].isSolved = true;
            saveMemos(); // 状態を永続化する
          }
        }
        else {
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
// 7. メモを削除する関数
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
// 8. メモをローカルストレージに保存する関数
// ========================================
function saveMemos() {
  // 配列を文字列に変換して保存
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ========================================
// 9. メモをローカルストレージから読み込む関数
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
// 10. 拡張アイデア（チャレンジ課題）
// ========================================
// - 検索機能を追加する
// - メモを編集できるようにする
// - タグやカテゴリを追加する
// - 色を変えられるようにする
// - 重要度をつけられるようにする