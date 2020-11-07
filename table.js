let tableNone = false;
  // при нажатии кнопки, двигаю таблицу рекордов
function tableScore() {

    scoreTable.style.display = "block";
  
  
  
    if (!tableNone) {
      read();
      scoreTable.style.top = "50%";
      scoreTable.style.left = "50%";
      scoreTable.style.transform = "translateZ(0) translateX(-50%) translateY(-50%)";
  
      tableNone = true;
    }
  
    else {
  
      scoreTable.style.top = "0";
      scoreTable.style.left = "50%";
      scoreTable.style.transform = "translateZ(0) translateX(-50%)  translateY(-100%) ";
      tableNone = false;
    }
  }

  let scoreTable = document.querySelector(".tableDiv");