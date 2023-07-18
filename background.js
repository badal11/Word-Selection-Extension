chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'writeToFile') {
    chrome.storage.local.get({ selectedWords: [] }, function(result) {
      let selectedWords = result.selectedWords;
      selectedWords.push(request.word);
      chrome.storage.local.set({ selectedWords: selectedWords });
    });
  }
});
