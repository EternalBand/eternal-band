/* =========================================================
   ETERNAL Band — script.js
   Validasi form + penyusunan pesan WhatsApp.
   TIDAK ADA nominal harga, DP, atau nomor rekening di file ini.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------- Konfigurasi ----------------
     Satu-satunya tempat yang perlu diubah kalau nomor WhatsApp berganti. */
  var CONFIG = {
    waNumber: '6288200319538',            // format internasional, tanpa + dan tanpa 0
    closing: 'Mohon informasi penawaran biaya dan konfirmasi ketersediaan tanggalnya. Terima kasih.'
  };

  var BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
               'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var form = $('#bookingForm');

  /* ---------------- Utilitas ---------------- */

  function val(name) {
    var el = form.elements[name];
    if (!el) return '';
    if (el instanceof RadioNodeList || (el.length && !el.tagName)) {
      var checked = form.querySelector('[name="' + name + '"]:checked');
      return checked ? checked.value.trim() : '';
    }
    return (el.value || '').trim();
  }

  // Untuk checkbox bernama sama (mis. tambahan player) → gabung jadi satu baris
  function valMulti(name) {
    return $$('[name="' + name + '"]:checked', form)
      .map(function (el) { return el.value.trim(); })
      .join(', ');
  }

  function formatTanggal(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    if (p.length !== 3) return iso;
    var bulan = BULAN[parseInt(p[1], 10) - 1] || p[1];
    return parseInt(p[2], 10) + ' ' + bulan + ' ' + p[0];
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('is-visible'); }, 2400);
  }

  /* ---------------- Validasi ---------------- */

  var RULES = [
    { name: 'namaPemesan',    msg: 'Nama pemesan belum diisi.' },
    { name: 'jenisEvent',     msg: 'Jenis event belum dipilih.' },
    { name: 'jenisEventLain', msg: 'Mohon sebutkan jenis eventnya.', when: function () { return val('jenisEvent') === 'Lainnya'; } },
    { name: 'tanggalAcara',   msg: 'Tanggal acara belum diisi.' },
    { name: 'jamMulai',       msg: 'Jam mulai belum diisi.' },
    { name: 'jamSelesai',     msg: 'Jam selesai belum diisi.' },
    { name: 'lokasiAcara',    msg: 'Lokasi acara belum diisi.' },
    { name: 'paket',          msg: 'Paket belum dipilih.' },
    { name: 'soundSystem',    msg: 'Mohon pilih sumber sound system.' },
    { name: 'venue',          msg: 'Mohon pilih indoor atau outdoor.' }
  ];

  function fieldWrapper(name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.closest('.field') : null;
  }

  function showError(name, msg) {
    var box = form.querySelector('[data-error-for="' + name + '"]');
    var wrap = fieldWrapper(name);
    if (box) { box.textContent = msg; box.classList.add('is-visible'); }
    if (wrap) wrap.classList.add('has-error');
  }

  function clearError(name) {
    var box = form.querySelector('[data-error-for="' + name + '"]');
    var wrap = fieldWrapper(name);
    if (box) { box.textContent = ''; box.classList.remove('is-visible'); }
    if (wrap) wrap.classList.remove('has-error');
  }

  function clearAllErrors() {
    RULES.forEach(function (r) { clearError(r.name); });
    $('#formStatus').textContent = '';
    var sum = $('#errSummary');
    sum.classList.remove('is-visible');
    sum.textContent = '';
  }

  function validate() {
    clearAllErrors();
    var firstBad = null, jumlah = 0;

    RULES.forEach(function (r) {
      if (r.when && !r.when()) return;
      if (!val(r.name)) {
        showError(r.name, r.msg);
        jumlah++;
        if (!firstBad) firstBad = r.name;
      }
    });

    // Tanggal tidak boleh di masa lalu
    var tgl = val('tanggalAcara');
    if (tgl && tgl < todayISO()) {
      showError('tanggalAcara', 'Tanggal acara sudah lewat. Mohon pilih tanggal ke depan.');
      jumlah++;
      if (!firstBad) firstBad = 'tanggalAcara';
    }

    if (firstBad) {
      var sum = $('#errSummary');
      sum.textContent = jumlah === 1
        ? 'Ada 1 isian wajib yang belum lengkap. Bagian yang perlu diisi ditandai merah di atas.'
        : 'Ada ' + jumlah + ' isian wajib yang belum lengkap. Bagian yang perlu diisi ditandai merah di atas.';
      sum.classList.remove('is-visible');
      void sum.offsetWidth;              // paksa animasi jalan lagi saat submit berulang
      sum.classList.add('is-visible');

      var el = form.querySelector('[name="' + firstBad + '"]');
      if (el) {
        var target = el.closest('.field') || el;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (el.focus) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
      }
      return false;
    }
    return true;
  }

  /* ---------------- Penyusun pesan ---------------- */

  function buildMessage(useBold) {
    var b = useBold ? '*' : '';

    var jenis = val('jenisEvent') === 'Lainnya'
      ? (val('jenisEventLain') || 'Lainnya')
      : val('jenisEvent');

    var waktu = '';
    if (val('jamMulai') && val('jamSelesai')) waktu = val('jamMulai') + ' - ' + val('jamSelesai');
    else if (val('jamMulai')) waktu = 'mulai ' + val('jamMulai');

    // Gabungkan tambahan player dari checkbox + kolom teks bebas
    var tambahan = [valMulti('addPlayer'), val('additionalPlayer')]
      .filter(function (x) { return x; })
      .join(', ');

    // Catatan format pensi ikut terkirim supaya tidak perlu ditanya ulang di chat
    var isPensi = val('jenisEvent') === 'Pensi / Pentas Seni';

    var groups = [
      {
        title: 'DETAIL ACARA',
        rows: [
          ['Nama Pemesan', val('namaPemesan')],
          ['Nama Event',   val('namaEvent')],
          ['Jenis Event',  jenis],
          ['Tanggal Acara', formatTanggal(val('tanggalAcara'))],
          ['Waktu Tampil', waktu],
          ['Lokasi Acara', val('lokasiAcara')],
          ['Format', isPensi ? 'Pensi — slot 1 jam (45 menit tampil + 15 menit cek sound)' : '']
        ]
      },
      {
        title: 'PILIHAN PAKET',
        rows: [
          ['Paket',             val('paket')],
          ['Durasi Tambahan',   val('durasiTambahan')],
          ['Tambahan Player',   tambahan],
          ['Pemesanan',         val('multiAcara')]
        ]
      },
      {
        title: 'KONSEP & MUSIK',
        rows: [
          ['Konsep Acara', val('konsepAcara')],
          ['Request Lagu', val('requestLagu')]
        ]
      },
      {
        title: 'TEKNIS',
        rows: [
          ['Sound System', val('soundSystem')],
          ['Venue',        val('venue')],
          ['Catatan',      val('catatan')]
        ]
      }
    ];

    var blocks = [];

    groups.forEach(function (g) {
      var lines = g.rows
        .filter(function (r) { return r[1]; })                 // buang baris kosong
        .map(function (r) { return r[0] + ': ' + r[1]; });
      if (!lines.length) return;                               // grup kosong → judul ikut hilang
      blocks.push(b + g.title + b + '\n' + lines.join('\n'));
    });

    return b + 'PEMESANAN ETERNAL BAND' + b + '\n\n'
         + blocks.join('\n\n')
         + '\n\n---\n' + CONFIG.closing;
  }

  /* ---------------- Submit ---------------- */

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var url = 'https://wa.me/' + CONFIG.waNumber + '?text=' + encodeURIComponent(buildMessage(true));

    // Dibuka langsung di dalam handler klik — jangan dibungkus setTimeout/await,
    // karena popup blocker iOS Safari akan memblokirnya.
    var win = window.open(url, '_blank');
    if (!win) { window.location.href = url; }

    $('#formStatus').textContent = 'WhatsApp dibuka. Tinggal tekan kirim di sana.';
  });

  /* ---------------- Salin ringkasan (fallback) ---------------- */

  $('#copyBtn').addEventListener('click', function () {
    if (!validate()) return;
    var text = buildMessage(false);

    function done() { toast('Tersalin'); $('#formStatus').textContent = 'Ringkasan tersalin. Tinggal paste di WhatsApp.'; }
    function fail() { $('#formStatus').textContent = 'Gagal menyalin otomatis. Silakan salin manual.'; }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? done() : fail(); } catch (err) { fail(); }
      document.body.removeChild(ta);
    }
  });

  /* ---------------- Interaksi form ---------------- */

  // "Lainnya" pada jenis event + catatan format pensi
  var selJenis = $('#jenisEvent');
  var wrapLain = $('#wrapJenisLain');
  var notePensi = $('#notePensi');
  selJenis.addEventListener('change', function () {
    var show = selJenis.value === 'Lainnya';
    wrapLain.classList.toggle('is-hidden', !show);
    if (show) $('#jenisEventLain').focus();
    else clearError('jenisEventLain');

    notePensi.classList.toggle('is-hidden', selJenis.value !== 'Pensi / Pentas Seni');
  });

  // Peringatan lunak jam selesai < jam mulai
  var warnJam = $('#warnJam');
  function cekJam() {
    var a = val('jamMulai'), z = val('jamSelesai');
    warnJam.classList.toggle('is-hidden', !(a && z && z <= a));
  }
  $('#jamMulai').addEventListener('change', cekJam);
  $('#jamSelesai').addEventListener('change', cekJam);

  // Tanggal minimal hari ini
  $('#tanggalAcara').setAttribute('min', todayISO());

  // Hapus error begitu field diperbaiki, dan perbarui ringkasan di bawah
  function syncSummary() {
    var sisa = $$('.field.has-error', form).length;
    var sum = $('#errSummary');
    if (!sisa) { sum.classList.remove('is-visible'); return; }
    sum.textContent = sisa === 1
      ? 'Tinggal 1 isian wajib lagi. Bagian yang perlu diisi ditandai merah.'
      : 'Masih ada ' + sisa + ' isian wajib yang belum lengkap.';
  }

  RULES.forEach(function (r) {
    $$('[name="' + r.name + '"]').forEach(function (el) {
      var ev = (el.type === 'radio' || el.tagName === 'SELECT') ? 'change' : 'input';
      el.addEventListener(ev, function () {
        if (val(r.name)) { clearError(r.name); syncSummary(); }
      });
    });
  });

  // Tombol "Pilih paket ini" → scroll ke form + centang paket
  $$('.js-pick').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var nama = btn.getAttribute('data-package');
      var radio = form.querySelector('[name="paket"][value="' + nama + '"]');
      if (radio) { radio.checked = true; clearError('paket'); }
      $('#form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('Paket ' + nama + ' dipilih');
    });
  });

  /* ---------------- Tahun footer ---------------- */
  $('#year').textContent = String(new Date().getFullYear());

  /* ---------------- Reveal on scroll ---------------- */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------- Sticky CTA mobile ---------------- */
  var cta = $('#stickyCta');
  var hero = $('#hero');
  var formSec = $('#form');
  if ('IntersectionObserver' in window) {
    var showCta = false, pastHero = false, inForm = false;
    function sync() { cta.classList.toggle('is-visible', pastHero && !inForm); }
    new IntersectionObserver(function (e) {
      pastHero = !e[0].isIntersecting; sync();
    }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(function (e) {
      inForm = e[0].isIntersecting; sync();
    }, { threshold: 0 }).observe(formSec);
  }

})();
