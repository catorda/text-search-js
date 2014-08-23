/*
NotionTab is a JavaScript tab control (yea, another one).
http:// notiontab.org

todo : put some examples here so it's accessible to the developers.

 */


NotionTab = {
    "prefix" : "notion",
    "delimiter" : "-",
    "tabSelectedClasses" : "tab-selected",
    "tabUnselectedClasses" : "tab-unselected",
    "ignore" : -1,
    "debug" : 0,
    "info" : 1,
    "warn" : 2,
    "error" : 3,
    "fatal" : 4,
    "messageLevel" : 0,
    "message" : function(level, scope, msg) {
        if (level >= NotionTab.messageLevel) {
            alert(scope + ': ' + msg);
        }
    },
    "groupId" : function(group) {
        return NotionTab.prefix + NotionTab.delimiter + group;
    },
    "tabId" : function(group, name) {
        return NotionTab.prefix + NotionTab.delimiter + group + NotionTab.delimiter + name
    },
    "tabsId" : function(group) {
        return NotionTab.prefix + NotionTab.delimiter + group + NotionTab.delimiter + 'tabs';
    },
    "tabIconId" : function(group, name) {
    	return NotionTab.tabId(group, name) + NotionTab.delimiter + 'icon';
    },
    "tabLabelId" : function(group, name) {
    	return NotionTab.tabId(group, name) + NotionTab.delimiter + 'label';
    },
    "tabContentId" : function(group, name) {
        return NotionTab.tabId(group, name) + NotionTab.delimiter + 'content';
    },
    "tabContentsId" : function(group) {
        return NotionTab.groupId(group) + NotionTab.delimiter + 'contents';
    },
    "callback" : {},
    "addTabCallback" : function(data) {
        var group = data.group;
        var tabName = data.tabName;
        var on = data.on;
        var func = data.func;
        var key = group + NotionTab.delimiter + tabName + NotionTab.delimiter + on;
        NotionTab.callback[key] = func;
    },
    "fireTabCallback" : function(data) {
        var group = data.group;
        var tabName = data.tabName;
        var on = data.on;
        var callOn = data.callOn;
        var key = group + NotionTab.delimiter + tabName + NotionTab.delimiter + on;
        var func = NotionTab.callback[key];
        if (func) {
            if (callOn) {
                func.call(callOn)
            }
        }
    },
    "add" : function(data) {
        var ntab = NotionTab;
        if (!data) {
            ntab.message(ntab.debug, 'add', + 'no data');
            return false;
        }
        var parent = data.parent;
        if (!parent) {
            ntab.message(ntab.debug, 'add', 'no parent id provided.');
            return false;
        }
        var parentd = document.getElementById(parent);
        if (!parentd) {
            ntab.message(ntab.debug, 'add', 'no parent element by id ' + parent);
            return false;
        }
        var group = data.group;
        var groupId = ntab.groupId(group);

        var groupUlDiv = document.createElement('div');
        var groupUl = document.createElement('ul');
        var groupContent = document.createElement('div');

        groupUlDiv.id = ntab.tabsId(group)
        groupUlDiv.group = group;
        groupUl.id = groupId;
        groupContent.id = ntab.tabContentsId(group);
        groupContent.group = group;

        var orientation = data.orientation;
        if (orientation) {
            if (orientation != 'bottom') {
                orientation = 'top'
            }
        } else {
            orientation = 'top';
        }

        groupUlDiv.appendChild(groupUl);

        if (orientation != 'bottom') {
            parentd.appendChild(groupUlDiv);
            parentd.appendChild(groupContent);
        } else {
            parentd.appendChild(groupContent);
            parentd.appendChild(groupUlDiv);
        }

        $('#' + groupUl.id).addClass('notion-tabs');
        $('#' + groupUlDiv.id ).addClass('notion-tabs-bar');
        $('#' + groupContent.id).addClass('notion-tab-contents');


        var classes = data.classes;
        var tabs = data.tab;
        ntab.group[group] = data;
        for (var tabName in tabs) {
        	if (tabName) {
                tabs[tabName].group = group;
                ntab.addTab(tabs[tabName]);
        	}
        }
    },
    "addTab" : function(data) {
        var ntab = NotionTab;
        var doc = document;
        if (!data) {
            return false;
        }

        var group = data.group;
        if (!group) {
            return false;
        }
        var groupo = ntab.group[group];
        if (!groupo) {
            return false;
        }

        var tabName = data.name;
        var tabLabel = data.label;
        var content = data.content;
        var initFunc = data.onInit;
        var selectFunc = data.onSelect;
        var exitFunc = data.onExit;
        var closeFunc = data.onClose;
        var closeable = data.closeable;
        var closeIcon = data.closeIcon;
        var tabIcon = data.tabIcon;
        var iconFunc = data.tabIconClick;
        var tip = data.labelTooltip;
        var index = data.index;
        var category = data.category;
        var cluster = data.cluster;


        var tabId = ntab.tabId(group, tabName);
        var contentId = ntab.tabContentId(group, tabName);
        var tabGroupId = ntab.groupId(group);
        var contentGroupId = ntab.tabContentsId(group);

        data.tabId = tabId;
        data.tabContentId = contentId;

        var tabList = doc.getElementById(tabGroupId);

        // callback funtions
        if (initFunc) {
            ntab.addTabCallback({
                "group" : group,
                "tabName" : tabName,
                "on" : "init",
                "func" : initFunc
            });
        }
        if (exitFunc) {
            ntab.addTabCallback({
                "group" : group,
                "tabName" : tabName,
                "on" : "exit",
                "func" : exitFunc
            });
        }
        if (selectFunc) {
            ntab.addTabCallback({
                "group" : group,
                "tabName" : tabName,
                "on" : "select",
                "func" : selectFunc
            });
        }
        if (closeFunc) {
            ntab.addTabCallback({
                "group" : group,
                "tabName" : tabName,
                "on" : "close",
                "func" : closeFunc
            });
        }

        // tabs
        var tabItem = doc.createElement('li');
        tabItem.id = tabId;
        tabItem.group = group;
        tabItem.tabName = tabName;
        if (category) {
            tabItem.category = category;
        }
        if (cluster) {
            tabItem.cluster = cluster;
        }
        tabList.appendChild(tabItem);

        $('#' + tabId).addClass('notion-tab');
        $('#' + tabId).addClass('notion-tab-unselected');

        // tab icon
        if (tabIcon) {
            var ticon = doc.createElement('img');
            ticon.id = ntab.tabIconId(group, tabName);
            ticon.src = tabIcon;
            ticon.group = group;
            ticon.tabName = tabName;
            tabItem.appendChild(ticon);

        	var tabIconHover = data.tabIconHover;
            if (tabIconHover) {
            	ticon.hoverIcon = tabIconHover;
            	ticon.icon = tabIcon;
            	$('#' + ticon.id).mouseenter(function() {
            		// alert('menter');
            		ntab.mouseOver(this.id)
            	});
            	$('#' + ticon.id).mouseleave(function() {
            		// alert('mleave');
            		ntab.mouseOut(this.id)
            	});
            }

            if (iconFunc) {
                 $('#' + ticon.id).click(iconFunc);
            }
        }

        // tab label
        var tabSpan = doc.createElement('span');
        tabSpan.id = ntab.tabLabelId(group, tabName);
        tabSpan.group = group;
        tabSpan.tabName = tabName;
        tabItem.appendChild(tabSpan);
        // $('#' + tabSpan.id).addClass('notion-tab');
        $('#' + tabSpan.id).addClass('notion-tab-label');
        $('#' + tabSpan.id).click(function() { ntab.selectTab(group, tabName); return false;});
        if (tabLabel) {
            tabSpan.innerHTML = tabLabel;
        }
        if (tip) {
            tabSpan.alt = tip;
        }

        // close
        if (closeable) {
            var closeBtnId = tabId + '-close';
            var closeSpan = doc.createElement('span');
            closeSpan.id = closeBtnId + '-span';
            closeSpan.group = group;
            closeSpan.tabName = tabName;
            tabItem.appendChild(closeSpan);
            $('#' + closeSpan.id).click(function() { ntab.closeTabAndGoBack(group, tabName); return false;});
            if (closeIcon) {
                var closeBtn = doc.createElement('img');
                closeBtn.id = closeBtnId;
                closeBtn.src = closeIcon;
                closeBtn.group = group;
                closeBtn.tabName = tabName;
                closeSpan.appendChild(closeBtn);
            	var closeIconHover = data.closeIconHover;
                if (closeIconHover) {
                	closeBtn.hoverIcon = closeIconHover;
                	closeBtn.icon = closeIcon;
                	$('#' + closeBtn.id).mouseenter(function() {
                		ntab.mouseOver(this.id)
                	});
                	$('#' + closeBtn.id).mouseleave(function() {
                		ntab.mouseOut(this.id)
                	});
                }
            } else {
                var closeBtnSpan = doc.createElement('span');
                closeBtnSpan.id = closeBtnId + '-span';
                closeBtnSpan.group = group;
                closeBtnSpan.tabName = tabName;
                $('#' + closeBtnSpan.id).addClass('notion-close-button-text');
                closeBtnSpan.innerHTML = '&nbsp;x&nbsp;';
                closeSpan.appendChild(closeBtnSpan);
            }
        }

        // content
        var contentsDiv = doc.getElementById(contentGroupId);
        if (contentsDiv) {
            var contentDiv = doc.createElement('div');
            contentDiv.id = contentId;
            contentDiv.group = group;
            contentDiv.tabName = tabName;
            contentsDiv.appendChild(contentDiv);
            $('#' + contentDiv.id).addClass('notion-tab-content');;
            $('#' + contentDiv.id).addClass('notion-tab-content-unselected') ;
            if (content) {
                contentDiv.innerHTML = content;
            }
        }

        if (initFunc) {
            initFunc.call(tabItem);
        }

        var tabs = groupo.tab[name];
        if (!tabs) {
            groupo.tab[name] = {};
        }
        groupo.tab[name] = data;

        if (index) {
            if (index < 0) {
                index = 0;
            }
            if (index >= ntab.getTabCount(group)) {
                index = -1;
            }
            if (index >= 0) {
                ntab.moveTabTo(group, tabName, index);
            }
        }
        return true;
    },
    "selectTab" : function(group, tabName) {
        var ntab = NotionTab;
        var tabId = ntab.tabId(group, tabName);
        // alert('selectTab: ' + tabId);
        if ($('#' + tabId).hasClass('notion-tab-selected')) {
            return;
        }
        var currentTabId = ntab.getCurrentTabId(group);
        if (currentTabId) {
            var prevTabId = currentTabId;
            if (prevTabId == tabId) {
                // alert('staying on same tab; should never get here due to the check for selected above');
            } else {
                var ptab = document.getElementById(prevTabId);
                if (ptab) {
                    ntab.fireTabCallback({
                        "group" : ptab.group,
                        "tabName" : ptab.tabName,
                        "on" : "exit",
                        "callOn" : ptab
                    });
                }
            }
        }

        var contentId = ntab.tabContentId(group, tabName);
        var tabGroupId = ntab.groupId(group);
        var contentGroupId = ntab.tabContentsId(group);

        var tab = document.getElementById(tabId);
        var content = document.getElementById(contentId);
        var tabGroup = document.getElementById(tabGroupId);
        var contentGroup = document.getElementById(contentGroupId);

        ntab.fireTabCallback({
           "group" : group,
            "tabName" : tabName,
            "on" : "select",
            "callOn" : tab
        });

        var prefix = tabGroupId + ntab.delimiter;
        var orient = ntab.group[group].orientation;
        if (!orient) {
            orient = 'top';
        }
        $('.notion-tab').each (function(index) {
            var ndx =  this.id.indexOf(prefix);
            // alert('selectTab: ndx: ' + ndx + '; prefix: ' + prefix + ' ?= ' + this.id);
            if (ndx === -1) {
                // alert('selectTab: no tab: ' + this.id);
            } else {
                // alert('selectTab: tab: ' + this.id + " ?= " + tab.id);
                if (this.id == tab.id) {
                    $('#' + this.id).removeClass('notion-tab-unselected');
                    $('#' + this.id).removeClass('notion-tab-unselected-' + orient);
                    $('#' + this.id).addClass('notion-tab-selected-' + orient);
                    $('#' + this.id).addClass('notion-tab-selected');
                    $('#' + this.id + '-label').removeClass('notion-tab-label-unselected');
                    $('#' + this.id + '-label').addClass('notion-tab-label-selected');
                    $('#' + this.id + '-content').removeClass('notion-tab-content-unselected');
                    $('#' + this.id + '-content').addClass('notion-tab-content-selected');
                } else {
                    $('#' + this.id).removeClass('notion-tab-selected');
                    $('#' + this.id).removeClass('notion-tab-selected-' + orient);
                    $('#' + this.id).addClass('notion-tab-unselected');
                    $('#' + this.id).addClass('notion-tab-unselected-' + orient);
                    $('#' + this.id + '-label').removeClass('notion-tab-label-selected');
                    $('#' + this.id + '-label').addClass('notion-tab-label-unselected');
                    $('#' + this.id + '-content').removeClass('notion-tab-content-selected');
                    $('#' + this.id + '-content').addClass('notion-tab-content-unselected');
                }
            }
            ntab.group[group].selectedTabId = tab.id;
        });
    },
    "getCurrentTabId" : function(group) {
        var groupo = NotionTab.group[group];
        if (groupo) {
            return groupo.selectedTabId;
        }
        return undefined;
    },
    "closeTab" : function(group, tabName) {
        var ntab = NotionTab;
        var tab = document.getElementById(ntab.tabId(group, tabName));
        if (tab) {
            ntab.fireTabCallback({
               "group" : group,
                "tabName" : tabName,
                "on" : "close",
                "callOn" : tab
            });
            var contentTabId = ntab.tabContentId(group, tabName);
            var content = document.getElementById(contentTabId);
            if (content) {
                content.parentNode.removeChild(content);
            }
            tab.parentNode.removeChild(tab);
            var prefix = ntab.groupId(group) + ntab.delimiter;
            var alreadySelected = false;
            $('.notion-tab-selected').each (function (index) {
                if (!alreadySelected) {
                    if (this.id.indexOf(prefix) == 0) {
                        alreadySelected = true;
                    }
                }
            });
            if (!alreadySelected) {
                ntab.selectTabDefault(group);
            }
            var tabCount = ntab.getTabCount(group);

            if (tabCount == 0) {
                // todo : remove blocks for tab ?
            }
        }
    },
    "closeTabAndGoBack" : function(group, tabName) {
        var ntab = NotionTab;
        var tabId = ntab.tabId(group, tabName);
        var tab = document.getElementById(tabId);
        if (tab) {
            var groupId = ntab.groupId(group);
            ntab.fireTabCallback({
                "group" : group,
                "tabName" : tabName,
                "on" : "close",
                "callOn" : tab
            });
            var alreadySelected = false;
            $('#' + groupId).children('.notion-tab-selected').each (function () {
                if (!alreadySelected) {
                    if (this.id != tabId) {
                        alreadySelected = true;
                    }
                }
            });
            if (!alreadySelected) {
                ntab.selectTabBackFrom(group, tabName);
            }

            // remove tab li and content div
            tab.parentNode.removeChild(tab);
            var contentTabId = ntab.tabContentId(group, tabName);
            var content = document.getElementById(contentTabId);
            if (content) {
                content.parentNode.removeChild(content);
            }

//            var tabCount = ntab.getTabCount(group);
//            if (tabCount == 0) {
//                // todo : remove blocks for tab ?
//            }

        }
    },
    "selectTabDefault" : function(group) {
        var ntab = NotionTab;
        var prefix = ntab.groupId(group) + ntab.delimiter;
        var found = false;
        var groupId = ntab.groupId(group);

        $('#' + groupId).children('.notion-tab-unselected').each (function () {
            if (!found) {
                if (this.id.indexOf(prefix) == 0) {
                    ntab.selectTabById(this.id);
                    found = true;
                }
            }
        });
    },
    "selectTabBackFrom" : function(group, markTabName) {
        var ntab = NotionTab;

        var prevId = null;
        var selectNext = false;
        var found = false;

        var groupId = ntab.groupId(group);
        var markTabId = ntab.tabId(group, markTabName);

        // alert('selectTabBackFrom(' + group + ', ' + markTabName + '): groupId: ' + groupId + '; markTabId: ' + markTabId);
        $('#' + groupId).children('.notion-tab').each (function () {
            if (!found) {
                // alert('selectTabBackFrom: this.id: ' + this.id + ' ?= ' + markTabId);
                if (this.id === markTabId) {
                    if (prevId) {
                        ntab.selectTabById(prevId);
                        found = true;
                    } else {
                        // first tab is closing, select next tab (if any)
                        selectNext = true;
                    }
                } else if (selectNext) {
                    ntab.selectTabById(this.id);
                    found = true;
                }
                prevId = this.id;
            }
        });
    },
    "moveTab" : function(group, movingTabName, where, markTabName) {
        var ntab = NotionTab;

        var prevId = null;
        var selectNext = false;
        var found = false;

        var groupId = ntab.groupId(group);
        var markTabId = ntab.tabId(group, markTabName);
        var movingTabId = ntab.tabId(group, movingTabName);

        var markTab = document.getElementById(markTabId);
        var movingTab = document.getElementById(movingTabId);

        if (!markTab || !movingTab) {
            alert('either mark or moving tab element does not exists.');
            return;
        }

        var tabUl = document.getElementById(groupId);

        if (!where) {
            where = 'before';
        }
        if (where == 'after') {
            tabUl.insertBefore(movingTab, markTab.nextSibling);
        } else {
            tabUl.insertBefore(movingTab, markTab);
        }
    },
    "moveTabTo" : function(group, tabName, index) {
        var tabCount = NotionTab.getTabCount(group);
        if (tabCount == 0) {
            return;
        }
        if (index < 0) {
            index = 0;
        }

        var tabsId = NotionTab.groupId(group);
        var tabId = NotionTab.tabId(group, tabName);
        var tabs = document.getElementById(tabsId);
        var tab = document.getElementById(tabId);

        if (index >= (tabCount - 1)) {
            tabs.removeChild(tab);
            tabs.appendChild(tab);
            return;
        }

        var ndx = 0;
        var moved = false;
        $('#' + tabsId).children('li').each ( function() {
            if (!moved) {
                if (ndx == index) {
                    if (tab != this) {
                        tabs.insertBefore(tab, this);
                    }
                    moved = true;
                } else if (tab == this) {
                    index += 1;
                }
                ndx += 1;
            }
        });


    },
    "selectTabById" : function(id) {
        // alert('selectTabById: ' + id);
        var tab = document.getElementById(id);
        if (tab) {
            NotionTab.selectTab(tab.group, tab.tabName);
        }
    },
    "setTabContent" : function(group, tabName, content) {
        var contentId = NotionTab.tabContentId(group, tabName);
        var tabContent = document.getElementById(contentId);
        if (tabContent) {
        	tabContent.innerHTML = content;
        } else {
        	alert('setTabContent: failed to be contentElement');
        }
    },
    "setTabContentByDiv" : function(group, tabName, divId) {
        var contentId = NotionTab.tabContentId(group, tabName);
        var divElement = document.getElementById(divId);
        var tabContent = document.getElementById(contentId);
        if (tabContent && divElement) {
        	divElement.parentNode.removeChild(divElement);
        	tabContent.innerHTML = '';
        	tabContent.appendChild(divElement);
        }
    },
    "getTabCount" : function(group) {
        var tabsId = NotionTab.groupId(group);
        return $('#' + tabsId).children('li').length;
    },
    "setTabIcon" : function(group, tabName, tabIcon) {
    	var tabElement = document.getElementById(NotionTab.tabIconId(group, tabName));
    	if (tabElement) {
    		tabElement.src = tabIcon;
    	}
    },
    "setTabLabel" : function(group, tabName, label) {
    	var tabElement = document.getElementById(NotionTab.tabLabelId(group, tabName));
    	if (tabElement) {
    		tabElement.innerHTML = label;
    	}
    },
    "getSelectedIndex" : function(group, id) {
        var prefix = NotionTab.groupId(group) + NotionTab.delimiter;
        var found = false;
        var count = 0;
        // alert('getSelectedIndex: id: ' + id + '; group: ' + group + '; prefix: ' + prefix);
        $('.notion-tab').each (function (index) {
            if (!found) {
                if (this.id.indexOf(prefix) == 0) {
                    if ($('#' + this.id).hasClass('notion-tab-selected')) {
                        found = true;
                    } else {
                        count += 1;
                    }
                }
            }
        });
        if (found) {
            return count;
        }
    },
    "mouseOver" : function(id) {
    	var element = document.getElementById(id);
    	if (element) {
    		if (element.hoverIcon) {
    			element.src = element.hoverIcon;
    		}
    	}
    },
    "mouseOut" : function(id) {
    	var element = document.getElementById(id);
    	if (element) {
    		if (element.icon) {
    			element.src = element.icon;
    		}
    	}
    },
    "group" : {}
}
