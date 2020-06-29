// Declaration of functions that is utilised in popup.js

// Functions to create variables from the values from chrome tab query
// and storage query
// These values are utilised to give the popup.html information on the
// state of the chrome extension and what to show
var assignActive = function(data){
  window.active = data
}
var assignTabActive = function(data){
  window.tabActive = data
}

// A callback function to catch when both of the variables created earlier
// This is as chrome tab query and chrome storage get are asynchronous
// It also serves as a master function that calls the various parts of the init
// process
var initFunction = function(){
  if (window.active && window.tabActive) {
    addListeners();
    display();
  } else {
    setTimeout(initFunction,100)
  }
}

// This is to determine what popup.html should show based on the variables
// created ealier
var display = function(){
  if (window.active === "active"){
    if (window.tabActive == "active") {
      $("#resumethistab,#resumealltabs").toggleClass("hidden")
    } else {
      $("#pausealltabs,#pausethistab,#resumealltabs").toggleClass("hidden")
    }
  } else {
  $("#pausealltabs,#pausethistab,#resumethistab").toggleClass("hidden")
  }
}

// Listeners for the clicking of the various buttons in the browser action
var addListeners = function(){
  // This is for the resume extension in this tab button
  $("#resumethistab").click(function(){
    // A chrome tab query to the active page to tell the content script that the
    // extension has been paused in that page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {command: "tabResume"}, function(response) {
        console.log(response.result);
      });
    });
    window.tabActive = true;
    window.close()
  });
  // This is for the pause extension in this tab button
  $("#pausethistab").click(function(){
    // A chrome tab query to the active page to tell the content script that the
    // extension has been resumed in that page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {command: "tabPause"}, function(response) {
        console.log(response.result);
      });
    });
    window.tabActive = false;
    window.close()
  });

  $("#pausealltabs").click(function(){
    // A chrome tab query to the all pages where the content script is inserted
    // into to tell the various content scripts that the extension has been
    // pasued, essentially putting the extension on pause fully
    chrome.tabs.query({url:"*://old.reddit.com/*"}, function(tabs){
      tabs.forEach(function(tab){
        chrome.tabs.sendMessage(tab.id, {command: "remove"}, function(response) {
          console.log(response.result);
        });
      })
    });
    // A storage sync set that edits the active value pair to paused
    // This is such that if more content scripts are injected during this period
    // they will all be paused
    chrome.storage.sync.set({"active": "paused"}, function(){
      console.log("Spoiler detector is paused")
    });
    window.close()
  });

  $("#resumealltabs").click(function(){
    // A chrome tab query to the all pages where the content script is inserted
    // into to tell the various content scripts that the extension is active
    // This essentially works as an extension resume button
    chrome.tabs.query({url:"*://old.reddit.com/*"}, function(tabs){
      tabs.forEach(function(tab){
        chrome.tabs.sendMessage(tab.id, {command: "init"}, function(response) {
          console.log(response.result);
        });
      })
    });
    // A storage sync set that edits the active value pair to active
    // This is such that content scripts injected will all be active
    chrome.storage.sync.set({"active": "active"}, function(){
      console.log("Spoiler detector is resumed")
    });
    window.close()
  })
}

// Chrome tab query to the content script in the active window to obtain the
// tabactive value
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {command: "checkTabActive"}, function(response) {
    assignTabActive(response.tabActive)
  });
})
// Storage get request to see if the extension is active or not
chrome.storage.sync.get('active', function(data) {
  assignActive(data.active);
});
// init function for the popup html
initFunction()
