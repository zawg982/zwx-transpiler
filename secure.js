document.getElementById('verifyForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const q1 = document.getElementById('q1').value.trim();
  const q2 = document.getElementById('q2').value.trim().toLowerCase();
  const q3 = document.getElementById('q3').value.trim().toLowerCase();

  if (q1 === "2012" && q2 === "basketball" && q3 === "kovid") {
    document.getElementById('status').innerText = "✅ Verified. Redirecting...";
    setTimeout(() => {
      window.location.href = "translator.html";
    }, 1000);
  } else {
    document.getElementById('status').innerText = "❌ Incorrect answers. Closing tab...";
    setTimeout(() => {
      window.close();
      // For browsers that block window.close:
      window.open('', '_self').close();
    }, 1500);
  }
});
