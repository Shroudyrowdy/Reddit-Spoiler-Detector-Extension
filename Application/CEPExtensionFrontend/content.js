// The content scripts that runs on old.reddit pages to detect Spoilers

//Const Variables for Api Fetch Call
//Global variable for the Api url to be callled often
const fetchUrl = "http://127.0.0.1:5000/apitest";
//Just to be clean while setting up headers
const fetchHeaders = new Headers({
  'Content-type': 'application/json',
});
//Setting up a template for fetch init
const fetchInitTemplate = {
  method: 'POST',
  headers: fetchHeaders,
}

// Observer that activates when a more comments button is pressed so that when the
// additional replies are loaded, the checker is triggered
// I used this mutation observer as I heard its the best for detecting mutations
var observer = new MutationObserver(function (mutations) {
  docScan();
  observer.disconnect()
});

// Config info for the observer.
var config = {
  childList: true,
  subtree: true
};

//To pass the information from the comments to the api
var reqApi = function(){
  // To find comments that have not been checked yet
  $('.entry.unvoted').find("div.usertext-body").not(".checking, .checked").each(function(index, element){
    $(this).addClass("checking");
    // Constructing fetch object
    var fetchInit = Object.assign({},fetchInitTemplate);
    const data = {"ref":[1], "text":$(this).text()};
    fetchInit.body = JSON.stringify(data);
    // Fetch promise that will handle what needs to be done
    return fetch(fetchUrl,fetchInit)
      .then(res => res.json())
      .then(res => res[0].spoilerChance)
      .then(res => {
        if(res > 0.4){
          // some html to append to comment if it is flagged as a spoiler
          var template = $('#spoilerAlertTemplate').html();
          var item = $(template).clone();
          var spoilerChance = (res*100).toFixed(1)
          $(item).find('#spoilerChance').html(`Spoiler Extension thinks that there is a ${spoilerChance}% that it is a spoiler`)
          $(this).find("div.md").addClass("blur");
          $(this).prepend($(item));
          // jQuery code for appended html
          $(".unhidebutton").click(function(){
            $(this).parent().next().removeClass("blur");
            $(this).replaceWith('<p class = "no margin smallfonts">Text has been unhidden.</p>')
          });
        }
        else {
          // some html to append to comment if it is not a spoiler
          var template = $('#alrightMsgTemplate').html();
          var item = $(template).clone();
          $(this).prepend($(item));
        };
        // Change class from checking to checked
        // Theres no use for this for the user, it just serves as a debugging tool
        $(this).removeClass("checking").addClass("checked")
      })
  })
}

//Just an overhang function for the detecting of new comments and also assinging
// of listeners for morecomment buttons
var docScan = function(){
    reqApi();
    $(".morecomments").click(moreCommentsClickFuction);
}

// Part of the init to append the necessary css and html for extension
var htmlAppends=function(){
    $( "<style> .blur {filter: blur(5px); user-select: none;} .nomargin {margin: 0;} .smallfonts {font-size: x-small;} .unhidebutton:hover {text-decoration: underline; color: blue;} .spoilerAlert {background-color: lightgrey; padding: 6px; border-style: solid; border-width: thin; border-color: red;} .alrightMsg {background-color: lightgrey; padding: 3px; border-style: solid; border-width: thin; border-color: lime;} </style>" ).appendTo( "head" );
    $( '<template id = "spoilerAlertTemplate"><div class = "spoilerAlert"><p class = "nomargin">The following content has been hidden.</p><p class = "smallfonts nomargin" id = "spoilerChance"></p><p class = "nomargin unhidebutton smallfonts">Click on this to unhide the comment</p></div></template>' ).appendTo( "body" );
    $( '<template id = "alrightMsgTemplate"><div class = "alrightMsg"><p class = "nomargin">The following content is not a spoiler according to spoiler detector.</p></div></template>' ).appendTo( "body" );
}

// callback function for clickign on more comments buttons
var moreCommentsClickFuction = function(){
  observer.observe(window.observearea, config);
}

// remove listeners to pause the extension when needed
var removeListeners=function(){
    $('.morecomments').unbind('click');
    observer.disconnect()
}

// message listener to control whether the detection of spoilers is active
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.command === "checkTabActive"){
    sendResponse({tabActive: window.tabActive});
  }else if(request.command === 'init'){
    docScan();
    sendResponse({result: "success"});
  }else if (request.command === "remove"){
    removeListeners();
    sendResponse({result: "success"});
  }else if (request.command === "tabResume"){
    docScan();
    window.tabActive = "active"
  } else if (request.command === "tabPause") {
    removeListeners();
    window.tabActive = "paused"
  }
});

//on init perform based on chrome storage value
window.onload=function(){
  window.observearea = document.querySelector('div.commentarea');
  htmlAppends()
  chrome.storage.sync.get('active', function(data) {
    if(data.active === "active"){
      docScan()
    }else{
    }
  });
  window.tabActive = "active"
}
