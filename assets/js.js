$(document).ready(function() {
    $('.show-toggle').on('click', function(e) {
        e.preventDefault(); // Prevent default link behavior

        var currentPage = $('.show-toggle.active').data('target');
        var target = $(this).data('target'); 

        $('.show-toggle').removeClass('active');
        $(this).addClass('active');

        if(!(currentPage == target)){
            $(currentPage).slideUp(200, function() {
                $(currentPage).removeClass('show');
                $(target).slideDown(400).addClass('show');
            })
        }

  
        $(target).addClass('show');
    });
    $('section').css('display','none');
    $('section.show').css('display','block');

    $('.action-button').on('click', function(e) {
        e.preventDefault();
        $('.action-menu').slideDown(400).toggleClass('collapsed');
    });
    // Clicking anywhere else hides the menu
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.action-menu, .action-button').length) {
            if (!$('.action-menu').hasClass('collapsed')) {
                $('.action-menu').slideUp(400).addClass('collapsed');
            }
        }
    });

    // Optional: clicking inside menu doesn’t close it
    $('.action-menu').on('click', function (e) {
        e.stopPropagation();
    });


    $('.underConstriction').each(function() {
        $(this).append(`
            <div class="underConstriction-msg">
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M413.5 237.5c-28.2 4.8-58.2-3.6-80-25.4l-38.1-38.1C280.4 159 272 138.8 272 117.6l0-12.1L192.3 62c-5.3-2.9-8.6-8.6-8.3-14.7s3.9-11.5 9.5-14l47.2-21C259.1 4.2 279 0 299.2 0l18.1 0c36.7 0 72 14 98.7 39.1l44.6 42c24.2 22.8 33.2 55.7 26.6 86L503 183l8-8c9.4-9.4 24.6-9.4 33.9 0l24 24c9.4 9.4 9.4 24.6 0 33.9l-88 88c-9.4 9.4-24.6 9.4-33.9 0l-24-24c-9.4-9.4-9.4-24.6 0-33.9l8-8-17.5-17.5zM27.4 377.1L260.9 182.6c3.5 4.9 7.5 9.6 11.8 14l38.1 38.1c6 6 12.4 11.2 19.2 15.7L134.9 484.6c-14.5 17.4-36 27.4-58.6 27.4C34.1 512 0 477.8 0 435.7c0-22.6 10.1-44.1 27.4-58.6z"/></svg>
                    Under Construction
                </span>
            </div> 
        `);
    });
});

$(document).ready(function () {
    // Open modal on button click
    $('#searchTrigger').on('click', function () {
      $('#searchModal').fadeIn(150);
      $('#searchModal input').focus();
    });
  
    // Close modal on close button
    $('#closeSearch').on('click', function () {
      $('#searchModal').fadeOut(150);
    });
  
    // Close on Esc key
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') {
        $('#searchModal').fadeOut(150);
      }
    });
  
    // Ctrl + K shortcut
    $(document).on('keydown', function (e) {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        $('#searchModal').fadeIn(150);
        $('#searchModal input').focus();
      }
    });
  });
  