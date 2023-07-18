document.addEventListener('DOMContentLoaded', function() {
  displayWords();

  document.getElementById('deleteAllButton').addEventListener('click', function() {
    deleteAllWords();
  });

  document.getElementById('undoButton').addEventListener('click', function() {
    undo();
  });

  document.getElementById('redoButton').addEventListener('click', function() {
    redo();
  });
});

// Maintain an array to keep track of the actions
let actionHistory = [];
// Maintain a pointer to the current action in the history
let historyIndex = -1;

function displayWords() {
  chrome.storage.local.get({ selectedWords: [] }, function(result) {
    let selectedWords = result.selectedWords;
    let wordList = document.getElementById('wordList');
    wordList.innerHTML = '';

    selectedWords.reverse();

    selectedWords.forEach(function(word) {
      let listItem = document.createElement('li');
      listItem.className = 'word-item';

      let deleteBox = document.createElement('div');
      deleteBox.className = 'delete-box';

      let deleteButton = document.createElement('span');
      deleteButton.className = 'delete-button';
      deleteButton.textContent = 'X';
      deleteButton.addEventListener('click', function() {
        deleteWord(word);
      });

      let wordText = document.createElement('span');
      wordText.className = 'word-text';
      wordText.textContent = word;
      wordText.addEventListener('click', function() {
        copyToClipboard(word);
      });

      deleteBox.appendChild(deleteButton);
      listItem.appendChild(deleteBox);
      listItem.appendChild(wordText);
      wordList.appendChild(listItem);
    });
  });
}

function deleteWord(word) {
  chrome.storage.local.get({ selectedWords: [] }, function(result) {
    let selectedWords = result.selectedWords;
    let index = selectedWords.indexOf(word);
    if (index !== -1) {
      // Save the current state for undo/redo
      let currentState = selectedWords.slice();
      actionHistory.push(currentState);
      historyIndex++;

      selectedWords.splice(index, 1);
      chrome.storage.local.set({ selectedWords: selectedWords }, function() {
        displayWords();
        updateUndoRedoButtons();
      });
    }
  });
}

function deleteAllWords() {
  chrome.storage.local.set({ selectedWords: [] }, function() {
    // Save the current state for undo/redo
    let currentState = [];
    actionHistory.push(currentState);
    historyIndex++;

    displayWords();
    updateUndoRedoButtons();
  });
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    let previousState = actionHistory[historyIndex];
    chrome.storage.local.set({ selectedWords: previousState }, function() {
      displayWords();
      updateUndoRedoButtons();
    });
  }
}

function redo() {
  if (historyIndex < actionHistory.length - 1) {
    historyIndex++;
    let nextState = actionHistory[historyIndex];
    chrome.storage.local.set({ selectedWords: nextState }, function() {
      displayWords();
      updateUndoRedoButtons();
    });
  }
}

function updateUndoRedoButtons() {
  let undoButton = document.getElementById('undoButton');
  let redoButton = document.getElementById('redoButton');

  if (historyIndex > 0) {
    undoButton.disabled = false;
  } else {
    undoButton.disabled = true;
  }

  if (historyIndex < actionHistory.length - 1) {
    redoButton.disabled = false;
  } else {
    redoButton.disabled = true;
  }
}
