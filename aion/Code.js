var lineName={};
lineName["캐릭터 이름"]=3;
lineName["남은 오드"]=4;
lineName["충전시간 계산"]=5;
lineName["추적시작 시간"]=25;

function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  const col = range.getColumn();
  const row = range.getRow();
  
  // B열(캐릭터 이름)에 새로운 값을 입력했을 때 -> 초기 세팅 자동화
  // 입력된 값(e.value)이 있을 때만 작동
  if (col === lineName["캐릭터 이름"] && row > 2 && e.value) { 
    // F열에 체크박스 생성
    sheet.getRange(row, lineName["충전시간 계산"]).insertCheckboxes();
  }
  // 변경된 곳이 2번째 열(C열, 체크박스)이고, 헤더(1행)가 아닌 경우만 실행
  if (range.getColumn() === lineName["충전시간 계산"] && range.getRow() > 2) {
    const isChecked = range.getValue(); // 체크박스 상태 (true/false)
    const row = range.getRow();
    
    // 체크를 켰을 때 (True)
    if (isChecked === true) {
      range.setValue(false); 
      
      const existodd=parseInt(sheet.getRange(row,lineName["남은 오드"]).getValue());
      Logger.log(existodd);
      const r=String.fromCharCode(64+lineName["추적시작 시간"]);
      sheet.getRange(row,lineName["추적시작 시간"]).setValue(new Date());

      const formula=`=min(840,${existodd}+INT((INT(NOW())*24 + HOUR(NOW()) + 1)/3) - INT((INT(${r}${row})*24 + HOUR(${r}${row}) + 1)/3))`;

      sheet.getRange(row,lineName["남은 오드"]).setFormula(formula);
      Logger.log(formula);
      /**
      const remodd=((840-existodd)/15)*3;
      
      var nexttime=new Date();
      const needtime=Math.min(remodd,remticket);
      nexttime.setHours(nexttime.getHours()+needtime);
      Logger.log(nexttime);

      const endodd=needtime/3*15+existodd;
      const enddticket=needtime/8+existticket;

      sheet.getRange(row,7).setValue(nexttime);
      sheet.getRange(row,8).setValue(Math.floor(endodd));
      sheet.getRange(row,9).setValue(Math.floor(enddticket));
      sheet.getRange(row,10).setValue(Math.floor(Math.min(endodd/80,enddticket))); */


    }
  
  }
}