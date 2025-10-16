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

  // ★ 1. まず元の入力を取得
  const originalTitle = memoTitle.value;
  const originalContent = memoContent.value;

  // ★ 2. 元の入力が空の場合だけ、ここで処理を止める
  if (originalContent === '') {
    alert('メモの内容を入力してください');
    return;
  }

  // ★ タイトルと内容を結合した変数
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
    originalTitle: originalTitle,     // ★変換前のタイトルを保存
    originalContent: originalContent, // ★変換前の内容を保存
    ruleName: selectedTransformation.name,
    date: new Date().toLocaleString('ja-JP'),
    image: selectedTransformation.image,
    isSolved: false, // ★ 正解状態を追加
    errorCount: 0 // ★ 間違い回数を追加
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
//  タイトル欄でEnterキーで保存する機能
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
// 5. ★ ポップアップ表示関数群を追加
// ========================================
function showCorrectPopup() {
    const popup = document.createElement('div');
    popup.textContent = '大正解！';
    popup.id = 'correct-popup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: rgba(40, 167, 69, 0.95); color: white; padding: 30px 60px;
        border-radius: 10px; font-size: 3em; font-weight: bold; z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); animation: fadeInOut 2.5s forwards; 
    `;
    body.appendChild(popup);
    setTimeout(() => { popup.remove(); }, 2500);

    if (!document.getElementById('popup-style')) {
        const style = document.createElement('style');
        style.id = 'popup-style';
        style.textContent = `@keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
        }`;
        document.head.appendChild(style);
    }
}

function showIncorrectPopup(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.id = 'incorrect-popup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: rgba(220, 53, 69, 0.95); color: white; padding: 30px 60px;
        border-radius: 10px; font-size: 3em; font-weight: bold; z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); animation: fadeInOut 2s forwards; 
    `;
    body.appendChild(popup);
    setTimeout(() => { popup.remove(); }, 2000);
}

function showDeletePopup(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.id = 'delete-popup';
    popup.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: rgba(33, 37, 41, 0.95); color: white; padding: 40px 80px;
        border-radius: 15px; font-size: 2.5em; font-weight: bold; z-index: 1000;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5); animation: fadeInOut 3s forwards;
    `;
    body.appendChild(popup);
    setTimeout(() => { popup.remove(); }, 3000);
}


// ========================================
// 6. メモを画面に表示する関数 (★関数名が5でしたが、5.をポップアップにしたため6.に)
// ========================================
function showMemos() {
  // 一旦表示をクリア
  memoList.innerHTML = '';

  // メモがない場合
  if (memos.length === 0) {
    memoList.innerHTML = '<p class="empty">メモがまだありません</p>';
    return;
  }

// ↓ 配列の先頭から3つだけ取得する
  const recentMemos = memos.slice(0, 3);

  // 3つのメモを1つずつ表示
  recentMemos.forEach(function(memo) {
    // ★ 正解状態とエラーカウントを取得
    let isSolved = memo.isSolved || false; 
    let errorCount = memo.errorCount || 0; 

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

    // ★ エラーカウント表示（メイン画面では必須ではないが、履歴と合わせるため追加）
    const errorCountElement = document.createElement('div');
    errorCountElement.className = 'error-count';
    errorCountElement.textContent = `失敗回数: ${errorCount}`;
    card.appendChild(errorCountElement);

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
        const userAnswer = answerInput.value;
        const hiraganaRegex = /^[ぁ-んー]+$/;

        if (!hiraganaRegex.test(userAnswer) && userAnswer !== "") {
          alert('答えはひらがなで書いてね');
          return; 
        }
        
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
          if (hintImage) { // hintImageが存在すれば消す
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
// 7. メモを削除する関数
// ========================================
// ★ 削除確認の引数を追加
function deleteMemo(id, requireConfirm = true) {
  // 確認
  if (requireConfirm && !confirm('このメモを削除しますか？')) {
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
    // ★ ロード時に errorCount がないメモに 0 を設定して初期化
    memos.forEach(memo => {
        if (memo.errorCount === undefined) {
            memo.errorCount = 0;
        }
    });
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