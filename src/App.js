import React, { useState } from 'react';
import './App.scss';

function App() {
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [matrix, setMatrix] = useState([]);
  const [resultMatrix, setResultMatrix] = useState([]);
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(1);
  const [usedRows, setUsedRows] = useState([]);
  const [usedCols, setUsedCols] = useState([]);
  const [excludedCols, setExcludedCols] = useState([]);
  const [labels, setLabels] = useState([]);

  // Функция для генерации случайной матрицы
  function generateRandomMatrix() {
    const res = [];
    const labels = [' ', 1]; // Пустая метка для пустого столбца слева

    for (let i = 0; i < cols; i++) {
      labels.push(`x${i + 1}`);
    }

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols + 1; j++) {
        const randomValue = Math.floor(Math.random() * 11);
        row.push(randomValue);
      }
      res.push(row);
    }

    setMatrix(res);
    setResultMatrix(Array.from({ length: rows }, () => Array(cols + 1).fill(0))); // Maintain same structure
    setUsedRows([]);
    setUsedCols([]);
    setExcludedCols([]);
    setLabels(labels); // Устанавливаем метки
  }

  const resolvingElement = matrix[selectedRow]?.[selectedCol];

  function jordan(matrix, resolvingElement) {
    let resultMatrix = matrix.map(row => [...row]);

    if (resolvingElement !== 0) {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (!excludedCols.includes(j)) {
            resultMatrix[i][j] = (
              (matrix[i][j] * resolvingElement - matrix[selectedRow][j] * (matrix[i][selectedCol])) /
              resolvingElement
            ).toFixed(2);
          }
          resultMatrix[selectedRow][selectedCol] = (1 / resolvingElement).toFixed(2);
          if (i === selectedRow) {
            resultMatrix[i][j] = (matrix[i][j] / resolvingElement).toFixed(2);
          }
          if (j === selectedCol) {
            resultMatrix[i][j] = ((matrix[i][j] / resolvingElement) * -1).toFixed(2);
          }
        }
      }
      setResultMatrix(resultMatrix);
    } else {
      alert('Разрешающий элемент равен нулю');
    }
  }

  function applyResultMatrix() {
    const newMatrix = matrix.map(row => row.filter((_, index) => index !== selectedCol));
    const newExcludedCols = [...excludedCols, selectedCol];
    const newLabels = labels.filter((_, index) => index !== selectedCol); // Убираем метку из labels

    // Maintain the same number of rows and columns in the result matrix
    const updatedResultMatrix = resultMatrix.map((row, rowIndex) => {
      const updatedRow = row.filter((_, index) => index !== selectedCol);
      return updatedRow.length < cols + 1 ? [...updatedRow, 0] : updatedRow; // Ensure it has the same number of columns
    });

    setMatrix(newMatrix);
    setResultMatrix(updatedResultMatrix);
    setUsedRows([...usedRows, selectedRow]);
    setUsedCols([...usedCols, selectedCol]);
    setExcludedCols(newExcludedCols);
    setLabels(newLabels);

    if (selectedCol >= newMatrix[0].length) {
      setSelectedCol(0);
    }
  }

  const renderMatrix = (matrix) => {
    return (
      <ul className='App__matrix'>
        <li>
          {labels.map((label, index) => (
            !excludedCols.includes(index) && (
              <span key={index}>{label}</span> // Заголовки столбцов
            )
          ))}
        </li>
        {matrix.map((row, rowIndex) => (
          <li key={rowIndex}>
            {/* Добавляем пустой столбец слева */}
            <span className="empty-cell"> </span> 
            {row.map((col, colIndex) => {
              const isResolvingElement = rowIndex === selectedRow && colIndex === selectedCol;
              return (
                !excludedCols.includes(colIndex) && (
                  <span
                    key={colIndex}
                    className={isResolvingElement ? 'resolving-element' : ''}
                    style={isResolvingElement ? { backgroundColor: 'yellow' } : {}}
                  >
                    {col}
                  </span>
                )
              );
            })}
          </li>
        ))}
      </ul>
    );
  };

  const availableRows = Array.from({ length: rows }, (_, index) => (
    <option key={index} value={index} disabled={usedRows.includes(index)}>
      {index + 1}
    </option>
  ));

  const availableCols = Array.from({ length: cols }, (_, index) => (
    <option key={index} value={index + 1} disabled={usedCols.includes(index)}>
      {index + 1}
    </option>
  ));

  return (
    <div className="App">
      <div className='App__container'>
        <div className='App__info'>
          <div>
            <label>
              Количество строк:
              <input
                type="number"
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                min="1"
              />
            </label>
          </div>
          <div>
            <label>
              Количество столбцов:
              <input
                type="number"
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                min="1"
              />
            </label>
          </div>
          {matrix.length > 0 && (
            <>
              <div>
                <label>
                  Выберите строку:
                  <select value={selectedRow} onChange={(e) => setSelectedRow(Number(e.target.value))}>
                    {availableRows}
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Выберите столбец:
                  <select value={selectedCol} onChange={(e) => setSelectedCol(Number(e.target.value))}>
                    {availableCols}
                  </select>
                </label>
              </div>
              <span>
                Разрешающий элемент: {resolvingElement}
              </span>
            </>
          )}
        </div>

        {matrix.length > 0 && (
          <div className='Container__matrices'>
            <div className='startMatrix'>
              <span>Начальная матрица</span>
              {renderMatrix(matrix)}
            </div>
            <div className='resultMatrix'>
              <span>Конечная матрица</span>
              {renderMatrix(resultMatrix)}
            </div>
          </div>
        )}

        <div className='Container__button'>
          <button onClick={generateRandomMatrix}>Сгенерировать матрицу</button>
          <button onClick={() => jordan(matrix, resolvingElement)}>Произвести расчеты</button>
          <button onClick={applyResultMatrix}>Применить результирующую матрицу</button>
          <button onClick={() => { 
            setMatrix([]); 
            setResultMatrix([]); 
            setRows(0); 
            setCols(0); 
            setExcludedCols([]);
            setLabels([]);
          }}>
            Обнулить матрицы
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
