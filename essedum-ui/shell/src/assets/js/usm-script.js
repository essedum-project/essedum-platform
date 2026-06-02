// Vanilla-JS rewrite of the original jQuery script (drops the jQuery dep).
// Handles iamp-usm sidebar/panel/accordion/popup click behaviors.
document.addEventListener('DOMContentLoaded', function () {
  // Generic active-state for any <li>
  document.querySelectorAll('li').forEach(function (li) {
    li.addEventListener('click', function () {
      var sidebar = document.querySelector('.sidebar-nav');
      if (sidebar) {
        sidebar.querySelectorAll('li').forEach(function (sib) { sib.classList.remove('active'); });
      }
      li.classList.add('active');
    });
  });

  // Delegated click handlers on <body>
  document.body.addEventListener('click', function (e) {
    var target = e.target;

    // .ams_panelCtr — set this one active, clear siblings
    var panel = target.closest && target.closest('.ams_panelCtr');
    if (panel) {
      document.querySelectorAll('.ams_panelCtr').forEach(function (p) { p.classList.remove('active'); });
      panel.classList.add('active');
    }

    // .accordionClosed > h3 > a — open the accordion
    var closedAccordion = target.closest && target.closest('.accordionClosed > h3 > a');
    if (closedAccordion) {
      var container = closedAccordion.closest('.ams_accordionCtr');
      if (container) {
        container.classList.remove('accordionClosed');
        container.classList.add('accordionOpen');
      }
    }

    // .accordionOpen > h3 > a — close the accordion
    var openAccordion = target.closest && target.closest('.accordionOpen > h3 > a');
    if (openAccordion) {
      var openContainer = openAccordion.closest('.ams_accordionCtr');
      if (openContainer) {
        openContainer.classList.remove('accordionOpen', 'active');
        openContainer.classList.add('accordionClosed');
      }
    }

    // .popupCtr a — toggle the dropdown
    var popupAnchor = target.closest && target.closest('.popupCtr a');
    if (popupAnchor) {
      e.stopPropagation();
      var dropdown = popupAnchor.closest('.popupCtr') &&
                     popupAnchor.closest('.popupCtr').querySelector('.popupDD');
      if (dropdown) {
        var isVisible = dropdown.offsetParent !== null && dropdown.style.display !== 'none';
        dropdown.style.display = isVisible ? 'none' : '';
      }
    }

    // .ams_close — close the nearest .popupDD
    var closeBtn = target.closest && target.closest('.ams_close');
    if (closeBtn) {
      var nearestPopup = closeBtn.closest('.popupDD');
      if (nearestPopup) nearestPopup.style.display = 'none';
    }
  });
});
