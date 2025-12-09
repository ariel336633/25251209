let spriteSheet;
let walkSheet;
let jumpSheet;
let pushSheet;
let toolSheet;
let spriteSheet2;
let smileSheet2;
let downSheet2;

let stopAnimation = [];
let walkAnimation = [];
let jumpAnimation = [];
let pushAnimation = [];
let toolAnimation = [];
let stopAnimation2 = [];
let smileAnimation2 = [];
let downAnimation2 = [];

const stopNumberOfFrames = 15;
const walkNumberOfFrames = 9;
const jumpNumberOfFrames = 14;
const pushNumberOfFrames = 4;
const toolNumberOfFrames = 5;

const stopNumberOfFrames2 = 8;
const smileNumberOfFrames2 = 5;
const downNumberOfFrames2 = 12;

let frameWidth;
let walkFrameWidth;

// 角色的位置和速度
let x, y, x2, y2;
let speed = 5;
let direction = 1; // 1 for right, -1 for left
let direction2 = 1; // 1 for right, -1 for left for character 2

// 角色2 狀態相關變數
let isSmiling2 = false;
let isDown2 = false; // 新增：角色2是否被擊倒的狀態
let downFrame2 = 0;
const downAnimationSpeed2 = 8; // 倒下動畫速度
let smileFrame2 = 0;
const smileAnimationSpeed2 = 8; // 數字越小越快
const proximityThreshold = 150; // 觸發微笑的距離

// 對話相關變數
let nameInput;
let playerName = '';
let conversationState = 0; // 0: idle, 1: asking, 2: correct, 3: incorrect

// 攻擊相關變數
let isAttacking = false;
let attackFrame = 0;
const attackAnimationSpeed = 6; // 數字越小越快

// 發射物陣列
let projectiles = [];

// 按鈕相關變數
let nextButton;
let tryAgainButton;

// 題庫相關變數
let questionBank;
let currentQuestion;

function preload() {
  // 預先載入圖片
  // 請確保您的資料夾結構是 sketch.js 旁邊有 1/stop/stop.png
  spriteSheet = loadImage('1/stop/stop.png');
  walkSheet = loadImage('1/walk/walk.png');
  jumpSheet = loadImage('1/jump/jump.png');
  pushSheet = loadImage('1/push/push.png');
  toolSheet = loadImage('1/tool/tool.png');
  spriteSheet2 = loadImage('2/stop/stop_2.png');
  smileSheet2 = loadImage('2/smile/smile_2.png');
  downSheet2 = loadImage('2/down/down_2.png'); // 載入角色2的倒下動畫

  // 載入題庫 CSV 檔案
  questionBank = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化角色位置在畫面中央
  x = width / 2;
  y = height / 2;
  x2 = width / 2 - 200; // 將新角色放在左邊
  y2 = height / 2;

  // 計算單一畫格的寬度
  frameWidth = spriteSheet.width / stopNumberOfFrames;
  let frameHeight = spriteSheet.height;
  for (let i = 0; i < stopNumberOfFrames; i++) {
    let frame = spriteSheet.get(i * frameWidth, 0, frameWidth, frameHeight);
    stopAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割走路動畫
  walkFrameWidth = walkSheet.width / walkNumberOfFrames;
  let walkFrameHeight = walkSheet.height;
  for (let i = 0; i < walkNumberOfFrames; i++) {
    let frame = walkSheet.get(
      i * walkFrameWidth, 0, 
      walkFrameWidth, walkFrameHeight
    );
    walkAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割跳躍動畫
  let jumpFrameWidth = jumpSheet.width / jumpNumberOfFrames;
  let jumpFrameHeight = jumpSheet.height;
  for (let i = 0; i < jumpNumberOfFrames; i++) {
    let frame = jumpSheet.get(
      i * jumpFrameWidth, 0,
      jumpFrameWidth, jumpFrameHeight
    );
    jumpAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割攻擊動畫
  let pushFrameWidth = pushSheet.width / pushNumberOfFrames;
  let pushFrameHeight = pushSheet.height;
  for (let i = 0; i < pushNumberOfFrames; i++) {
    let frame = pushSheet.get(
      i * pushFrameWidth, 0,
      pushFrameWidth, pushFrameHeight
    );
    pushAnimation.push(frame);
  }

  // 計算單一畫格的寬度並切割發射物動畫
  let toolFrameWidth = toolSheet.width / toolNumberOfFrames;
  let toolFrameHeight = toolSheet.height;
  for (let i = 0; i < toolNumberOfFrames; i++) {
    let frame = toolSheet.get(
      i * toolFrameWidth, 0, toolFrameWidth, toolFrameHeight);
    toolAnimation.push(frame);
  }

  // 計算新角色單一畫格的寬度並切割站立動畫
  let frameWidth2 = spriteSheet2.width / stopNumberOfFrames2;
  let frameHeight2 = spriteSheet2.height;
  for (let i = 0; i < stopNumberOfFrames2; i++) {
    let frame = spriteSheet2.get(i * frameWidth2, 0, frameWidth2, frameHeight2);
    stopAnimation2.push(frame);
  }

  // 計算新角色微笑動畫的畫格
  let smileFrameWidth2 = smileSheet2.width / smileNumberOfFrames2;
  let smileFrameHeight2 = smileSheet2.height;
  for (let i = 0; i < smileNumberOfFrames2; i++) {
    let frame = smileSheet2.get(i * smileFrameWidth2, 0, smileFrameWidth2, smileFrameHeight2);
    smileAnimation2.push(frame);
  }

  // 計算角色2倒下動畫的畫格
  let downFrameWidth2 = downSheet2.width / downNumberOfFrames2;
  let downFrameHeight2 = downSheet2.height;
  for (let i = 0; i < downNumberOfFrames2; i++) {
    let frame = downSheet2.get(i * downFrameWidth2, 0, downFrameWidth2, downFrameHeight2);
    downAnimation2.push(frame);
  }
}

function draw() {
  // 設定背景顏色
  background('#f5ebe0');

  // 將圖片的繪製基準點設為中心
  imageMode(CENTER);

  // --- 物理與狀態更新 ---
  if (isAttacking) {
    // 如果不在跳躍但在攻擊中
    attackFrame++;
    if (attackFrame >= pushNumberOfFrames * attackAnimationSpeed) {
      // 攻擊動畫結束
      isAttacking = false;
      attackFrame = 0;
      // 產生一個發射物
      projectiles.push({
        x: x + (direction * 50), // 從角色前方產生
        y: y,
        direction: direction,
        speed: 40, // 增加發射物速度，使其飛得更遠
        frame: 0
      });
    }
  } else {
    // 如果不在攻擊中，處理四向移動
    if (keyIsDown(68)) { // 'D' key
      x += speed;
      direction = 1;
    }
    if (keyIsDown(65)) { // 'A' key
      x -= speed;
      direction = -1;
    }
    if (keyIsDown(87)) { // 'W' key
      y -= speed;
    }
    if (keyIsDown(83)) { // 'S' key
      y += speed;
    }
  }

  // 使用 constrain() 函式將角色的 x 座標限制在畫布範圍內
  x = constrain(x, stopAnimation[0].width / 2, width - stopAnimation[0].width / 2);
  y = constrain(y, stopAnimation[0].height / 2, height - stopAnimation[0].height / 2);

  // --- 繪圖 ---

  // 繪製所有發射物
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    p.x += p.speed * p.direction;
    p.frame++;

    push();
    translate(p.x, p.y);
    scale(p.direction, 1);
    let frameIndex = floor(p.frame / 4) % toolNumberOfFrames;
    image(toolAnimation[frameIndex], 0, 0);
    pop();

    // 檢查發射物是否擊中角色2
    let hitThreshold = 50; // 判定擊中的距離
    if (abs(p.x - x2) < hitThreshold && abs(p.y - y2) < hitThreshold) {
      if (!isDown2) { // 只有在角色還沒倒下時才觸發
        isDown2 = true; // 設定角色2為被擊倒狀態
        downFrame2 = 0; // 重置倒下動畫計數器
        isSmiling2 = false; // 確保不會同時微笑
      }
      projectiles.splice(i, 1); // 移除擊中的發射物
      continue; // 繼續下一個循環，避免檢查已移除的物件
    } else if (p.x > width || p.x < 0) {
      projectiles.splice(i, 1);
    }
  }

  // 根據角色1的位置決定角色2的方向
  if (x < x2) {
    direction2 = -1; // 角色1在左邊，角色2朝左
  } else {
    direction2 = 1; // 角色1在右邊，角色2朝右
  }

  // --- 對話狀態機 ---
  let isClose = abs(x - x2) < proximityThreshold;

  if (isClose && conversationState === 0) {
    // 靠近時開始對話
    if (isDown2) {
      isDown2 = false; // 如果角色2是倒下的，靠近時讓它恢復
    }
    // 只有在題庫載入成功且還沒提問時，才開始提問
    if (questionBank && questionBank.getRowCount() > 0) {
      currentQuestion = random(questionBank.getRows()); // 隨機選一個問題
      conversationState = 1;
    }
  } else if (!isClose && conversationState !== 0) {
    // 離開時結束對話
    conversationState = 0;
    playerName = '';
    if (nameInput) {
      nameInput.remove();
      nameInput = null;
    }
    // 無論如何都移除按鈕
    removeButtons();
  }

  // 根據對話狀態決定是否微笑 (提問或顯示回饋時都微笑)，且角色沒有被擊倒
  if (conversationState > 0 && !isDown2) {
    isSmiling2 = true;
  } else {
    isSmiling2 = false;
  }

  // 繪製新角色 (如果動畫已準備好)
  if (stopAnimation2.length > 0) {
    push();
    translate(x2, y2);
    scale(direction2, 1); // 根據方向翻轉角色2

    if (isDown2 && downAnimation2.length > 0) {
      // 播放一次倒下動畫
      let frameIndex = floor(downFrame2 / downAnimationSpeed2);
      if (frameIndex < downNumberOfFrames2) {
        image(downAnimation2[frameIndex], 0, 0);
        downFrame2++; // 遞增動畫計數器
      } else {
        // 動畫播放完畢，恢復站立
        isDown2 = false;
      }
    } else if (isSmiling2) {
      // 播放微笑動畫
      // 讓動畫循環播放
      image(smileAnimation2[floor(frameCount / smileAnimationSpeed2) % smileNumberOfFrames2], 0, 0);
    } else {
      // 播放站立動畫
      image(stopAnimation2[floor(frameCount / 8) % stopNumberOfFrames2], 0, 0);
    }

    pop();
  }

  // 如果角色2正在微笑且沒有被擊倒，則在其上方顯示對話框
  if (isSmiling2 && !isDown2 && smileAnimation2.length > 0) {
    let dialogueText = "";
    let boxWidth = 300; // 增加對話框寬度，以容納更多文字
    let boxHeight = 100; // 增加對話框高度，以容納更多文字

    if (conversationState === 1) {
      if (currentQuestion) {
        dialogueText = currentQuestion.getString('題目'); // 從題庫取得題目文字
      } else {
        dialogueText = "題庫載入中...";
      }

      // 如果輸入框不存在，則創建它
      if (!nameInput) {
        nameInput = createInput();
        nameInput.size(150);
      }
      // 持續更新輸入框位置在角色1的頭上
      let inputX = x - nameInput.width / 2;
      let inputY = y - stopAnimation[0].height / 2 - 40; // 放在角色1頭頂上方40像素處
      nameInput.position(inputX, inputY);

    } else if (conversationState === 2) { // 答對了
      dialogueText = currentQuestion.getString('答對回饋').trim();
      // 顯示 "下一題" 按鈕
      if (!nextButton) {
        let smileImgHeight = smileAnimation2[0].height;
        let boxY = y2 - smileImgHeight / 2 - boxHeight / 2 - 10;
        nextButton = createButton('下一題');
        // 將按鈕放在對話框上方
        let buttonX = x2 - nextButton.width / 2;
        let buttonY = boxY - boxHeight / 2 - 40;
        nextButton.position(buttonX, buttonY);
        nextButton.mousePressed(() => {
          conversationState = 0; // 重置對話狀態以觸發新問題
          removeButtons();
        });
      }
    } else if (conversationState === 3) { // 答錯了
      const wrongFeedback = currentQuestion.getString('答錯回饋').trim(); // 例如 "不對喔，再想一下。"
      const hint = currentQuestion.getString('提示').trim(); // 例如 "比7大，比9小"
      dialogueText = `${wrongFeedback} ${hint}`; // 組合答錯回饋與提示
      // 顯示 "再答一次" 按鈕
      if (!tryAgainButton) {
        let smileImgHeight = smileAnimation2[0].height;
        let boxY = y2 - smileImgHeight / 2 - boxHeight / 2 - 10;
        tryAgainButton = createButton('再答一次');
        let buttonX = x2 - tryAgainButton.width / 2;
        let buttonY = boxY - boxHeight / 2 - 40;
        tryAgainButton.position(buttonX, buttonY);
        tryAgainButton.mousePressed(() => {
          conversationState = 1; // 回到提問狀態
          removeButtons();
        });
      }
    }

    push();
    // 設定對話框樣式
    // 取得當前微笑圖片的高度來定位對話框
    let smileImgHeight = smileAnimation2[0].height;
    let boxX = x2; // 對話框的X座標
    let boxY = y2 - smileImgHeight / 2 - boxHeight / 2 - 10; // 放在頭頂上方一點

    fill(255, 255, 255, 220); // 半透明白色背景
    stroke(0); // 黑色邊框
    rectMode(CENTER);
    rect(boxX, boxY, boxWidth, boxHeight, 10); // 圓角矩形

    // 設定文字樣式並繪製對話內容
    fill(0); // 黑色文字
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(18);

    // 實現文字換行
    const maxTextWidth = boxWidth - 20; // 左右各留10px邊距
    const lines = [];
    const words = dialogueText.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i] + ' ';
      // 使用 p5.js 的 textWidth 函數來測量文字寬度
      if (textWidth(testLine) > maxTextWidth && i > 0) {
        lines.push(currentLine.trim());
        currentLine = words[i] + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());

    const lineHeight = 20; // 每行文字的高度，可根據字體大小調整
    const totalTextHeight = lines.length * lineHeight;
    // 計算文字的起始Y座標，使其在對話框中垂直居中
    let textStartY = boxY - totalTextHeight / 2 + lineHeight / 2;

    for (let i = 0; i < lines.length; i++) {
      text(lines[i], boxX, textStartY + i * lineHeight);
    }
    pop();
  }

  // 繪製角色
  push();
  translate(x, y);
  scale(direction, 1); // 根據方向翻轉圖片

  if (isAttacking) {
    // 播放攻擊動畫
    let frameIndex = floor(attackFrame / attackAnimationSpeed);
    image(pushAnimation[frameIndex], 0, 0);
  } else if (keyIsDown(68) || keyIsDown(65) || keyIsDown(87) || keyIsDown(83)) { // 'D', 'A', 'W', or 'S'
    // 播放走路動畫
    image(walkAnimation[floor(frameCount / 4) % walkNumberOfFrames], 0, 0);
  } else {
    // 播放站立動畫
    image(stopAnimation[floor(frameCount / 8) % stopNumberOfFrames], 0, 0);
  }
  pop();
}

function keyPressed() {
  // 只有在角色不在跳躍或攻擊時才能觸發新動作
  if (isAttacking) return;

  if (keyCode === DOWN_ARROW) { // Down Arrow key
    isAttacking = true;
    attackFrame = 0;
  } else if (keyCode === ENTER && conversationState === 1) {
    // 當正在回答問題時按下 Enter
    const userAnswer = nameInput.value();
    const correctAnswer = currentQuestion.getString('答案').trim();
    if (userAnswer === correctAnswer) {
      conversationState = 2; // 切換到答對回饋狀態
    } else { 
      conversationState = 3; // 切換到答錯回饋狀態
    }
    // 移除輸入框，準備顯示按鈕
    if (nameInput) {
      nameInput.remove();
      nameInput = null;
    }
  }
}

function removeButtons() {
  if (nextButton) {
    nextButton.remove();
    nextButton = null;
  }
  if (tryAgainButton) {
    tryAgainButton.remove();
    tryAgainButton = null;
  }
}

function windowResized() {
  // 當視窗大小改變時，自動調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
  y2 = height / 2; // 更新新角色的 y 座標
}
