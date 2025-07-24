var $doc = $(document);
$doc.ready(function () {
  var $li = $("li");
  $li.on("click", function () {
    var $this = $(this);
    var $sidebar = $(".sidebar-nav");
    $sidebar.find("li").removeClass("active");
    $this.addClass("active");
  });
  var $body = $("body");
  $body.on("click", ".ams_panelCtr", function () {
    var $this = $(this);
    var $ams_panelCtr = $(".ams_panelCtr");
    $ams_panelCtr.removeClass("active");
    $this.addClass("active");
  });

  $body.on("click", ".accordionClosed>h3>a", function () {
    var $this = $(this);
    $this.closest(".ams_accordionCtr").removeClass("accordionClosed");
    $this.closest(".ams_accordionCtr").addClass("accordionOpen");
  });
  $body.on("click", ".accordionOpen>h3>a", function () {
    var $this = $(this);
    $this.closest(".ams_accordionCtr").removeClass("accordionOpen active");
    $this.closest(".ams_accordionCtr").addClass("accordionClosed");
  });

  $body.on("click", ".popupCtr a", function (e) {
    var $this = $(this);
    e.stopPropagation();
    if ($this.closest(".popupCtr").find(".popupDD").is(":visible")) {
      $this.closest(".popupCtr").find(".popupDD").hide();
    } else {
      $this.closest(".popupCtr").find(".popupDD").show();
    }
  });
  $body.on("click", ".ams_close", function () {
    var $this = $(this);
    $this.closest(".popupDD").hide();
  });
});
