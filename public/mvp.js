document.addEventListener("DOMContentLoaded", function (){
    const skipButton = document.querySelector('.week2_button');
      // Used to jump the page to week 2
    function jumpToWeek2() {
        const week2Element = document.querySelector('.week2');
        week2Element.scrollIntoView({ behavior: 'smooth' });
      }

    skipButton.addEventListener("click", function(event){
        event.preventDefault();
        jumpToWeek2();
    });


});