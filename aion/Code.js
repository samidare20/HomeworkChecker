var lineName={
"캐릭터 이름":3,
"남은 오드":4,
"충전시간 계산":5,
"완충시간":6,
"추적시작 시간":25,
"틱":26
};
function gettick(pastTime,pastOdd)
{
  const getTick = (date) => {
        // 1. UTC 기준 ms -> 시간 변환
        // 2. getTimezoneOffset()은 분 단위(한국은 -540)이므로 시간으로 변환해 빼줌(결국 더하기가 됨)
        const localTotalHours = (date.getTime() / (1000 * 60 * 60)) - (date.getTimezoneOffset() / 60);
        
        // 3. (시간 + 1) / 3 하고 내림(floor) 처리
        return Math.floor((localTotalHours + 1) / 3);
    };
    const pastDate=new date(pastTime);
    const nowDate=new date();
    const interval=gettick(nowDate)-gettick(pastDate);
    
    
}
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
      const o=String.fromCharCode(64+lineName["남은 오드"]);
      sheet.getRange(row,lineName["추적시작 시간"]).setValue(new Date());

      const formula1=`=min(840,${existodd}+(INT((INT(NOW())*24 + HOUR(NOW()) + 1)/3) - INT((INT(${r}${row})*24 + HOUR(${r}${row}) + 1)/3))*15)`;
      const formula2=`INT((INT(NOW())*24 + HOUR(NOW()) + 1)/3) - INT((INT(${r}${row})*24 + HOUR(${r}${row}) + 1)/3)`;
      const formula3=`=time(hour(${r}${row})-mod(HOUR(${r}${row}),3)-1,0,0)+date(YEAR(${r}${row}),MONTH(${r}${row}),DAY(${r}${row}))+roundup((840-${o}${row}+15)/15)*3/24`
      sheet.getRange(row,lineName["남은 오드"]).setFormula(formula1);
      sheet.getRange(row,lineName["틱"]).setFormula(formula2);
      sheet.getRange(row,lineName["완충시간"]).setFormula(formula3);
    }
  
  }
}