const winCondititons = [
  "00,10,20",
  "01,11,21",
  "02,12,22",
  "00,01,02",
  "10,11,12",
  "20,21,22",
  "00,11,22",
  "02,11,20"
]

const player1 = "O"
const player2 = "X"
const isComputer = true

let playerTurn = player1



const playingState = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""]
]

renderTable(playingState)
let treeMap = buildTree([...playingState], "O", null,1)
console.dir(treeMap, {
  depth: 3
})

function renderTable(tableData) {
  var table = document.createElement('table');
  var tableBody = document.createElement('tbody');

  tableData.forEach(function(rowData, rowIndex) {
    var row = document.createElement('tr');
    row.id = `${rowIndex}`

    rowData.forEach(function(cellData, columnIndex) {
      var cell = document.createElement('td');
      cell.id = `${columnIndex}${rowIndex}`
      cell.addEventListener('click', e => {
        handleCellClick(columnIndex,rowIndex)
      })
      cell.appendChild(document.createTextNode(cellData));
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  document.body.appendChild(table);
}

function renderWinner(winner) {
  console.log(winner)
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(winner));
  document.body.appendChild(div);
}

function updateCell(x, y) {
  const cell = document.getElementById(`${x}${y}`)

  const textNode = cell.childNodes[0]

  if (textNode.textContent !== "") {
    return
  }
  textNode.textContent = playerTurn
  // isO = !isO
}

function handleCellClick(x, y) {
  playingState[y][x] = playerTurn
  updateCell(x, y)
  playerTurn = playerTurn === player1 ? player2 : player1
  console.dir(playingState)
  let winner = checkWinConditions(playingState)
  if (winner) {
    renderWinner(winner)
  } else {
    setEnemyMove(`${y}${x}`, treeMap)
    if (isComputer && playerTurn === player2) {
      const computerPosition = getOptimalMove(treeMap)
      const [y,x] = computerPosition.split("")
      playingState[y][x] = playerTurn
      updateCell(x, y)
      let winner = checkWinConditions(playingState)
      if (winner) {
        renderWinner(winner)
      }
      playerTurn = player1
    }
  }
}


function buildTree (state, turn, position, depth) {
  const node = {
    eval: 0,
    state,
    position,
    turn,
    depth,
    children: []
  };
  const winner = checkWinConditions(state)

  if(winner === "X") {
    node.eval = 1 / depth
    return node
  } else if(winner === "O") {
    node.eval = -1 / depth
    return node
  } else if (winner === "draw") {
    node.eval = 0
    return node
  } else {
    [...state].forEach((row, y) =>
      row.forEach((cell, x) => {
        if(cell === "") {
          const newMatrix = JSON.parse(JSON.stringify(state))
          newMatrix[y][x] = turn
          const childNode = buildTree(newMatrix, turn === "X" ? "O" : "X", `${y}${x}`, depth + 1)
          node.children.push(childNode)
        }
      })
    )

    if (turn === "X") {
      node.eval = node.children.sort((a,b) => b.eval - a.eval)[0]?.eval

    } else {
      node.eval = node.children.sort((a,b) => a.eval - b.eval)[0]?.eval
    }
    return node
  }

}

function getOptimalMove(currentTreeMap) {
  const move = currentTreeMap.children.sort((a,b) => b.eval - a.eval)[0]
  console.log(treeMap)
  console.log(move)
  treeMap = move

  return move.position
}

function setEnemyMove(position, currentTreeMap) {
  const move = currentTreeMap.children.find(child => child.position === position)
  if (move) {
    treeMap = move
  }
}
function checkWinConditions(state) {

  let step = 0
  let winner

  while(step < 8) {
    const winCondition = winCondititons[step].split(",");

    const [x1,y1] = winCondition[0].split("")
    const [x2,y2] = winCondition[1].split("")
    const [x3,y3] = winCondition[2].split("")

    if (
      state[y1][x1] === state[y2][x2] &&
      state[y1][x1] === state[y3][x3]
    ) {
      winner = state[y1][x1]
      break;
    }

    step++
  }

  if (!winner && !state.some((line) => line.some(cell => cell === ''))) {
    winner = "draw"
  }

  return winner
}