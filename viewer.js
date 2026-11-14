(function () {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  var file = document.body.dataset.pdf;
  var msg = document.getElementById("msg"), pages = document.getElementById("pages");
  var items = [];
  function cssWidth(base) {
    // landscape: fit whole page in window; portrait: fit width (scroll down)
    if (base.width >= base.height) return Math.min(innerWidth, innerHeight * base.width / base.height);
    return Math.min(innerWidth, 900);
  }
  async function draw(it) {
    var my = ++it.token, w = cssWidth(it.base);
    var vp = it.page.getViewport({ scale: (w / it.base.width) * Math.min(devicePixelRatio || 1, 3) });
    var off = document.createElement("canvas");
    off.width = vp.width; off.height = vp.height;
    await it.page.render({ canvasContext: off.getContext("2d"), viewport: vp }).promise;
    if (my !== it.token) return;
    var c = it.canvas;
    c.width = off.width; c.height = off.height;
    c.style.width = w + "px"; c.style.height = (w * it.base.height / it.base.width) + "px";
    c.getContext("2d").drawImage(off, 0, 0);
  }
  pdfjsLib.getDocument(file).promise.then(async function (pdf) {
    msg.remove();
    for (var i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i), c = document.createElement("canvas");
      pages.appendChild(c);
      var it = { page: page, base: page.getViewport({ scale: 1 }), canvas: c, token: 0 };
      items.push(it); await draw(it);
    }
    var t; addEventListener("resize", function () { clearTimeout(t); t = setTimeout(function () { items.forEach(draw); }, 150); });
  }).catch(function () {
    msg.innerHTML = 'Could not display inline. <a href="' + file + '">Open the PDF</a>.';
  });
})();
