/* =========================================================
   Contentful blog fetcher
   NOTE: Token below is a public read-only CDA token.
   Anyone can read it once the site is deployed. Rotate the
   token in Contentful and ensure it is scoped to the
   "master" environment, Content Delivery API only.
   ========================================================= */
(function () {
  'use strict';

  const SPACE_ID = 'c5jg5l1708kd';
  const ENVIRONMENT_ID = 'master';
  const ACCESS_TOKEN = 'b7o1R1fuGMuQNigcPOSeTYYaHZ8Hy2ApIJMtgcol3Is';
  const LIMIT = 8;
  const CONTENT_TYPE_ID = 'blogs';

  window.__contentful = { loadedFlag: false, entries: [], includes: null };

  function api(path) {
    return fetch(
      'https://cdn.contentful.com/spaces/' + SPACE_ID +
      '/environments/' + ENVIRONMENT_ID + '/' + path,
      { headers: { 'Authorization': 'Bearer ' + ACCESS_TOKEN } }
    ).then((r) => {
      if (!r.ok) throw new Error('Contentful API error: ' + r.status);
      return r.json();
    });
  }

  function fetchData() {
    api('entries?limit=' + LIMIT + '&order=-sys.createdAt')
      .then((data) => {
        window.__contentful.entries = data.items || [];
        window.__contentful.includes = data.includes || {};
        window.__contentful.loadedFlag = true;

        renderTable(window.__contentful.entries, window.__contentful.includes);
        if (window.__contentful.entries.length) {
          renderFeaturedPost(window.__contentful.entries[0], window.__contentful.includes);
        }
        renderSitemapList(window.__contentful.entries);

        if (typeof window.spotlightAddItems === 'function') {
          const items = (window.__contentful.entries || []).map((e) => ({
            type: 'Blog',
            title: e.fields.title || 'Untitled',
            subtitle: extractTextFromRichText(e.fields.discription) || formatDate(e.sys.createdAt),
            url: 'blogs.html#post-' + e.sys.id,
            tags: ['blog', 'post', 'article'],
            icon: 'doc'
          }));
          window.spotlightAddItems(items);
        }
      })
      .catch(() => {
        window.__contentful.loadedFlag = true;
        const t = document.getElementById('table-container');
        if (t) t.innerHTML = '<p style="padding:24px 0;opacity:.7">Posts are unavailable right now.</p>';
        const sm = document.getElementById('sitemap-blog-list');
        if (sm) sm.innerHTML = '<li><em>Posts are unavailable right now.</em></li>';
      });
  }

  function renderSitemapList(entries) {
    const sm = document.getElementById('sitemap-blog-list');
    if (!sm) return;
    if (!entries || !entries.length) {
      sm.innerHTML = '<li><em>No posts yet.</em></li>';
      return;
    }
    sm.innerHTML = entries.slice(0, 10).map((e) => {
      const title = e.fields.title || 'Untitled';
      const date  = formatDate(e.sys.createdAt);
      return '<li><a href="blogs.html#post-' + e.sys.id + '">' +
                escapeHTML(title) +
             '</a> <small>' + date + '</small></li>';
    }).join('');
  }

  function fetchPost(post_Id) {
    if (!post_Id) return Promise.resolve(null);
    return api(
      'entries?sys.id=' + encodeURIComponent(post_Id) +
      '&content_type=' + CONTENT_TYPE_ID + '&limit=1&include=2'
    ).then((data) => {
      if (!data.items || !data.items.length) return null;
      return [data.items[0], data.includes || {}];
    });
  }

  function extractTextFromRichText(richText) {
    try {
      const paragraphs = (richText && richText.content) || [];
      const firstParagraph = paragraphs.find((p) => p.nodeType === 'paragraph');
      const text = (firstParagraph && firstParagraph.content && firstParagraph.content[0] && firstParagraph.content[0].value) || '';
      return text.length > 100 ? text.slice(0, 100) + '…' : text;
    } catch (e) {
      return '';
    }
  }

  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function renderTable(data, includes) {
    const container = document.getElementById('table-container');
    if (!container) return;

    if (!data.length) {
      container.innerHTML = '<p style="padding:24px 0">No posts yet.</p>';
      return;
    }

    const rows = data.map((entry) => {
      const title = entry.fields.title || 'No title';
      const html = renderRichTextToHTML(entry.fields.discription, includes);
      const date = formatDate(entry.sys.createdAt);
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const description = (tmp.textContent || tmp.innerText || '').trim();
      return (
        '<div class="col-lg-12 col-md-12">' +
          '<a href="#post-' + entry.sys.id + '" data-id="' + entry.sys.id + '">' +
            '<ul class="blog-link">' +
              '<li class="blog-title">' + escapeHTML(title) + '</li>' +
              '<li class="blog-description">' + escapeHTML(description.slice(0, 80)) + (description.length > 80 ? '…' : '') + '</li>' +
              '<li class="blog-date">' + date + '</li>' +
            '</ul>' +
          '</a>' +
        '</div>'
      );
    }).join('');

    container.innerHTML = '<div class="row g-2">' + rows + '</div>';
  }

  function renderFeaturedPost(entry, includes) {
    const target = document.getElementById('featuredPost');
    if (!target) return;
    const title = entry.fields.title || 'No title';
    const date = formatDate(entry.sys.createdAt);
    target.innerHTML =
      '<a href="blogs.html#post-' + entry.sys.id + '" aria-label="Latest blog post: ' + escapeHTML(title) + '">' +
        '<div class="pop-out-when-in blog-mini">' +
          '<div class="blogs-brief">' +
            '<h4><svg width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true"><path d="M0 96C0 43 43 0 96 0L384 0l32 0c17.7 0 32 14.3 32 32l0 320c0 17.7-14.3 32-32 32l0 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0L96 512c-53 0-96-43-96-96L0 96z"/></svg> Latest Post <span>' + date + '</span></h4>' +
            '<hr><p>' + escapeHTML(title) + '</p>' +
          '</div>' +
        '</div>' +
      '</a>';
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  function resolveAssetsByIds(linkArray, includes) {
    if (!includes || !includes.Asset) return [];
    return linkArray
      .map((link) => includes.Asset.find((asset) => asset.sys.id === link.sys.id))
      .filter((asset) => asset && asset.fields && asset.fields.file);
  }

  function renderRichTextToHTML(richText, includes) {
    includes = includes || {};
    if (!richText || !richText.content) return '';

    const findAssetById = (id) => {
      if (!includes.Asset) return null;
      return includes.Asset.find((asset) => asset.sys.id === id);
    };

    const renderNode = (node) => {
      switch (node.nodeType) {
        case 'paragraph': return '<p>' + node.content.map(renderNode).join('') + '</p>';
        case 'heading-1': return '<h1>' + node.content.map(renderNode).join('') + '</h1>';
        case 'heading-2': return '<h2>' + node.content.map(renderNode).join('') + '</h2>';
        case 'heading-3': return '<h3>' + node.content.map(renderNode).join('') + '</h3>';
        case 'text': {
          let text = escapeHTML(node.value);
          (node.marks || []).forEach((mark) => {
            if (mark.type === 'bold') text = '<strong>' + text + '</strong>';
            if (mark.type === 'italic') text = '<em>' + text + '</em>';
            if (mark.type === 'underline') text = '<u>' + text + '</u>';
          });
          return text;
        }
        case 'unordered-list': return '<ul>' + node.content.map(renderNode).join('') + '</ul>';
        case 'ordered-list': return '<ol>' + node.content.map(renderNode).join('') + '</ol>';
        case 'list-item': return '<li>' + node.content.map(renderNode).join('') + '</li>';
        case 'hyperlink': {
          const url = node.data && node.data.uri ? node.data.uri : '#';
          const linkText = node.content.map(renderNode).join('');
          return '<a href="' + escapeHTML(url) + '" target="_blank" rel="noopener noreferrer">' + linkText + '</a>';
        }
        case 'embedded-asset-block': {
          const assetId = node.data && node.data.target && node.data.target.sys.id;
          const asset = findAssetById(assetId);
          if (!asset || !asset.fields || !asset.fields.file) return '';
          const file = asset.fields.file;
          const url = file.url.startsWith('//') ? 'https:' + file.url : file.url;
          const alt = escapeHTML(asset.fields.title || file.fileName || 'Embedded file');
          if (file.contentType && file.contentType.startsWith('image/')) {
            return '<img src="' + escapeHTML(url) + '" alt="' + alt + '" loading="lazy" decoding="async" style="max-width:100%;margin:1rem 0">';
          }
          return '<div style="margin:1rem 0">📎 <a href="' + escapeHTML(url) + '" download target="_blank" rel="noopener">Download ' + alt + '</a></div>';
        }
        default: return '';
      }
    };

    return richText.content.map(renderNode).join('');
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('[data-id]');
    if (!link) return;
    e.preventDefault();

    const entryId = link.getAttribute('data-id');
    if (!entryId) return;

    fetchPost(entryId).then((post) => {
      if (!post) return;
      const entry = post[0];
      const includes = post[1];

      const titleEl = document.getElementById('modalTitle');
      const descEl = document.getElementById('modalDescription');
      if (titleEl) titleEl.textContent = entry.fields.title || 'Untitled';
      if (descEl) descEl.innerHTML = renderRichTextToHTML(entry.fields.discription, includes);

      const attachmentsWrap = document.getElementById('modal-attachments');
      if (attachmentsWrap) {
        attachmentsWrap.innerHTML = '';
        const linkArr = entry.fields.attachments || [];
        const assets = resolveAssetsByIds(linkArr, includes);
        assets.forEach((asset) => {
          const file = asset.fields.file;
          const url = file.url.startsWith('//') ? 'https:' + file.url : file.url;
          const name = file.fileName || 'Download';
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.setAttribute('download', '');
          a.textContent = name;
          attachmentsWrap.appendChild(a);
        });
      }

      history.replaceState(null, '', '#post-' + entryId);

      const modalEl = document.querySelector('.blog-modal');
      if (modalEl && window.bootstrap && window.bootstrap.Modal) {
        window.bootstrap.Modal.getOrCreateInstance(modalEl).show();
      } else if (modalEl && window.jQuery && window.jQuery.fn.modal) {
        window.jQuery(modalEl).modal('show');
      }
    });
  });

  function openFromHash() {
    const m = (location.hash || '').match(/^#post-(.+)$/);
    if (!m) return;
    const tryOpen = () => {
      const el = document.querySelector('[data-id="' + m[1] + '"]');
      if (el) el.click();
      else if (!window.__contentful.loadedFlag) setTimeout(tryOpen, 250);
    };
    tryOpen();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (
      document.getElementById('table-container') ||
      document.getElementById('featuredPost') ||
      document.getElementById('sitemap-blog-list')
    ) {
      fetchData();
      openFromHash();
    }
  });
})();
