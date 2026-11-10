/* DCDD project page scripts: nav toggle, compare slider, bibtex copy */
(function () {
  'use strict';

  // ---------- nav ----------
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // ---------- compare data ----------
  var IMG = 'static/images/compare/';
  var ITEMS = [
    { id: 'e', kind: 't2i', name: 'Clock below TV', prompt: 'a photo of a clock below a tv.' },
    { id: 'a', kind: 't2i', name: 'Kitten chef', prompt: 'cute baby exotic shorthair grey kitten dressed as a chef, standing in a kitchen, copper eyes, chopping vegetables.' },
    { id: 'b', kind: 't2i', name: 'Wine bottle', prompt: 'a super hd photo of a wine bottle and a glass with a michelinstar like dish on a table on a terasse with a view to a wonderful nature scene.' },
    { id: 'c', kind: 't2i', name: 'Father & son', prompt: 'an illustration of a geek A father playing with his son, in the style silver and black glorious, watercolor illustrations, sticker art, hyperrealistic.' },
    { id: 'd', kind: 't2i', name: 'Future city', prompt: 'Tbilisi, Geogia future city.' },
    { id: 'g', kind: 't2i', name: 'Dog', prompt: 'a photo of a dog.' },
    { id: 'h', kind: 't2i', name: 'Cow & burger', prompt: 'a photo of an orange cow and a purple sandwich.' },
    { id: 'f', kind: 't2i', name: 'Bottles & mouse', prompt: 'a photo of a brown computer mouse and a purple bottle.' },
    { id: 'l', kind: 'recon', name: 'Record sleeve', prompt: 'ImageNet-1K validation image' },
    { id: 'm', kind: 'recon', name: 'Guitarist', prompt: 'ImageNet-1K validation image' },
    { id: 'n', kind: 'recon', name: 'Pikachu lake', prompt: 'MJHQ-30K reference image' },
    { id: 'o', kind: 'recon', name: 'Checkered flag', prompt: 'MJHQ-30K reference image' }
  ];

  var root = document.getElementById('compare');
  if (!root) return;

  var chipsT2I = root.querySelector('[data-chips="t2i"]');
  var chipsRecon = root.querySelector('[data-chips="recon"]');
  var body = root.querySelector('.compare-body');
  var cmp = root.querySelector('.cmp');
  var before = cmp.querySelector('.before');
  var after = cmp.querySelector('.after');
  var handle = cmp.querySelector('.handle');
  var knob = cmp.querySelector('.knob');
  var gtPane = root.querySelector('.gt-pane');
  var gtImg = gtPane.querySelector('img');
  var sbsPane = root.querySelector('.sbs-pane');
  var sbsGt = sbsPane.querySelector('.sbs-item.gt');
  var sbsImgs = { gt: sbsGt.querySelector('img'), vq: sbsPane.querySelector('.sbs-item.vq img'), ours: sbsPane.querySelector('.sbs-item.ours img') };
  var viewBtns = root.querySelectorAll('.view-toggle button');
  var view = 'slider';
  var promptEl = root.querySelector('.prompt');
  var kindEl = root.querySelector('.kind');
  var current = null;

  function setPos(frac) {
    frac = Math.max(0, Math.min(1, frac));
    var pct = (frac * 100).toFixed(2) + '%';
    after.style.clipPath = 'inset(0 0 0 ' + pct + ')';
    handle.style.left = pct;
    knob.style.left = pct;
  }

  function select(item) {
    current = item;
    before.src = IMG + item.id + '_vq.jpg';
    after.src = IMG + item.id + '_dcdd.jpg';
    before.alt = 'Native VQ-VAE decoder: ' + item.name;
    after.alt = 'DCDD: ' + item.name;
    sbsImgs.vq.src = before.src; sbsImgs.vq.alt = before.alt;
    sbsImgs.ours.src = after.src; sbsImgs.ours.alt = after.alt;
    if (item.kind === 'recon') {
      gtImg.src = IMG + item.id + '_gt.jpg';
      gtImg.alt = 'Ground truth: ' + item.name;
      sbsImgs.gt.src = gtImg.src; sbsImgs.gt.alt = gtImg.alt;
      kindEl.textContent = 'Reconstruction';
    } else {
      kindEl.textContent = 'Text-to-image';
    }
    applyView();
    promptEl.textContent = item.kind === 't2i' ? '“' + item.prompt + '”' : item.prompt;
    root.querySelectorAll('.chip').forEach(function (c) {
      c.classList.toggle('active', c.dataset.id === item.id);
    });
    setPos(0.5);
  }

  function applyView() {
    var recon = current && current.kind === 'recon';
    if (view === 'sbs') {
      cmp.hidden = true;
      gtPane.hidden = true;
      body.classList.remove('with-gt');
      body.classList.add('sbs');
      sbsPane.hidden = false;
      sbsGt.hidden = !recon;
      sbsPane.classList.toggle('three', recon);
    } else {
      cmp.hidden = false;
      sbsPane.hidden = true;
      body.classList.remove('sbs');
      body.classList.toggle('with-gt', recon);
      gtPane.hidden = !recon;
    }
  }
  viewBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      view = b.dataset.view;
      viewBtns.forEach(function (x) { x.classList.toggle('active', x === b); });
      applyView();
    });
  });

  ITEMS.forEach(function (item) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.id = item.id;
    b.textContent = item.name;
    b.addEventListener('click', function () { select(item); });
    (item.kind === 't2i' ? chipsT2I : chipsRecon).appendChild(b);
  });

  // pointer drag
  var dragging = false;
  function fracFromEvent(e) {
    var r = cmp.getBoundingClientRect();
    var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    return x / r.width;
  }
  cmp.addEventListener('pointerdown', function (e) { dragging = true; cmp.setPointerCapture(e.pointerId); setPos(fracFromEvent(e)); });
  cmp.addEventListener('pointermove', function (e) { if (dragging) setPos(fracFromEvent(e)); });
  cmp.addEventListener('pointerup', function () { dragging = false; });
  cmp.addEventListener('pointercancel', function () { dragging = false; });
  cmp.addEventListener('keydown', function (e) {
    var cur = parseFloat(handle.style.left) / 100 || 0.5;
    if (e.key === 'ArrowLeft') { setPos(cur - 0.05); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setPos(cur + 0.05); e.preventDefault(); }
  });

  select(ITEMS[0]);

  // ---------- bibtex copy ----------
  var copy = document.getElementById('copy-bib');
  var bib = document.getElementById('bibtex-text');
  if (copy && bib && navigator.clipboard) {
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(bib.textContent).then(function () {
        copy.textContent = 'Copied!';
        setTimeout(function () { copy.textContent = 'Copy'; }, 1500);
      });
    });
  }
})();
