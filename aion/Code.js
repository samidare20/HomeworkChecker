function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const col = range.getColumn();
  const row = range.getRow();
  
  // B열(캐릭터 이름)에 새로운 값을 입력했을 때 -> 초기 세팅 자동화
  // 입력된 값(e.value)이 있을 때만 작동
  if (col === 3 && row > 2 && e.value) { 
    // F열에 체크박스 생성
    sheet.getRange(row, 6).insertCheckboxes();
  }
  // 변경된 곳이 2번째 열(C열, 체크박스)이고, 헤더(1행)가 아닌 경우만 실행
  if (range.getColumn() === 6 && range.getRow() > 2) {
    const isChecked = range.getValue(); // 체크박스 상태 (true/false)
    const row = range.getRow();
    
    // 체크를 켰을 때 (True)
    if (isChecked === true) {
      range.setValue(false); 
      
      const existodd=parseInt(sheet.getRange(row,4).getValue());
      const existticket=parseInt(sheet.getRange(row,5).getValue());
      const remodd=((840-existodd)/15)*3;
      const remticket=(21-existticket)*8;
      
      Logger.log(existodd+" "+existticket);
      Logger.log(remodd+" "+remticket);

      var nexttime=new Date();
      const needtime=Math.min(remodd,remticket);
      nexttime.setHours(nexttime.getHours()+needtime);
      Logger.log(nexttime);

      const endodd=needtime/3*15+existodd;
      const enddticket=needtime/8+existticket;

      sheet.getRange(row,7).setValue(nexttime);
      sheet.getRange(row,8).setValue(Math.floor(endodd));
      sheet.getRange(row,9).setValue(Math.floor(enddticket));
      sheet.getRange(row,10).setValue(Math.floor(Math.min(endodd/80,enddticket)));
    }
  
  }
}