$(document).ready(function() {
    $(".title").lettering();
    $(".button").lettering();
  });
  
  $(document).ready(function() {
    animation();
  }, 1000);
  
  $('.button').click(function() {
    animation();
  });
  
  
  function animation() {
    var title1 = new TimelineMax();
    title1.to(".button", 0, {visibility: 'hidden', opacity: 0})
    title1.staggerFromTo(".title span", 0.5, 
    {ease: Back.easeOut.config(1.7), opacity: 0, bottom: -80},
    {ease: Back.easeOut.config(1.7), opacity: 1, bottom: 0}, 0.05);
    title1.to(".button", 0.2, {visibility: 'visible' ,opacity: 1})
  }


  $(document).ready(function() {
    var numberOfStars = 200; // Number of stars

    // Function to create a star
    function createStar() {
        var starLeft = Math.random() * $(window).width(); // Random horizontal position
        var starTop = Math.random() * $(window).height(); // Random vertical position

        var starSize = Math.random() * 2; // Random size between 1 and 2px

        var starAnimationDuration = 1 + Math.random() * 0.5; // Random duration between 1 and 1.5s

        var starColor = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`; // Random opacity for a more natural look

        $('<div class="star"></div>').appendTo('.stars').css({
            left: starLeft,
            top: starTop,
            width: starSize + 'px',
            height: starSize + 'px',
            background: starColor,
            animationDuration: starAnimationDuration + 's'
        });
    }

    // Create stars
    for (var i = 0; i < numberOfStars; i++) {
        createStar();
    }
});
