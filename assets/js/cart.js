(function () {
  'use strict';

  var STORAGE_KEY = 'nsw_quote_cart';

  var Cart = {
    items: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        return [];
      }
    },
    save: function (arr) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('cart:changed'));
    },
    add: function (productId) {
      if (!productId) return false;
      var arr = Cart.items();
      if (arr.indexOf(productId) !== -1) return false;
      arr.push(productId);
      Cart.save(arr);
      return true;
    },
    remove: function (productId) {
      var arr = Cart.items().filter(function (id) { return id !== productId; });
      Cart.save(arr);
    },
    clear: function () {
      Cart.save([]);
    },
    count: function () {
      return Cart.items().length;
    },
    has: function (productId) {
      return Cart.items().indexOf(productId) !== -1;
    },
    serialize: function () {
      var products = window.NSW_PRODUCTS || {};
      var lines = Cart.items().map(function (id, i) {
        var p = products[id];
        if (!p) return (i + 1) + '. ' + id + ' (unknown product)';
        return (i + 1) + '. ' + p.name + ' [' + p.category + ' / ' + p.class + ' / ' + p.role + ']';
      });
      return lines.length ? lines.join('\n') : '(empty cart)';
    }
  };

  window.NSWCart = Cart;

  function injectStyles() {
    if (document.getElementById('nsw-cart-styles')) return;
    var css = [
      '#cart-toggle{position:relative;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;color:var(--white);text-decoration:none;cursor:pointer;border:1px solid var(--border-sub);background:transparent;transition:border-color .2s,color .2s;margin-right:14px;}',
      '#cart-toggle:hover{border-color:var(--orange);color:var(--orange);}',
      '#cart-count{position:absolute;top:-7px;right:-7px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--orange);color:#000;font-family:var(--f-ui),sans-serif;font-size:10px;font-weight:700;line-height:18px;text-align:center;letter-spacing:0;display:none;}',
      '#cart-count.has-items{display:block;}',
      '#cart-overlay{position:fixed;inset:0;background:rgba(7,9,11,.72);backdrop-filter:blur(4px);z-index:1000;opacity:0;pointer-events:none;transition:opacity .25s;}',
      '#cart-overlay.open{opacity:1;pointer-events:all;}',
      '#cart-drawer{position:fixed;top:0;right:0;bottom:0;width:420px;max-width:100vw;background:var(--surface);border-left:1px solid var(--border);z-index:1001;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .3s ease;box-shadow:-30px 0 60px rgba(0,0,0,.5);}',
      '#cart-drawer.open{transform:translateX(0);}',
      '.cart-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:22px 26px;border-bottom:1px solid var(--border-sub);}',
      '.cart-drawer-head h3{font-family:var(--f-display),sans-serif;font-size:16px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--white);}',
      '.cart-drawer-head .cart-close{background:none;border:none;color:var(--muted2);cursor:pointer;font-size:22px;line-height:1;padding:4px 8px;transition:color .2s;}',
      '.cart-drawer-head .cart-close:hover{color:var(--orange);}',
      '.cart-drawer-body{flex:1;overflow-y:auto;padding:18px 22px;}',
      '.cart-empty{text-align:center;padding:60px 20px;color:var(--muted);}',
      '.cart-empty-icon{font-size:38px;opacity:.35;margin-bottom:14px;}',
      '.cart-empty-title{font-family:var(--f-display),sans-serif;font-size:15px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;margin-bottom:8px;color:var(--muted2);}',
      '.cart-empty-sub{font-size:12.5px;line-height:1.6;color:var(--muted);}',
      '.cart-item{display:flex;gap:14px;padding:14px;background:var(--surface2);border:1px solid var(--border-sub);margin-bottom:10px;align-items:center;}',
      '.cart-item-thumb{width:64px;height:48px;background:var(--surface3);object-fit:cover;flex-shrink:0;}',
      '.cart-item-info{flex:1;min-width:0;}',
      '.cart-item-name{font-family:var(--f-display),sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;color:var(--white);line-height:1.2;margin-bottom:5px;letter-spacing:.04em;overflow:hidden;text-overflow:ellipsis;}',
      '.cart-item-meta{font-family:var(--f-ui),sans-serif;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}',
      '.cart-item-remove{background:none;border:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:6px 8px;transition:color .2s;flex-shrink:0;}',
      '.cart-item-remove:hover{color:var(--orange);}',
      '.cart-drawer-foot{padding:18px 22px 22px;border-top:1px solid var(--border-sub);}',
      '.cart-foot-line{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;font-family:var(--f-ui),sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}',
      '.cart-foot-line strong{color:var(--orange);font-weight:700;}',
      '.cart-checkout{width:100%;justify-content:center;margin-bottom:8px;}',
      '.cart-clear{width:100%;background:none;border:1px solid var(--border-sub);color:var(--muted2);font-family:var(--f-ui),sans-serif;font-size:10.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;padding:9px;cursor:pointer;transition:color .2s,border-color .2s;}',
      '.cart-clear:hover{color:var(--orange);border-color:var(--orange);}',
      '.prod-add-cart{font-family:var(--f-ui),sans-serif;font-size:9.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;background:transparent;color:var(--muted2);border:1px solid var(--border-sub);padding:7px 12px;cursor:pointer;transition:all .2s;}',
      '.prod-add-cart:hover{border-color:var(--orange);color:var(--orange);}',
      '.prod-add-cart.in-cart{border-color:var(--orange);color:var(--orange);background:var(--orange-dim);}',
      '.cart-summary-banner{background:var(--surface2);border:1px solid var(--orange);border-left-width:3px;padding:18px 20px;margin-bottom:24px;}',
      '.cart-summary-banner h4{font-family:var(--f-display),sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.18em;color:var(--orange);margin-bottom:10px;}',
      '.cart-summary-banner ul{list-style:none;margin:0;padding:0;}',
      '.cart-summary-banner li{font-family:var(--f-ui),sans-serif;font-size:12px;color:var(--white);padding:4px 0;letter-spacing:.04em;}',
      '.cart-summary-banner li::before{content:"▸ ";color:var(--orange);}',
      '.nsw-hidden{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;}',
      '@media(max-width:640px){#cart-drawer{width:100vw;}#cart-toggle{margin-right:8px;}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'nsw-cart-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function renderBadge() {
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    var n = Cart.count();
    badge.textContent = n;
    badge.classList.toggle('has-items', n > 0);
  }

  function renderDrawer() {
    var body = document.querySelector('#cart-drawer .cart-drawer-body');
    var foot = document.querySelector('#cart-drawer .cart-drawer-foot');
    if (!body || !foot) return;
    var products = window.NSW_PRODUCTS || {};
    var ids = Cart.items();

    if (ids.length === 0) {
      body.innerHTML =
        '<div class="cart-empty">' +
          '<div class="cart-empty-icon">⚙</div>' +
          '<div class="cart-empty-title">Quote Cart Empty</div>' +
          '<div class="cart-empty-sub">Add ships from the Product Lineup to request a quote on multiple vessels at once.</div>' +
        '</div>';
      foot.style.display = 'none';
      return;
    }

    foot.style.display = 'block';
    body.innerHTML = ids.map(function (id) {
      var p = products[id] || { name: id, image: '', category: '?', class: '?', role: '?' };
      var img = p.image
        ? '<img class="cart-item-thumb" src="' + escapeAttr(p.image) + '" alt="' + escapeAttr(p.name) + '">'
        : '<div class="cart-item-thumb"></div>';
      return (
        '<div class="cart-item">' +
          img +
          '<div class="cart-item-info">' +
            '<div class="cart-item-name">' + escapeHtml(p.name) + '</div>' +
            '<div class="cart-item-meta">' + escapeHtml(p.category + ' · ' + p.class + ' · ' + p.role) + '</div>' +
          '</div>' +
          '<button type="button" class="cart-item-remove" data-remove="' + escapeAttr(id) + '" aria-label="Remove">×</button>' +
        '</div>'
      );
    }).join('');

    foot.innerHTML =
      '<div class="cart-foot-line"><span>Items in Quote</span><strong>' + ids.length + '</strong></div>' +
      '<a href="index.html?from-cart=1#contact" class="btn btn-primary cart-checkout">' +
        'Proceed to Quote Form' +
        '<svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5h12M8 1l5 4-5 4" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</a>' +
      '<button type="button" class="cart-clear" data-clear-cart>Clear All</button>';
  }

  function injectAddCartButtons() {
    document.querySelectorAll('.prod-card[data-product-id]').forEach(function (card) {
      var footer = card.querySelector('.prod-footer');
      if (!footer || footer.querySelector('.prod-add-cart')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'prod-add-cart';
      btn.setAttribute('data-product-id', card.getAttribute('data-product-id'));
      btn.textContent = '+ Add to Quote';
      footer.appendChild(btn);
    });
  }

  function renderAddCartButtons() {
    var ids = Cart.items();
    document.querySelectorAll('.prod-add-cart').forEach(function (btn) {
      var id = btn.getAttribute('data-product-id');
      var inCart = ids.indexOf(id) !== -1;
      btn.classList.toggle('in-cart', inCart);
      btn.textContent = inCart ? '✓ In Quote' : '+ Add to Quote';
    });
  }

  function openDrawer() {
    var drawer = document.getElementById('cart-drawer');
    var overlay = document.getElementById('cart-overlay');
    if (!drawer) return;
    renderDrawer();
    drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    var drawer = document.getElementById('cart-drawer');
    var overlay = document.getElementById('cart-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function ensureDrawerMarkup() {
    if (document.getElementById('cart-drawer')) return;
    var overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    var drawer = document.createElement('aside');
    drawer.id = 'cart-drawer';
    drawer.setAttribute('aria-label', 'Quote Cart');
    drawer.innerHTML =
      '<div class="cart-drawer-head">' +
        '<h3>Quote Cart</h3>' +
        '<button type="button" class="cart-close" aria-label="Close">×</button>' +
      '</div>' +
      '<div class="cart-drawer-body"></div>' +
      '<div class="cart-drawer-foot"></div>';
    document.body.appendChild(overlay);
    document.body.appendChild(drawer);
  }

  function ensureNavCartIcon() {
    if (document.getElementById('cart-toggle')) return;
    var nav = document.querySelector('nav');
    if (!nav) return;
    var quoteBtn = nav.querySelector('.btn-primary');
    var toggle = document.createElement('button');
    toggle.id = 'cart-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open Quote Cart');
    toggle.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none">' +
        '<path d="M2 3h2l1.5 9.5a1.5 1.5 0 0 0 1.5 1.3h7.2a1.5 1.5 0 0 0 1.5-1.2L17 6H5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<circle cx="7" cy="16" r="1" stroke="currentColor" stroke-width="1.4"/>' +
        '<circle cx="14" cy="16" r="1" stroke="currentColor" stroke-width="1.4"/>' +
      '</svg>' +
      '<span id="cart-count">0</span>';
    if (quoteBtn) {
      nav.insertBefore(toggle, quoteBtn);
    } else {
      nav.appendChild(toggle);
    }
  }

  function bindEvents() {
    document.addEventListener('click', function (e) {
      var addBtn = e.target.closest('.prod-add-cart');
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        var id = addBtn.getAttribute('data-product-id');
        if (Cart.has(id)) {
          Cart.remove(id);
        } else {
          Cart.add(id);
        }
        return;
      }
      var toggleBtn = e.target.closest('#cart-toggle');
      if (toggleBtn) {
        e.preventDefault();
        openDrawer();
        return;
      }
      var closeBtn = e.target.closest('#cart-drawer .cart-close');
      if (closeBtn) {
        e.preventDefault();
        closeDrawer();
        return;
      }
      var overlay = e.target.closest('#cart-overlay');
      if (overlay && e.target.id === 'cart-overlay') {
        closeDrawer();
        return;
      }
      var removeBtn = e.target.closest('[data-remove]');
      if (removeBtn) {
        e.preventDefault();
        Cart.remove(removeBtn.getAttribute('data-remove'));
        return;
      }
      var clearBtn = e.target.closest('[data-clear-cart]');
      if (clearBtn) {
        e.preventDefault();
        if (confirm('Clear all items from the quote cart?')) Cart.clear();
        return;
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });

    document.addEventListener('cart:changed', function () {
      renderBadge();
      renderDrawer();
      renderAddCartButtons();
    });
  }

  function wireQuoteForm() {
    var form = document.getElementById('quote-form');
    if (!form) return;

    var hidden = form.querySelector('#quote-cart-items');
    function syncHidden() {
      if (hidden) hidden.value = Cart.serialize();
    }
    syncHidden();
    document.addEventListener('cart:changed', syncHidden);
    form.addEventListener('submit', syncHidden);

    var params = new URLSearchParams(window.location.search);
    if (params.get('from-cart') === '1' && Cart.count() > 0) {
      var inquiry = form.querySelector('select[name="inquiry-type"]');
      if (inquiry) {
        for (var i = 0; i < inquiry.options.length; i++) {
          if (inquiry.options[i].value === 'Quote for Cart Items') {
            inquiry.selectedIndex = i;
            break;
          }
        }
      }
      var msg = form.querySelector('textarea[name="message"]');
      if (msg && !msg.value) {
        msg.value = 'Please send a quote for the following vessels:\n\n' + Cart.serialize();
      }
    }

    var contactSection = document.getElementById('contact');
    if (contactSection && Cart.count() > 0) {
      var existing = contactSection.querySelector('.cart-summary-banner');
      if (!existing) {
        var products = window.NSW_PRODUCTS || {};
        var lis = Cart.items().map(function (id) {
          var p = products[id];
          return '<li>' + escapeHtml(p ? p.name : id) + '</li>';
        }).join('');
        var banner = document.createElement('div');
        banner.className = 'cart-summary-banner';
        banner.innerHTML =
          '<h4>Quote Cart · ' + Cart.count() + ' vessel' + (Cart.count() === 1 ? '' : 's') + '</h4>' +
          '<ul>' + lis + '</ul>';
        var formCol = form.closest('.au') || form.parentElement;
        if (formCol) formCol.insertBefore(banner, formCol.firstChild);
      }
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function init() {
    injectStyles();
    ensureNavCartIcon();
    ensureDrawerMarkup();
    injectAddCartButtons();
    bindEvents();
    renderBadge();
    renderAddCartButtons();
    wireQuoteForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
