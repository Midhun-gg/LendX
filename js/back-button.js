// Back button functionality
document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('backButton');
  if (backButton) {
    backButton.addEventListener('click', function() {
      // Check if there's a previous page in the history
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // If no previous page, go to the home page
        window.location.href = 'index.html';
      }
    });
  }
}); 