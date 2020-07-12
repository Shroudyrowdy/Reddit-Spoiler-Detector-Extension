// Background script
chrome.runtime.onInstalled.addListener(function() {
  // This is such that spoiler detection is active on install
  chrome.storage.sync.set({active: "active"}, function() {
    console.log("Spoiler Detection is on");
  });
  // This makes the browser action only show up on old.reddit pages
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'old.reddit.com'},
      })
      ],
          actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
})
