import { Injectable, EventEmitter } from '@angular/core';
@Injectable({
  providedIn: 'root'
})


export class AppUtilServices {


  constructor() { }

  codeCopyFunc(thisElement) {

    var stringVal = thisElement.target.nextElementSibling.innerHTML;
    thisElement.target.nextElementSibling.className += " " + 'ds_selectedTxt';
    var whitespace = stringVal.replace(/ +(?= )/g, "");
    var stringrep = whitespace.replace(/&lt;/g, "<");
    var stringrep2 = stringrep.replace(/&gt;/g, ">");

    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = stringrep2;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

  }



  // ripple color
  ripcolor = "rgba(134,38,195,0.15)"


  //showmore DSA_showless

  showMore(thisElement) {
    if (thisElement.target.classList.contains('down-arw-icon')) {
      thisElement.target.closest(".collapseCtr").querySelector('.collapseCnt').classList.add('DSA_showmore');
      thisElement.target.closest(".collapseCtr").querySelector('.collapseCnt').classList.remove('DSA_showless');
      thisElement.target.classList.add('up-arw-icon');
      thisElement.target.classList.remove('down-arw-icon')
    }
    else {
      thisElement.target.closest(".collapseCtr").querySelector('.collapseCnt').classList.add('DSA_showless');
      thisElement.target.closest(".collapseCtr").querySelector('.collapseCnt').classList.remove('DSA_showmore');
      thisElement.target.classList.add('down-arw-icon');
      thisElement.target.classList.remove('up-arw-icon')
    }
  }

  //toggle class
  chip_toggleClick(thisElement) {
    if (thisElement.target.classList.contains('active')) {
      thisElement.target.classList.remove('active');
    }
    else {
      thisElement.target.classList.add('active');
    }
  }

  //toggle class

  chipIcon_toggleSelect(thisElement) {
    if (thisElement.target.classList.contains('DSA_choiseChip')) {
      thisElement = thisElement.target
    }
    else {
      thisElement = thisElement.target.closest('.DSA_choiseChip');
    }
    if (thisElement.querySelector(".DSA_selectionIcon").closest('.DSA_choiseChip').classList.contains('active')) {
      thisElement.querySelector(".DSA_selectionIcon").closest('.DSA_choiseChip').classList.remove('active');
    } else {
      thisElement.querySelector(".DSA_selectionIcon").closest('.DSA_choiseChip').classList.add('active');
    }
    /* if( thisElement.querySelector(".DSA_selectionIcon").classList.contains('icon-process-complete')){
      thisElement.querySelector(".DSA_selectionIcon").closest('.DSA_choiseChip').classList.remove('active');
      thisElement.querySelector(".DSA_selectionIcon").classList.remove('icon-process-complete');
      thisElement.querySelector(".DSA_selectionIcon").classList.remove('purple');
    }
    else{
      thisElement.querySelector(".DSA_selectionIcon").closest('.DSA_choiseChip').classList.add('active');
      thisElement.querySelector(".DSA_selectionIcon").classList.add('icon-process-complete');
      thisElement.querySelector(".DSA_selectionIcon").classList.add('purple');
    } */
  }

  //chip Close button
  chip_removeParent(closebtn) {
    closebtn.target.parentNode.remove();
  }

  expandCollapseMenu(eventPanel) {
    // eventPanel.target.closest('.dc_TreeulClass').querySelector('.collapseCnt')
    if (eventPanel.target.nextSibling.style.display == "block" || eventPanel.target.nextSibling.style.display == '') {
      eventPanel.target.nextSibling.style.display = 'none';
    }
    else {
      eventPanel.target.nextSibling.style.display = 'block';
    }
  }

  lefttwoLevelMenu(thisElement) {
    var listItems = document.querySelectorAll('.dc_ToplevelMenu a')
    listItems.forEach(function (eachList) {
      eachList.classList.remove('active');
    });

    thisElement.target.classList.add('active');
    if (thisElement.target.classList.contains('dc_secondlevelLI')) {
      thisElement.target.closest('li').querySelector('.dc_secondlevelUL li:first-child a').classList.add('active');
    }
    else if (thisElement.target.closest('ul').classList.contains('dc_secondlevelUL')) {
      thisElement.target.closest('ul').previousSibling.classList.add('active');
    }

    if (!thisElement.target.closest('ul').classList.contains('dc_secondlevelUL')) {
      var allmenus = thisElement.target.closest('.dc_ToplevelMenu').querySelectorAll('.dc_TreeulClass');
      allmenus.forEach(function (eachMenu) {
        eachMenu.classList.add('d-none');
      });
      if (thisElement.target.nextSibling) {
        thisElement.target.nextSibling.classList.remove('d-none');
      }

    }
  }

  /* hamburdermenu */
  DSA_mainHamburger_Click(eventObj) {
    eventObj.stopPropagation();
    if (document.getElementById('mainNav').classList.contains("DSA_navHide")) {
      document.getElementById('mainNav').classList.remove('DSA_navHide');
      document.body.style.overflow = 'auto';
    }
    else {
      document.getElementById('mainNav').classList.add('DSA_navHide');
      document.body.style.overflow = 'hidden';
    }
  }
  /* lft rmenu */
  DSA_mainMenu_Click() {
    if (document.getElementById('mainleftNav').classList.contains("DSA_navHideMenu")) {
      document.getElementById('mainleftNav').classList.remove('DSA_navHideMenu');
      document.body.style.overflow = 'auto';
    }
    else {
      document.getElementById('mainleftNav').classList.add('DSA_navHideMenu');
      document.body.style.overflow = 'hidden';
    }
  }
  /* mobile search */
  DSA_mainSearch_Click() {
    if (document.getElementById('mainSearch').classList.contains("DSA_navHideSrch")) {
      document.getElementById('mainHeader').style.display = "none";
      document.getElementById('mainSearch').classList.remove('DSA_navHideSrch');
    }
    else {
      document.getElementById('mainHeader').style.display = "block";
      document.getElementById('mainSearch').classList.add('DSA_navHideSrch');
    }
  }

  /*floatingright panel*/

  DSA_toggleRightpanel_Click() {
    if (document.getElementById('coloumnthreeFLoating').classList.contains("DSA_rightPanelHide")) {
      document.getElementById('coloumnthreeFLoating').classList.remove('DSA_rightPanelHide');
    }
    else {
      document.getElementById('coloumnthreeFLoating').classList.add('DSA_rightPanelHide');
      document.querySelectorAll('.DSA_RightUtil li').forEach(function (eachList) {
        eachList.classList.remove('DSA_active');
      });

    }
  }

  fullView_Click() {
    if (document.querySelector('.designView').classList.contains("DSA_fullview")) {
      document.querySelector('.designView').classList.remove('DSA_fullview');
      document.getElementById('ds_minimize').style.display = "none";
    }
    else {
      document.querySelector('.designView').classList.add('DSA_fullview');
      document.getElementById('ds_minimize').style.display = "block";
    }
  }

  /* content area height */
  middleHeight() {
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    var footerHeight = 40;
    var headerOuterHeight;
    if (windowWidth < 1024) {
      headerOuterHeight = 56;
    }
    else {
      headerOuterHeight = 72;
    }
    var contentHt = (windowHeight) - (headerOuterHeight + footerHeight);
    var mainContentArea = document.getElementById('mainrightCnt');
    if (mainContentArea) {
      mainContentArea.style.minHeight = (contentHt) + 'px';
      mainContentArea.style.paddingTop = (headerOuterHeight) + 'px';
    }

    var leftMenuArea = document.getElementById('mainleftNav');
    if (leftMenuArea) {
      leftMenuArea.style.minHeight = (contentHt) + 'px';
      leftMenuArea.style.marginTop = (headerOuterHeight) + 'px';
    }
    var mainContentArea2 = document.getElementById('coloumnthree');
    if (mainContentArea2) {
      mainContentArea2.style.minHeight = (contentHt) + 'px';
      mainContentArea2.style.paddingTop = (headerOuterHeight) + 'px';
    }
    var mainContentArea2Float = document.getElementById('coloumnthreeFLoating');
    if (mainContentArea2Float) {
      mainContentArea2Float.style.minHeight = (contentHt) + 'px';
      //mainContentArea2Float.style.paddingTop = (headerOuterHeight) + 'px';  
    }
  }

  loginHeight() {
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;
    var loginContentArea = document.getElementById('DSA_pageoverlay');
    //var loginoverlay = document.getElementById('DSA_pageoverlay');

    if (document.getElementById('DSA_pageMidpanel')) {
      var loginContentmidpanel = document.getElementById('DSA_pageMidpanel');
      var midpanel = document.getElementById("DSA_pageMidpanel").offsetHeight;
    }

    var logoMid = document.getElementById('DSA_logoMid');
    var logoMidpanel = document.getElementById("DSA_logoMid").offsetHeight;
    var contentHt = windowHeight;
    var panelpad = (windowHeight / 2) - (midpanel / 2);
    var logopad = (windowHeight / 2) - (logoMidpanel / 2);
    //loginoverlay.style.height = (contentHt) + 'px';
    if (windowWidth < 1024) {
      loginContentArea.style.minHeight = '';
      loginContentmidpanel.style.marginTop = '';
      logoMid.style.marginTop = '';
    }
    else {
      loginContentArea.style.minHeight = (contentHt) + 'px';
      loginContentmidpanel.style.marginTop = (panelpad) + 'px';
      logoMid.style.marginTop = (logopad) - 75 + 'px';
    }

  }

  /*menu set active*/
  setActiveClass(eventObj) {
    var listItems = eventObj.target.closest('ul.DSA_frstLevel').querySelectorAll(".active");
    var listItems2 = eventObj.target.closest('ul').querySelectorAll(".active");
    var listItems3 = eventObj.target.closest('ul.DSA_frstLevel').querySelectorAll(".activeDark");
    if (eventObj.target.closest('ul').classList.contains('DSA_secLevel')) {
      listItems.forEach(function (eachList) {
        eachList.classList.remove('active');
      });
      listItems3.forEach(function (eachList) {
        eachList.classList.remove('activeDark');
      });
      eventObj.target.closest('ul').parentNode.classList.add('activeDark');
      eventObj.target.closest('li').classList.add('active');
    }
    else {
      listItems2.forEach(function (eachList) {
        eachList.classList.remove('active');
      });

      listItems3.forEach(function (eachList) {
        eachList.classList.remove('activeDark');
      });
      eventObj.target.closest('li').classList.add('active');
      if (eventObj.target.closest('li').querySelector('.DSA_secLevel')) {
        if (!eventObj.target.closest('li').querySelector('.DSA_secLevel').classList.contains('hide')) {
          eventObj.target.closest('li').classList.remove('active');
          eventObj.target.closest('li').querySelector('.ds_menuArrow').classList.add('next-icon');
          eventObj.target.closest('li').querySelector('.ds_menuArrow').classList.remove('down-arw-icon');
          eventObj.target.closest('li').querySelector('ul').classList.add('hide');
        }
        else {
          eventObj.target.closest('li').querySelector('.ds_menuArrow').classList.add('down-arw-icon');
          eventObj.target.closest('li').querySelector('.ds_menuArrow').classList.remove('next-icon');
          eventObj.target.closest('li').querySelector('ul').classList.remove('hide');
        }
      }
    }

  }

  setActiveClass_TopNav(eventObj) {
    eventObj.stopPropagation();
    var listItems = eventObj.target.closest('ul.DSA_frstLevel').querySelectorAll(".active");
    var listItems2 = eventObj.target.closest('ul').querySelectorAll(".active");
    var listItems3 = eventObj.target.closest('ul.DSA_frstLevel').querySelectorAll(".activeDark");
    if (eventObj.target.closest('ul').classList.contains('DSA_secLevel')) {
      listItems.forEach(function (eachList) {
        eachList.classList.remove('active');
      });
      listItems3.forEach(function (eachList) {
        eachList.classList.remove('activeDark');
      });

      eventObj.target.closest('ul').parentNode.parentNode.querySelectorAll('ul.DSA_secLevel').forEach(function (eachList) {
        if (!eachList.classList.contains('hide')) {
          eachList.classList.add('hide');
        }
      });
      eventObj.target.closest('ul').parentNode.classList.add('activeDark');
      eventObj.target.closest('li').classList.add('active');
      eventObj.target.closest('ul.DSA_secLevel').classList.remove('hide');
    } else {
      listItems2.forEach(function (eachList) {
        eachList.classList.remove('active');
      });

      listItems3.forEach(function (eachList) {
        eachList.classList.remove('activeDark');
      });
      eventObj.target.closest('li').classList.add('active');
      if (eventObj.target.closest('li').querySelector('.DSA_secLevel')) {
        if (!eventObj.target.closest('li').querySelector('.DSA_secLevel').classList.contains('hide')) {

          /* if(!eventObj.target.closest('li').querySelector('.DSA_secLevel').classList.contains('DSA_wb_topMenu_sec')) {
            eventObj.target.closest('li').classList.remove('active');            
            eventObj.target.closest('li').querySelector('ul').classList.add('hide');
          }  */
        } else {

          eventObj.target.closest('li').parentNode.querySelectorAll('ul.DSA_secLevel').forEach(function (eachList) {
            if (!eachList.classList.contains('hide')) {
              eachList.classList.add('hide');
            }
          });
          eventObj.target.closest('li').querySelector('ul').classList.remove('hide');
        }
      } else {
        eventObj.target.closest('li').parentNode.querySelectorAll('ul.DSA_secLevel').forEach(function (eachList) {
          if (!eachList.classList.contains('hide')) {
            eachList.classList.add('hide');
          }
        });
      }
    }
  }


  selectCardService(eventObj) {
    if (eventObj.target.closest('.DSA_selectionCard').classList.contains('DSA_active')) {
      eventObj.target.closest('.DSA_selectionCard').classList.remove('DSA_active');
    }
    else {
      eventObj.target.closest('.DSA_selectionCard').classList.add('DSA_active')
    }
  }
  onResizeService(event) {
    this.loginHeight();
  }

  /*chage view */
  changeViewService(thisElement, designViewParam) {
    if (designViewParam) {
      document.querySelector('.codeView').classList.remove('active');
      document.querySelector('.codeView').classList.add('hide');
      document.querySelector('.designView').classList.remove('hide');
      document.querySelector('.designView').classList.add('active');
      thisElement.target.parentElement.classList.add('active');
      thisElement.target.parentElement.previousSibling.classList.remove('active');
    } else {
      document.querySelector('.designView').classList.remove('active');
      document.querySelector('.designView').classList.add('hide');
      document.querySelector('.codeView').classList.remove('hide');
      document.querySelector('.codeView').classList.add('active');
      thisElement.target.parentElement.classList.add('active');
      thisElement.target.parentElement.nextSibling.classList.remove('active');
    }

  }

  /*timepicker border*/
  setInputFocusService(eventObj) {
    eventObj.target.closest('.DCA_wb_cusTimeCtr').classList.add("mat-focused");
  }
  resetsetInputFocusService(eventObj) {
    eventObj.target.closest('.DCA_wb_cusTimeCtr').classList.remove("mat-focused");
  }


  setCrossLinkUrl(urlObj) {
    let urlLink = "http://cdgweb/Emp_Exp/DS/#/"
    let branding = "innerPages/branding/";
    let components = "innerPages/components/";
    let pages = "innerPages/Pages/";

    switch (urlObj) {
      case "ColorsandStyleComponent": window.open(urlLink + branding + "colorsand-style", '_blank'); break;
      case "TypographyComponent": window.open(urlLink + branding + "typography", '_blank'); break;
      case "ToneOfVoiceComponent": window.open(urlLink + branding + "tone-of-voice", '_blank'); break;
      case "NamingComponent": window.open(urlLink + branding + "naming", '_blank'); break;
      case "PersonalityComponent": window.open(urlLink + branding + "personality", '_blank'); break;
      case "UsabilityComponent": window.open(urlLink + branding + "usability", '_blank'); break;
      case "GridsAndSpacingComponent": window.open(urlLink + branding + "grids-and-spacing", '_blank'); break;

      case "ButtonsComponent": window.open(urlLink + components + "buttons", '_blank'); break;
      case "SelectionControlsComponent": window.open(urlLink + components + "selection-controls", '_blank'); break;
      case "InputFieldComponent": window.open(urlLink + components + "input-field", '_blank'); break;
      case "DatePickerComponent": window.open(urlLink + components + "date-picker", '_blank'); break;
      case "ChipsComponent": window.open(urlLink + components + "chips", '_blank'); break;
      case "CardsComponent": window.open(urlLink + components + "cards", '_blank'); break;
      case "ListComponent": window.open(urlLink + components + "list", '_blank'); break;
      case "DialogComponent": window.open(urlLink + components + "dialog", '_blank'); break;
      case "ModalComponent": window.open(urlLink + components + "modal", '_blank'); break;
      case "ChartandgraphComponent": window.open(urlLink + components + "chartandgraph", '_blank'); break;
      case "TabsComponent": window.open(urlLink + components + "tabs", '_blank'); break;
      case "ExpandCollapseComponent": window.open(urlLink + components + "Expand-collapse", '_blank'); break;
      case "AttachmentComponent": window.open(urlLink + components + "attachment", '_blank'); break;
      case "CommentComponent": window.open(urlLink + components + "comment", '_blank'); break;
      case "BottomSheetComponent": window.open(urlLink + components + "bottom-sheet", '_blank'); break;
      case "OverflowMenuComponent": window.open(urlLink + components + "overflow-menu", '_blank'); break;
      case "ProfileBannerComponent": window.open(urlLink + components + "profile-banner", '_blank'); break;
      case "AddressComponent": window.open(urlLink + components + "address", '_blank'); break;
      case "TimelineComponent": window.open(urlLink + components + "timeline", '_blank'); break;
      case "BottomBarsComponent": window.open(urlLink + components + "bottom-bars", '_blank'); break;
      case "TopBarsComponent": window.open(urlLink + components + "top-bars", '_blank'); break;
      case "HamburgerComponent": window.open(urlLink + components + "hamburger", '_blank'); break;
      case "FiltersComponent": window.open(urlLink + components + "filters", '_blank'); break;
      case "MessagingComponent": window.open(urlLink + components + "messaging", '_blank'); break;
      case "ConstructsComponent": window.open(urlLink + components + "constructs", '_blank'); break;
      case "NotificationComponent": window.open(urlLink + components + "notification", '_blank'); break;
      case "NudgesComponent": window.open(urlLink + components + "nudges", '_blank'); break;
      case "MicroFeedbackComponent": window.open(urlLink + components + "micro-feedback", '_blank'); break;
      case "GuidedFlowsComponent": window.open(urlLink + components + "guided-flows", '_blank'); break;
      case "VocabularyComponent": window.open(urlLink + components + "vocabulary", '_blank'); break;
      case "BannerComponent": window.open(urlLink + components + "banner", '_blank'); break;
      case "EmptyStateComponent": window.open(urlLink + components + "empty-state", '_blank'); break;
      case "SnackbarComponent": window.open(urlLink + components + "snackbar", '_blank'); break;
      case "DataGridComponent": window.open(urlLink + components + "data-grid", '_blank'); break;
      case "BadgeComponent": window.open(urlLink + components + "badge", '_blank'); break;
      case "GlobalHeaderComponent": window.open(urlLink + components + "global-header", '_blank'); break;
      case "WebfooterComponent": window.open(urlLink + components + "webfooter", '_blank'); break;
      case "PaginationComponent": window.open(urlLink + components + "pagination", '_blank'); break;
      case "PopoverComponent": window.open(urlLink + components + "popover", '_blank'); break;
      case "TooltipComponent": window.open(urlLink + components + "tooltip", '_blank'); break;
      case "CalloutComponent": window.open(urlLink + components + "callout", '_blank'); break;
      case "SliderComponent": window.open(urlLink + components + "slider", '_blank'); break;

      case "PageFormpageComponent": window.open(urlLink + pages + "page-formpage", '_blank'); break;
      case "FormpageSimpleComponent": window.open(urlLink + pages + "formpage-simple", '_blank'); break;
      case "FormpageMediumComponent": window.open(urlLink + pages + "formpage-medium", '_blank'); break;
      case "FormpageComplexComponent": window.open(urlLink + pages + "formpage-complex", '_blank'); break;
    }


  }

  bindEvent(el, eventName, eventHandler) {
    if (el.addEventListener) {
      el.addEventListener(eventName, eventHandler, false);
    } else if (el.attachEvent) {
      el.attachEvent('on' + eventName, eventHandler);
    }
  }

  DSpopoverbind(thisElement) {

    if (thisElement.type == 'mouseenter') {

      if (document.getElementById("DSA_popoverMainBody")) {
        document.getElementById("DSA_popoverMainBody").parentNode.removeChild(document.getElementById('DSA_popoverMainBody'));

      }


      var rect = thisElement.target.getBoundingClientRect();

      var iDiv = document.createElement('div');
      iDiv.id = 'DSA_popoverMainBody';
      iDiv.className = 'DSA_popoverMainBody';
      document.getElementsByTagName('body')[0].appendChild(iDiv);
      var cln = thisElement.target.closest(".DSA_popoverMainCtr").querySelector('.DSA_popoverInner').cloneNode(true);
      document.querySelector('.DSA_popoverMainBody').appendChild(cln);
      document.getElementById('DSA_popoverMainBody').querySelector('.DSA_popoverclose').id = 'DSA_popoverclose';

      var wdth = document.getElementById('DSA_popoverMainBody').offsetWidth;
      var hgth = document.getElementById('DSA_popoverMainBody').offsetHeight;
      var itemwdth = thisElement.target.offsetWidth;
      var itemhgth = thisElement.target.offsetHeight;


      if (thisElement.target.getAttribute('data-Pos') == 'left') {
        document.getElementById('DSA_popoverMainBody').style.left = (rect.left - 20 - wdth) + 'px';
        document.getElementById('DSA_popoverMainBody').style.top = (rect.top - ((hgth - itemhgth) / 2)) + 'px';
        document.getElementById('DSA_popoverMainBody').classList.add('DSA_leftArrow');
      }
      if (thisElement.target.getAttribute('data-Pos') == 'right') {
        document.getElementById('DSA_popoverMainBody').style.top = (rect.top - ((hgth - itemhgth) / 2)) + 'px';
        document.getElementById('DSA_popoverMainBody').style.left = (rect.right + 10) + 'px';
        document.getElementById('DSA_popoverMainBody').classList.add('DSA_rightArrow');
      }
      if (thisElement.target.getAttribute('data-Pos') == 'top') {
        document.getElementById('DSA_popoverMainBody').style.top = (rect.top - itemhgth - 10 - hgth) + 'px';
        document.getElementById('DSA_popoverMainBody').classList.add('DSA_topArrow');
        document.getElementById('DSA_popoverMainBody').style.left = (rect.left + (itemwdth - wdth) / 2) + 'px';
      }
      if (thisElement.target.getAttribute('data-Pos') == 'bottom') {
        document.getElementById('DSA_popoverMainBody').style.top = (rect.top + itemhgth + 10) + 'px';
        document.getElementById('DSA_popoverMainBody').classList.add('DSA_bottomArrow');
        document.getElementById('DSA_popoverMainBody').style.left = (rect.left + (itemwdth - wdth) / 2) + 'px';
      }


      /*this.bindEvent(document.getElementById('DSA_popoverMainBody'), 'click', function (e) {
        document.getElementById("DSA_popoverMainBody").parentNode.removeChild(document.getElementById('DSA_popoverMainBody'));
      });*/
      this.bindEvent(document.getElementById('DSA_popoverMainBody'), 'mouseleave', function (e) {
        document.getElementById("DSA_popoverMainBody").parentNode.removeChild(document.getElementById('DSA_popoverMainBody'));
      });
      this.bindEvent(document.getElementById('DSA_popoverclose'), 'click', function (e) {
        document.getElementById('DSA_popoverMainBody').parentNode.removeChild(document.getElementById('DSA_popoverMainBody'));
      });



    }
    else if (thisElement.type == 'mouseleave') {

    }


  }


  /*top menu right util active*/
  clickactiveClass(eventObj) {
    if (eventObj.target.closest('li').classList.contains('DSA_active')) {
      eventObj.target.closest('li').classList.remove('DSA_active');
    }
    else {
      var listItems = eventObj.target.closest('ul').querySelectorAll('li');
      listItems.forEach(function (eachList) {
        eachList.classList.remove('DSA_active');
      });
      //eventObj.target.closest('ul').querySelector('li').classList.remove('DSA_active');
      eventObj.target.closest('li').classList.add('DSA_active')
    }

  }
}