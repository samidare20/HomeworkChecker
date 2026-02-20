// ✅ 체크박스 처리 로직을 별도 함수로 분리
function processCheckedRow(sheet, row) {
  const isChecked = sheet.getRange(row, 3).getValue();
  if (isChecked !== true) return;

  const d = new Date();
  const cooldownHours = sheet.getRange(row, 5).getValue();
  let nextTime = new Date(d.getTime() + (cooldownHours * 1000 * 60));

  if (String(cooldownHours).includes(":")) {
    const h = parseInt(String(cooldownHours).substring(0, String(cooldownHours).indexOf(":")));
    nextTime = new Date();
    nextTime.setHours(h, 0, 0, 0);
    if (d >= nextTime) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
  }

  sheet.getRange(row, 6).setValue(nextTime);
  sheet.getRange(row, 7).setValue("대기중");
  sheet.getRange(row, 3).setValue(false);
}

// ✅ 알림 체크 함수 - 시작 시 체크박스도 함께 스캔
function checkCooldownAndNotify() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("시트1");
  const settingSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("설정");
  const now = new Date();

  const webhookUrl = settingSheet.getRange(2, 3).getValue();
  const myId = settingSheet.getRange(3, 3).getValue();

  const data = sheet.getDataRange().getValues();

  for (let i = 2; i < data.length; i++) {
    const row = i + 1;

    // ✅ onEdit이 씹혔을 경우를 대비해 체크박스 먼저 처리
    processCheckedRow(sheet, row);

    // 처리 후 최신 값 다시 읽기
    const taskName = sheet.getRange(row, 2).getValue();
    const lastDone = new Date(sheet.getRange(row, 6).getValue());
    const status = sheet.getRange(row, 7).getValue();

    if (taskName && now >= lastDone && status !== "발송완료") {
      const message = `<@${myId}> ${taskName} 숙제할 시간입니다!`;
      sendDiscordMsg(webhookUrl, message);
      sheet.getRange(row, 7).setValue("발송완료");
    }
  }
}

// ✅ onEdit은 분리된 함수를 호출하도록 정리
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const col = range.getColumn();
  const row = range.getRow();

  // B열 과제명 입력 시 초기 세팅
  if (col === 2 && row > 2 && e.value && sheet.getName() == "시트1") {
    sheet.getRange(row, 3).insertCheckboxes();
    const formula = `=IF(F${row}="", "입력 대기", IF(NOW() >= F${row}, "🟢 지금 가능!", "⏳ " & INT((F${row}-NOW())*24) & "시간 " & INT(MOD((F${row}-NOW())*24,1)*60) & "분 남음"))`;
    sheet.getRange(row, 8).setFormula(formula);
  }

  // C열 체크박스 클릭 시
  if (col === 3 && row > 1 && sheet.getName() == "시트1") {
    processCheckedRow(sheet, row);
  }
}

function sendDiscordMsg(url, content) {
  const payload = {
    "content": content,
    "username": "숙제 알리미",
    "avatar_url": "https://cdn.discordapp.com/attachments/1439236998564151417/1453018375297961984/icon_3.png?ex=697cb3d0&is=697b6250&hm=47154873999def0c11281e45babe09f60a7c182a5e5c7cad60ec31826fdfb684&"
  };
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}
