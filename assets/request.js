const SPACE_ID = 'c5jg5l1708kd';
const ENVIRONMENT_ID = 'master';
const ACCESS_TOKEN = 'b7o1R1fuGMuQNigcPOSeTYYaHZ8Hy2ApIJMtgcol3Is';
const limit = 8;
const CONTENT_TYPE_ID = 'blogs';
var loadedFlag = false; 
var entries = [];
var includes = [];

function fetchData(){
    fetch(`https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/entries?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      })
        .then(response => {
            if (!response.ok) {
            throw new Error(`Contentful API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            entries = data.items;
            renderTable(entries);
            renderFeaturedPost(data.items[0]);
            loadedFlag = true;
        })
        .catch(error => {
            loadedFlag = true;
        });
}

function fetchPost(post_Id){
    if (!post_Id){
      return 
    }


    return fetch(`https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/entries?sys.id=${post_Id}&content_type=${CONTENT_TYPE_ID}&limit=1&include=1`, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Contentful API error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        return [data.items[0],data.includes]
    })
    .catch(error => {
        loadedFlag = true;
    });
}

function extractTextFromRichText(richText) {
    try {
      const paragraphs = richText.content || [];
      const firstParagraph = paragraphs.find(p => p.nodeType === 'paragraph');
      const text = firstParagraph?.content?.[0]?.value || '';
      return text.length > 100 ? text.substring(0, 100) + '...' : text;
    } catch {
      return '';
    }
  }      
  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function renderTable(data) {
    const $table = $('<div></div>');
    const $thead = $(`
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Date Published</th>
        </tr>
      </thead>
    `);

    const $tbody = $('<div class="row g-2"></div>');

    $.each(data, function (_, entry) {
      const title = entry.fields.title || 'No title';
      const html = renderRichTextToHTML(entry.fields.discription, entry.includes);
      const date = formatDate(entry.sys.createdAt);

      const tmp = document.createElement("div");
      tmp.innerHTML = html;

      const description = tmp.textContent || tmp.innerText || "";
      const $row = $(`
        <div class="col-lg-12 col-md-12">
            <a href="#" data-id='${entry.sys.id}'>
                <ul class="blog-link">
                    <li class="blog-title">${title}</li>
                    <li class="blog-description">${description.slice(0,50)}...</li>
                    <li class="blog-date">${date}</li>
                </ul
            </a>
        </div>
      `);

      $tbody.append($row);
    });

    $table.append($tbody);
    $('#table-container').html('').append($table);
  }
  function renderFeaturedPost(entry, includes) {
    const title = entry.fields.title || 'No title';
    const descriptionHTML = renderRichTextToHTML(entry.fields.discription, includes);
    const date = formatDate(entry.sys.createdAt);

    const post = $(`
        <a href="#" data-id='${entry.sys.id}'>
            <div class="pop-out-when-in blog-mini">
                <div class="blogs-brief">
                    <h3>
                        <svg width="35" height="35" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M0 96C0 43 43 0 96 0L384 0l32 0c17.7 0 32 14.3 32 32l0 320c0 17.7-14.3 32-32 32l0 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0L96 512c-53 0-96-43-96-96L0 96zM64 416c0 17.7 14.3 32 32 32l256 0 0-64L96 384c-17.7 0-32 14.3-32 32zm90.4-234.4l-21.2-21.2c-3 10.1-5.1 20.6-5.1 31.6c0 .2 0 .5 .1 .8s.1 .5 .1 .8L165.2 226c2.5 2.1 3.4 5.8 2.3 8.9c-1.3 3-4.1 5.1-7.5 5.1c-1.9-.1-3.8-.8-5.2-2l-23.6-20.6C142.8 267 186.9 304 240 304s97.3-37 108.9-86.6L325.3 238c-1.4 1.2-3.3 2-5.3 2c-2.2-.1-4.4-1.1-6-2.8c-1.2-1.5-1.9-3.4-2-5.2c.1-2.2 1.1-4.4 2.8-6l37.1-32.5c0-.3 0-.5 .1-.8s.1-.5 .1-.8c0-11-2.1-21.5-5.1-31.6l-21.2 21.2c-3.1 3.1-8.1 3.1-11.3 0s-3.1-8.1 0-11.2l26.4-26.5c-8.2-17-20.5-31.7-35.9-42.6c-2.7-1.9-6.2 1.4-5 4.5c8.5 22.4 3.6 48-13 65.6c-3.2 3.4-3.6 8.9-.9 12.7c9.8 14 12.7 31.9 7.5 48.5c-5.9 19.4-22 34.1-41.9 38.3l-1.4-34.3 12.6 8.6c.6 .4 1.5 .6 2.3 .6c1.5 0 2.7-.8 3.5-2s.6-2.8-.1-4L260 225.4l18-3.6c1.8-.4 3.1-2.1 3.1-4s-1.4-3.5-3.1-3.9l-18-3.7 8.5-14.3c.8-1.2 .9-2.9 .1-4.1s-2-2-3.5-2l-.1 0c-.7 .1-1.5 .3-2.1 .7l-14.1 9.6L244 87.9c-.1-2.2-1.9-3.9-4-3.9s-3.9 1.6-4 3.9l-4.6 110.8-12-8.1c-1.5-1.1-3.6-.9-5 .4s-1.6 3.4-.8 5l8.6 14.3-18 3.7c-1.8 .4-3.1 2-3.1 3.9s1.4 3.6 3.1 4l18 3.8-8.6 14.2c-.2 .6-.5 1.4-.5 2c0 1.1 .5 2.1 1.2 3c.8 .6 1.8 1 2.8 1c.7 0 1.6-.2 2.2-.6l10.4-7.1-1.4 32.8c-19.9-4.1-36-18.9-41.9-38.3c-5.1-16.6-2.2-34.4 7.6-48.5c2.7-3.9 2.3-9.3-.9-12.7c-16.6-17.5-21.6-43.1-13.1-65.5c1.2-3.1-2.3-6.4-5-4.5c-15.3 10.9-27.6 25.6-35.8 42.6l26.4 26.5c3.1 3.1 3.1 8.1 0 11.2s-8.1 3.1-11.2 0z"/></svg>
                        Leatest Post <span>${date}</span>
                    </h3>
                    <p>
                        ${title}
                    </p>
                </div>
            </div>
        </a>
    `);

    $('#featuredPost').html('').append(post);
}

$(document).on('click', '[data-id]', function (e) {
    e.preventDefault();
  
    const entryId = $(this).data('id');
    if (!entryId) return;

    fetchPost(entryId).then(post => {

      const entry = post[0];
      const includes = post[1]
  
      // 1. Title
      $('#modalTitle').text(entry.fields.title || 'Untitled');
    
      // 2. Rich text body
      const html = renderRichTextToHTML(entry.fields.discription, includes);
      $('#modalDescription').html(html);
    

      // Resolve multiple attachments (PDFs, etc.)
      const $attachments = $('#modal-attachments').empty();
      const attachmentLinks = entry.fields.attachments || [];
      const assets = resolveAssetsByIds(attachmentLinks, includes);

      assets.forEach(asset => {
          const file = asset.fields.file;
          const url = file.url.startsWith('//') ? 'https:' + file.url : file.url;
          const name = file.fileName || 'Download';
      
          $attachments.append(`
            <a href="${url}" download target="_blank">${name}</a>
          `);
        });
    
      // 4. Show modal
      $('.blog-modal').modal('show');
    });
});

function resolveAssetsByIds(linkArray, includes) {
    if (!includes?.Asset) return [];
  
    return linkArray
      .map(link => includes.Asset.find(asset => asset.sys.id === link.sys.id))
      .filter(asset => asset && asset.fields?.file);
  }

// function renderRichTextToHTML(richText) {
//     if (!richText || !richText.content) return '';
  
//     const renderNode = (node) => {
//       switch (node.nodeType) {
//         case 'paragraph':
//           return `<p>${node.content.map(renderNode).join('')}</p>`;
//         case 'heading-1':
//           return `<h1>${node.content.map(renderNode).join('')}</h1>`;
//         case 'heading-2':
//           return `<h2>${node.content.map(renderNode).join('')}</h2>`;
//         case 'heading-3':
//           return `<h3>${node.content.map(renderNode).join('')}</h3>`;
//         case 'text':
//           let text = node.value;
//           if (node.marks) {
//             node.marks.forEach(mark => {
//               if (mark.type === 'bold') text = `<strong>${text}</strong>`;
//               if (mark.type === 'italic') text = `<em>${text}</em>`;
//               if (mark.type === 'underline') text = `<u>${text}</u>`;
//             });
//           }
//           return text;
//         case 'unordered-list':
//           return `<ul>${node.content.map(renderNode).join('')}</ul>`;
//         case 'ordered-list':
//           return `<ol>${node.content.map(renderNode).join('')}</ol>`;
//         case 'list-item':
//           return `<li>${node.content.map(renderNode).join('')}</li>`;
//         case 'hyperlink':
//           const url = node.data.uri;
//           const inner = node.content.map(renderNode).join('');
//           return `<a href="${url}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
//         default:
//           return ''; // Skip unknown types
//       }
//     };
  
//     return richText.content.map(renderNode).join('');
//   }
  
  function renderRichTextToHTML(richText, includes = {}) {
    if (!richText || !richText.content) return '';
  
    const findAssetById = (id) => {
      if (!includes.Asset) return null;
      return includes.Asset.find(asset => asset.sys.id === id);
    };
  
    const renderNode = (node) => {
      switch (node.nodeType) {
        case 'paragraph':
          return `<p>${node.content.map(renderNode).join('')}</p>`;
        case 'heading-1':
          return `<h1>${node.content.map(renderNode).join('')}</h1>`;
        case 'heading-2':
          return `<h2>${node.content.map(renderNode).join('')}</h2>`;
        case 'heading-3':
          return `<h3>${node.content.map(renderNode).join('')}</h3>`;
        case 'text':
          let text = node.value;
          node.marks.forEach(mark => {
            if (mark.type === 'bold') text = `<strong>${text}</strong>`;
            if (mark.type === 'italic') text = `<em>${text}</em>`;
            if (mark.type === 'underline') text = `<u>${text}</u>`;
          });
          return text;
        case 'unordered-list':
          return `<ul>${node.content.map(renderNode).join('')}</ul>`;
        case 'ordered-list':
          return `<ol>${node.content.map(renderNode).join('')}</ol>`;
        case 'list-item':
          return `<li>${node.content.map(renderNode).join('')}</li>`;
        case 'hyperlink':
          const url = node.data.uri;
          const linkText = node.content.map(renderNode).join('');
          return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        case 'embedded-asset-block': {
            const assetId = node.data.target.sys.id;
            const asset = findAssetById(assetId);
            if (!asset || !asset.fields?.file?.url) return '';
          
            const file = asset.fields.file;
            const url = file.url.startsWith('//') ? 'https:' + file.url : file.url;
            const alt = asset.fields.title || file.fileName || 'Untitled file';
            const contentType = file.contentType;
          
            if (contentType.startsWith('image/')) {
              // Render image
              return `<img src="${url}" alt="${alt}" style="max-width: 100%; margin: 1rem 0;">`;
            } else {
              // Render download link for other file types
              return `
                <div style="margin: 1rem 0;">
                  📎 <a href="${url}" download target="_blank" style="text-decoration: underline; color: #007bff;">
                    Download ${alt}
                  </a>
                </div>
              `;
            }
          }
        default:
          return '';
      }
    };
  
    return richText.content.map(renderNode).join('');
  }
  
  const attachments = [
    { name: 'Guide.pdf', url: '/downloads/guide.pdf' },
    { name: 'Sample.zip', url: '/downloads/sample.zip' }
  ];
  
  $('#modal-attachments').empty();
  
  attachments.forEach(att => {
    $('#modal-attachments').append(`
      <a href="${att.url}" download>${att.name}</a>
    `);
  });
// Fetching dinamicly directly from contactful
//   $(document).on('click', '[data-id]', function (e) {
//     e.preventDefault();
//     const entryId = $(this).data('id');
  
//     // Later you can do this:
//     fetch(`https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT_ID}/entries/${entryId}`, {
//       headers: {
//         'Authorization': `Bearer ${ACCESS_TOKEN}`
//       }
//     })
//       .then(res => res.json())
//       .then(entry => {
//         const html = renderRichTextToHTML(entry.fields.discription);
//         $('#modalTitle').text(entry.fields.title);
//         $('#modalDescription').html(html);
//         $('.blog-modal').modal('show');
//       });
//   });
  