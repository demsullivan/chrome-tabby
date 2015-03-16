var managedWindows = [];
var tabGroups = [];
var templates = {};

function init() {
  
  chrome.windows.onRemoved.addListener(function(windowId) {

    var managedWindow = _.find(managedWindows, function(w) { return w.id === windowId; });

    if (managedWindow !== undefined) {

      chrome.windows.get(windowId, {populate: true}, function(window) {

        tabGroups[managedWindow.tabGroup].tabs = getTabMetadata(window.tabs);

        delete managedWindow;
        
      });

    }

  });

  $('.template').each(function(elem) {
    templates[elem.id] = _.template(elem.html());
  });

  $('#save-current-to-new').on('click', saveCurrentToNew);
                                            
}

function getTabMetadata(tabs) {
  return _.map(tabs, function(tab) {
    return {
      title: tab.title,
      url: tab.url,
      icon: tab.favIconUrl,
      index: tab.index
    };
  });
}

function updateDisplay() {
  var tableEl = $('#tab-group-table');
  var tableContent = [];

  _.each(tabGroups, function(group, index) {
    tableContent.push(templates.groupHeading({group: group, index: index}));
    _.each(group.tabs, function(tab, tabIndex) {
      tableContent.push(templates.groupRow({tab: tab}));
    });
  });

  tableEl.html(tableContent);
  $('.group-link').on('click', openGroup);
}

function openGroup() {
  var index = new Number($(this).id.substring(6));
  var group = tabGroups[index];

  var urls = _.map(group.tabs, function(tab) { return tab.url });

  chrome.windows.open({url: urls}, function(window) {
    managedWindows.push({id: window.id});
  });
}

function saveCurrentToNew() {
  chrome.windows.getCurrent({populate: true}, function(window) {
    var groupName = window.prompt("Group name:");
    tabGroups.push({
      name: groupName,
      tabs: getTabMetadata(window.tabs)
    });
    updateDisplay();
  });
}

document.addEventListener('DOMContentLoaded', init);
