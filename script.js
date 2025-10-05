// script.js
const memoInput = document.getElementById("memoInput");
const saveBtn = document.getElementById("saveBtn");
const memoList = document.getElementById("memoList");

// ローカルストレージからメモを取得
let memos = JSON.parse(localStorage.getItem("memos")) || [];

// ページ読み込み時にメモを表示
function displayMemos() {
  memoList.innerHTML = "";
  memos.forEach((memo, index) => {
    const li = document.createElement("li");
    li.textContent = memo;
    
    // 削除ボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = () => {
      memos.splice(index, 1);
      localStorage.setItem("memos", JSON.stringify(memos));
      displayMemos();
    };

    li.appendChild(deleteBtn);
    memoList.appendChild(li);
  });
}

// 保存ボタンの処理
saveBtn.addEventListener("click", () => {
  const memo = memoInput.value.trim();
  if (memo) {
    memos.push(memo);
    localStorage.setItem("memos", JSON.stringify(memos));
    memoInput.value = "";
    displayMemos();
  }
});

// 初回表示
displayMemos();
