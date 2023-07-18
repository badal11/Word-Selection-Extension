document.addEventListener('dblclick', function(event) {
  let word = window.getSelection().toString().trim();
  if (word.length > 0) {
    chrome.runtime.sendMessage({ action: 'writeToFile', word: word });
  }
});
