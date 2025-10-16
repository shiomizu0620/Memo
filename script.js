// script.js (コンフリクト解消・機能統合版)

// ========================================
// 1. HTML要素を取得する
// ========================================
const memoTitle = document.getElementById('memoTitle');
const memoContent = document.getElementById('memoContent');
const saveButton = document.getElementById('saveButton');
const memoList = document.getElementById('memoList');
const body = document.querySelector('body');

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
// 4. 保存ボタンを押したときの処理
// ========================================
saveButton.addEventListener('click', function() {
  const transformations = [
    { name: 'あがる',   transform: (text) => text.replaceAll('あ', 'る'), image: 'images/agemono.png' },
    { name: 'たぬき',   transform: (text) => text.replaceAll('た', ''),   image: 'images/tanuki.png' },
    { name: 'こけし',   transform: (text) => text.replaceAll('こ', ''),   image: 'images/kokesi.png' },
    { name: 'わたがし',   transform: (text) => text.replaceAll('わ', 'し').replaceAll('た', 'し'),   image: 'images/watagasi.png' },
    { name: 'けしごむ',   transform: (text) => text.replaceAll('ご', '').replaceAll('む', ''),   image: 'images/kesigomu.png' },
    { name: 'だがし',   transform: (text) => text.replaceAll('だ', 'し'),   image: 'images/dagasi.png' },
    { name: 'ひがし',   transform: (text) => text.replaceAll('ひ', 'し'),   image: 'images/higasi.png' },
    { name: 'ひけし',   transform: (text) => text.replaceAll('ひ', ''),   image: 'images/hikesi.png' },
    { name: 'さがん',   transform: (text) => text.replaceAll('さ', 'ん'),   image: 'images/sagan.png' },
  ];

  const originalTitle = memoTitle.value;
  const originalContent = memoContent.value;

  if (originalContent === '') {
    alert('メモの内容を入力してください');
    return;
  }

  const combinedInput = originalTitle + originalContent;
  const applicableTransformations = transformations.filter(rule => rule.transform(combinedInput) !== combinedInput);
  let selectedTransformation;

  if (applicableTransformations.length > 0) {
    const randomIndex = Math.floor(Math.random() * applicableTransformations.length);
    selectedTransformation = applicableTransformations[randomIndex];
  } else {
    selectedTransformation = { name: '変換なし', transform: (text) => text, image: null };
  }

  const title = selectedTransformation.transform(originalTitle);
  const content = selectedTransformation.transform(originalContent);

  const newMemo = {
    id: Date.now(),
    title: title || '無題',
    content: content,
    originalTitle: originalTitle,
    originalContent: originalContent,
    ruleName: selectedTransformation.name,
    isSolved: false,
    errorCount: 0, // ★間違い回数を追加
    date: new Date().toLocaleString('ja-JP'),
    image: selectedTransformation.image
  };

  memos.unshift(newMemo);
  saveMemos();
  memoTitle.value = '';
  memoContent.value = '';
  showMemos();
});

// ========================================
// 5. Enterキーで保存する機能
// ========================================
memoContent.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    saveButton.click();
  }
});

memoTitle.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveButton.click();
  }
});

// ========================================
// 6. ポップアップ表示関数
// ========================================
function showCorrectPopup() {
  const popup = document.createElement('div');
  popup.textContent = '🎉大正解！🎉';
  popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(40, 167, 69, 0.95); color: white; padding: 30px 60px; border-radius: 10px; font-size: 3em; font-weight: bold; z-index: 1000; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); animation: fadeInOut 1.8s forwards;`;
  body.appendChild(popup);
  setTimeout(() => { popup.remove(); }, 1800);
  if (!document.getElementById('popup-style')) {
    const style = document.createElement('style');
    style.id = 'popup-style';
    style.textContent = `@keyframes fadeInOut { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); } 20% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); } }`;
    document.head.appendChild(style);
  }
}

function showIncorrectPopup(message) {
  const popup = document.createElement('div');
  popup.textContent = message;
  popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(220, 53, 69, 0.95); color: white; padding: 30px 60px; border-radius: 10px; font-size: 3em; font-weight: bold; z-index: 1000; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); animation: fadeInOut 2s forwards;`;
  body.appendChild(popup);
  setTimeout(() => { popup.remove(); }, 2000);
}

function showDeletePopup(message) {
  const popup = document.createElement('div');
  popup.textContent = message;
  popup.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(33, 37, 41, 0.95); color: white; padding: 40px 80px; border-radius: 15px; font-size: 2.5em; font-weight: bold; z-index: 1000; box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5); animation: fadeInOut 3s forwards;`;
  body.appendChild(popup);
  setTimeout(() => { popup.remove(); }, 3000);
}

// ========================================
// 7. メモを画面に表示する関数
// ========================================
function showMemos() {
  memoList.innerHTML = '';
  if (memos.length === 0) {
    memoList.innerHTML = '<p class="empty">メモがまだありません</p>';
    return;
  }
  const recentMemos = memos.slice(0, 3);
  recentMemos.forEach(function(memo) {
    let isSolved = memo.isSolved || false;
    const card = document.createElement('div');
    card.className = 'memo-card';
    const titleElement = document.createElement('h3');
    titleElement.textContent = isSolved ? (memo.originalTitle || '') : (memo.title || '無題');
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
        const memoIndex = memos.findIndex(m => m.id === memo.id);
        if (memoIndex === -1) return;
        if (userAnswer === memo.ruleName) {
          showCorrectPopup();
          titleElement.textContent = memo.originalTitle || '';
          contentElement.textContent = memo.originalContent;
          card.removeChild(footer);
          if (hintImage) { card.removeChild(hintImage); }
          memos[memoIndex].isSolved = true;
          saveMemos();
        } else {
          memos[memoIndex].errorCount = (memos[memoIndex].errorCount || 0) + 1;
          saveMemos();
          if (memos[memoIndex].errorCount >= 3) {
            showDeletePopup('3回失敗。メモは削除されました。');
            deleteMemo(memo.id, false);
          } else if (memos[memoIndex].errorCount === 2) {
            showIncorrectPopup('もう一回間違えると削除されます！');
          } else {
            showIncorrectPopup('残念！不正解！');
          }
        }
      });
      answerInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          checkButton.click();
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
// 8. メモを削除する関数
// ========================================
function deleteMemo(id, requireConfirm = true) {
  if (requireConfirm && !confirm('このメモを削除しますか？')) {
    return;
  }
  memos = memos.filter(function(memo) { return memo.id !== id; });
  saveMemos();
  showMemos();
}

// ========================================
// 9. メモをローカルストレージに保存する関数
// ========================================
function saveMemos() {
  localStorage.setItem('memos', JSON.stringify(memos));
}

// ========================================
// 10. メモをローカルストレージから読み込む関数
// ========================================
function loadMemos() {
  const saved = localStorage.getItem('memos');
  if (saved) {
    memos = JSON.parse(saved);
    memos.forEach(memo => {
      if (memo.errorCount === undefined) {
        memo.errorCount = 0;
      }
    });
  }
}