/* ===========================================================
   Puerto Móvil — JavaScript puro (sin frameworks ni módulos)
   - Lee los productos en vivo desde la hoja de cálculo (CSV publicado).
   - Si la hoja cambia, la web muestra los datos actualizados.
   =========================================================== */
(function () {
  "use strict";

  /* ----------------------- Configuración ----------------------- */
  var SHEET_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0jamwWtdX65SQOQrj9Bi1a2h3geYAKmbCW2YSUEcnLkPPGGMGnqZPSNbor-kJX2-w8RQx8onvDRRY/pub?gid=0&single=true&output=csv";
  var WHATSAPP_NUMBER = "5491162736980"; // +54 9 11 6273-6980
  var LOGO = "img/logo-puertomovil.png";

  var CATEGORY = {
    TESTER: "iPhone Tester",
    SELLADO: "iPhone Sellado",
    ACCESORIO: "Accesorio",
  };

  /* ----------------------- Iconos SVG ----------------------- */
  var icons = {
    chevron:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    whatsapp:
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.516 5.26l-.999 3.648 3.972-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
    shield:
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
    pin: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    gift: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>',
    "case":
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><line x1="11" y1="5" x2="13" y2="5"/></svg>',
    charger:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="14" rx="3"/><line x1="9" y1="17" x2="9" y2="21"/><line x1="15" y1="17" x2="15" y2="21"/></svg>',
    glass:
      '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="9" y1="6" x2="15" y2="6"/></svg>',
  };

  /* ----------------------- Utilidades ----------------------- */
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function whatsappLink(productName) {
    var msg = "¡Hola! Me interesa el " + productName + ". ¿Me darias más info?";
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  function badgeInfo(categoria) {
    switch (categoria) {
      case CATEGORY.TESTER:
        return { cls: "tester", label: "Tester" };
      case CATEGORY.SELLADO:
        return { cls: "sellado", label: "Sellado" };
      case CATEGORY.ACCESORIO:
        return { cls: "accesorio", label: "Accesorio" };
      default:
        return { cls: "accesorio", label: categoria };
    }
  }

  /* ----------------------- Parser CSV ----------------------- */
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var char = text[i];
      var next = text[i + 1];

      if (inQuotes) {
        if (char === '"' && next === '"') {
          field += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          field += char;
        }
      } else if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (char === "\r") {
        /* ignorar */
      } else {
        field += char;
      }
    }
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  function normalizeCategory(raw) {
    var v = (raw || "").trim().toLowerCase();
    if (v.indexOf("tester") !== -1) return CATEGORY.TESTER;
    if (v.indexOf("sellado") !== -1) return CATEGORY.SELLADO;
    if (v.indexOf("acces") !== -1) return CATEGORY.ACCESORIO;
    return raw ? raw.trim() : "Otro";
  }

  function normalizeStock(raw) {
    var v = (raw || "").trim().toLowerCase();
    return v.indexOf("s") === 0; // "Sí", "si", "s"
  }

  function headerIndex(headers) {
    var idx = {};
    headers.forEach(function (h, i) {
      var key = h.trim().toLowerCase();
      if (key.indexOf("categor") !== -1) idx.categoria = i;
      else if (key.indexOf("nombre") !== -1) idx.nombre = i;
      else if (key.indexOf("estado") !== -1) idx.estado = i;
      else if (key.indexOf("precio") !== -1) idx.precio = i;
      else if (key.indexOf("stock") !== -1) idx.stock = i;
    });
    return idx;
  }

  function fetchProducts() {
    return fetch(SHEET_CSV_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("No se pudo cargar la hoja de cálculo");
        return res.text();
      })
      .then(function (text) {
        var rows = parseCSV(text).filter(function (r) {
          return r.some(function (c) {
            return c.trim() !== "";
          });
        });
        if (rows.length < 2) return [];

        var idx = headerIndex(rows[0]);
        var products = [];

        for (var i = 1; i < rows.length; i++) {
          var r = rows[i];
          var nombre = (r[idx.nombre] || "").trim();
          if (!nombre) continue;

          var precioRaw = (r[idx.precio] || "").replace(/[^\d.-]/g, "");
          var precio = parseInt(precioRaw, 10);

          products.push({
            categoria: normalizeCategory(r[idx.categoria]),
            nombre: nombre,
            estado: (r[idx.estado] || "").trim(),
            precio: isNaN(precio) ? null : precio,
            enStock: normalizeStock(r[idx.stock]),
          });
        }
        return products;
      });
  }

  /* ----------------------- Componentes UI ----------------------- */
  function renderHeader(target) {
    if (!target) return;
    target.innerHTML =
      '<header class="site-header">' +
      '  <nav class="nav" aria-label="Principal">' +
      '    <a class="brand" href="index.html" aria-label="Puerto Móvil - inicio">' +
      '      <img src="' + LOGO + '" alt="Puerto Móvil" />' +
      "    </a>" +
      '    <div class="nav-links">' +
      '      <div class="nav-item">' +
      '        <button class="nav-trigger" aria-haspopup="true">iPhone ' + icons.chevron + "</button>" +
      '        <div class="dropdown" role="menu">' +
      '          <a href="productos.html?cat=tester" role="menuitem">iPhone Tester</a>' +
      '          <a href="productos.html?cat=sellado" role="menuitem">iPhone Sellado</a>' +
      "        </div>" +
      "      </div>" +
      '      <a href="productos.html?cat=accesorio">Accesorios</a>' +
      "    </div>" +
      '    <button class="menu-toggle" aria-label="Abrir menú" aria-expanded="false">' +
      "      <span></span><span></span><span></span>" +
      "    </button>" +
      "  </nav>" +
      '  <div class="mobile-menu" id="mobileMenu">' +
      '    <span class="mobile-label">iPhone</span>' +
      '    <a class="mobile-sub" href="productos.html?cat=tester">iPhone Tester</a>' +
      '    <a class="mobile-sub" href="productos.html?cat=sellado">iPhone Sellado</a>' +
      '    <a href="productos.html?cat=accesorio">Accesorios</a>' +
      "  </div>" +
      "</header>";

    var toggle = target.querySelector(".menu-toggle");
    var menu = target.querySelector("#mobileMenu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function renderFooter(target) {
    if (!target) return;
    var year = new Date().getFullYear();
    target.innerHTML =
      '<footer class="site-footer">' +
      '  <div class="footer-inner">' +
      '    <span class="copy">© ' + year + " Puerto Móvil · Precios en USD actualizados por el propietario.</span>" +
      '    <a class="footer-wa" href="' + whatsappLink("Puerto Móvil") + '" target="_blank" rel="noopener">' +
      '      <span class="ic">' + icons.whatsapp + "</span> WhatsApp directo" +
      "    </a>" +
      "  </div>" +
      "</footer>";
  }

  var ACCENT_COLORS = {
    tester: "#3b82f6",
    sellado: "#f7c948",
    accesorio: "#22c55e",
  };

  function productCard(p) {
    var badge = badgeInfo(p.categoria);
    var accent = ACCENT_COLORS[badge.cls] || "#888";
    var priceText = p.precio != null ? p.precio.toLocaleString("es-AR") : "—";
    var outClass = p.enStock ? "" : "out-of-stock";
    var name = escapeHtml(p.nombre);

    var stockBadge = p.enStock ? "" : '<span class="badge stockout">Sin stock</span>';

    var waBtn = p.enStock
      ? '<a class="btn btn-wa" href="' + whatsappLink(p.nombre) + '" target="_blank" rel="noopener">' +
        "<span>" + icons.whatsapp + "</span> Consultá por WhatsApp</a>"
      : '<button class="btn btn-wa" disabled aria-disabled="true">Sin stock</button>';

    return (
      '<article class="card ' + outClass + '">' +
      '<span class="card-accent" style="background:' + accent + '"></span>' +
      '<div style="display:flex; gap:8px; flex-wrap:wrap; z-index:1;">' +
      '<span class="badge ' + badge.cls + '">' + escapeHtml(badge.label) + "</span>" +
      stockBadge +
      "</div>" +
      '<h3 class="card-name">' + name + "</h3>" +
      (p.estado ? '<span class="card-estado">' + escapeHtml(p.estado) + "</span>" : "") +
      '<div class="card-price"><span class="cur">USD</span><span class="val">' + priceText + "</span></div>" +
      waBtn +
      "</article>"
    );
  }

  /* ----------------------- Iconos inline ----------------------- */
  function injectIcons() {
    var nodes = document.querySelectorAll("[data-icon]");
    for (var i = 0; i < nodes.length; i++) {
      var name = nodes[i].getAttribute("data-icon");
      if (icons[name]) nodes[i].innerHTML = icons[name];
    }
  }

  /* ----------------------- Página: Inicio ----------------------- */
  function initHome(track) {
    function setupCarousel() {
      var prev = document.querySelector(".carousel-btn.prev");
      var next = document.querySelector(".carousel-btn.next");
      var amount = function () {
        return Math.min(track.clientWidth * 0.85, 360);
      };
      if (prev)
        prev.addEventListener("click", function () {
          track.scrollBy({ left: -amount(), behavior: "smooth" });
        });
      if (next)
        next.addEventListener("click", function () {
          track.scrollBy({ left: amount(), behavior: "smooth" });
        });
    }

    setupCarousel();

    fetchProducts()
      .then(function (products) {
        // "Los primeros con stock de la hoja" — respeta el orden de la hoja
        var featured = products
          .filter(function (p) {
            return p.enStock;
          })
          .slice(0, 6);

        if (featured.length === 0) {
          track.innerHTML = '<p class="state-msg">No hay productos disponibles en este momento.</p>';
          return;
        }
        track.innerHTML = featured.map(productCard).join("");
      })
      .catch(function (err) {
        console.log("[v0] Error cargando destacados:", err.message);
        track.innerHTML =
          '<p class="state-msg">No pudimos cargar los productos. Probá recargar la página.</p>';
      });
  }

  /* ----------------------- Página: Productos ----------------------- */
  function initProductos(grid) {
    var filtersEl = document.getElementById("filters");
    var titleEl = document.getElementById("pageTitle");
    var subtitleEl = document.getElementById("pageSubtitle");

    var FILTERS = [
      { key: "todos", label: "Todos", cat: null },
      { key: "tester", label: "iPhone Tester", cat: CATEGORY.TESTER },
      { key: "sellado", label: "iPhone Sellado", cat: CATEGORY.SELLADO },
      { key: "accesorio", label: "Accesorios", cat: CATEGORY.ACCESORIO },
    ];

    var allProducts = [];
    var activeKey = "todos";

    function initialFilter() {
      var param = new URLSearchParams(location.search).get("cat");
      var match = FILTERS.filter(function (f) {
        return f.key === param;
      })[0];
      return match ? match.key : "todos";
    }

    function renderFilters() {
      filtersEl.innerHTML = FILTERS.map(function (f) {
        return (
          '<button class="filter-btn ' +
          (f.key === activeKey ? "active" : "") +
          '" data-key="' +
          f.key +
          '">' +
          f.label +
          "</button>"
        );
      }).join("");

      var btns = filtersEl.querySelectorAll(".filter-btn");
      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener("click", function () {
          activeKey = this.getAttribute("data-key");
          renderFilters();
          renderProducts();
          updateHeading();
        });
      }
    }

    function updateHeading() {
      var f = FILTERS.filter(function (x) {
        return x.key === activeKey;
      })[0];
      if (activeKey === "todos") {
        titleEl.textContent = "Nuestros productos";
        subtitleEl.textContent = "iPhone nuevos, seminuevos y accesorios al mejor precio.";
      } else {
        titleEl.textContent = f.label;
        subtitleEl.textContent = "Elegí el modelo que va con vos.";
      }
    }

    function renderProducts() {
      var f = FILTERS.filter(function (x) {
        return x.key === activeKey;
      })[0];
      var list = f.cat
        ? allProducts.filter(function (p) {
            return p.categoria === f.cat;
          })
        : allProducts;

      if (list.length === 0) {
        grid.innerHTML = '<p class="state-msg">No hay productos en esta categoría por el momento.</p>';
        return;
      }

      // En stock primero, luego sin stock
      var ordered = list.slice().sort(function (a, b) {
        return Number(b.enStock) - Number(a.enStock);
      });
      grid.innerHTML = ordered.map(productCard).join("");
    }

    activeKey = initialFilter();
    renderFilters();
    updateHeading();
    grid.innerHTML = '<div class="state-msg"><div class="spinner"></div>Cargando productos...</div>';

    fetchProducts()
      .then(function (products) {
        allProducts = products;
        renderProducts();
      })
      .catch(function (err) {
        console.log("[v0] Error cargando productos:", err.message);
        grid.innerHTML =
          '<p class="state-msg">No pudimos cargar los productos. Probá recargar la página.</p>';
      });
  }

  /* ----------------------- Arranque ----------------------- */
  function boot() {
    renderHeader(document.getElementById("header"));
    renderFooter(document.getElementById("footer"));
    injectIcons();

    var track = document.getElementById("carouselTrack");
    if (track) initHome(track);

    var grid = document.getElementById("productsGrid");
    if (grid) initProductos(grid);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
