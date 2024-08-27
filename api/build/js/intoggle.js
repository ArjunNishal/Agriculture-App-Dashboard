$(document).ready(function () {
  // Select all number input elements in your project
  $('input[type="number"]').each(function () {
    // Set min attribute to 0
    $(this).attr("min", "0");

    // Attach onwheel event to prevent scrolling
    $(this).on("wheel", function (e) {
      e.preventDefault();
    });
  });
});
