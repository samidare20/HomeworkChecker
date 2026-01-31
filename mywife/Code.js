function checkCooldownAndNotify() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("시트1");
  const data = sheet.getDataRange().getValues();
  const settingSheet=SpreadsheetApp.getActiveSpreadsheet().getSheetByName("설정");
  const now = new Date();
  
  const webhookUrl=settingSheet.getRange(2,3).getValue();
  const myId=settingSheet.getRange(3,3).getValue();

  // 헤더 제외하고 2행부터 루프
  for (let i = 2; i < data.length; i++) {
    let taskName = data[i][1];
    let lastDone = new Date(data[i][5]); // 완료 시간
    let status = data[i][6];             // 상태
    
    // 쿨타임이 지났고, 아직 알림을 안 보냈다면
    if (now >= lastDone && status !== "발송완료") {      
      const message = `<@${myId}> ${taskName} 숙제할 시간입니다!`;
      sendDiscordMsg(webhookUrl, message);
      sheet.getRange(i + 1, 7).setValue("발송완료");
    }
  }
}
function sendDiscordMsg(url, content) {
  const payload = {
    "content": content,
    "username": "숙제 알리미", // 봇 이름 마음대로 설정 가능
    "avatar_url": "https://cdn.discordapp.com/attachments/1439236998564151417/1453018375297961984/icon_3.png?ex=697cb3d0&is=697b6250&hm=47154873999def0c11281e45babe09f60a7c182a5e5c7cad60ec31826fdfb684&" // 원하면 프로필 사진도 설정 가능
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, options);
}
function showSimpleInput() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
      '키워드 등록',
      '등록할 게임 키워드를 입력하세요 (예: 보스):',
      ui.ButtonSet.OK_CANCEL
  );

  // 사용자가 OK를 눌렀다면
  if (result.getSelectedButton() == ui.Button.OK) {
    const text = result.getResponseText();
    ui.alert('입력하신 키워드: ' + text);
    // 여기서 시트에 값을 박아넣으면 됩니다.
  }
}
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const col = range.getColumn();
  const row = range.getRow();
  
  // [기능 1] A열(과제명)에 새로운 값을 입력했을 때 -> 초기 세팅 자동화
  // 헤더(1행)가 아니고, 입력된 값(e.value)이 있을 때만 작동
  if (col === 2 && row > 2 && e.value&&SpreadsheetApp.getActiveSheet().getName()=="시트1") { 
    // 1. B열에 체크박스 생성
    sheet.getRange(row, 3).insertCheckboxes();
    
    // 2. G열(현재 상태)에 수식 자동 입력 (현재 행 번호에 맞춰서 수식 생성)
    const formula = `=IF(F${row}="", "입력 대기", IF(NOW() >= F${row}, "🟢 지금 가능!", "⏳ " & INT((F${row}-NOW())*24) & "시간 " & int(mod((F${row}-NOW())*24,1)*60) & "분 남음"))`;
    sheet.getRange(row, 8).setFormula(formula);
  }
  // 변경된 곳이 2번째 열(C열, 체크박스)이고, 헤더(1행)가 아닌 경우만 실행
  if (range.getColumn() === 3 && range.getRow() > 1) {
    const isChecked = range.getValue(); // 체크박스 상태 (true/false)
    const row = range.getRow();
    
    // 체크를 켰을 때 (True)
    if (isChecked === true) {
      // 1. C열(3번째 열)에 현재 시간 기록
      const d=new Date();
      const cooldownHours = sheet.getRange(row, 5).getValue();
      var nextTime = new Date(d.getTime() + (cooldownHours*1000*60));

      Logger.log(nextTime);
      if(String(cooldownHours).includes(":"))
      {
        const h=parseInt(String(cooldownHours).substring(0,String(cooldownHours).charAt(":")));
        nextTime = new Date(); // 오늘 날짜 기준
        nextTime.setHours(h, 0, 0, 0);

        // 그런데 만약 지금(d)이 오늘 새벽 5시를 이미 지나친 시간이라면?
        // -> 초기화 시간은 '내일' 새벽 5시가 되어야 함.
        if (d >= nextTime) {
          nextTime.setDate(nextTime.getDate() + 1); // 날짜를 하루 더함 (+1일)
        }
      }
      
      sheet.getRange(row, 6).setValue(nextTime);
      // Logger.log(d+sheet.getRange(row,5));
      // 2. F열(6번째 열) 상태를 '대기중'으로 초기화
      sheet.getRange(row, 7).setValue("대기중");
      // 3. (옵션) 체크박스를 다시 풀어서 다음 번에 누르기 좋게 만듦
      range.setValue(false); 
    }
  }
}