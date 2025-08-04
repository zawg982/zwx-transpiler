function verify() {
  const a = document.getElementById("q1").value.trim();
  const b = document.getElementById("q2").value.trim().toLowerCase();
  const c = document.getElementById("q3").value.trim().toLowerCase();

  if (a === "2012" && b === "basketball" && c === "kovid") {
    document.getElementById("lockscreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
  } else {
    alert("Verification failed. Closing tab.");
    window.close();
    setTimeout(() => { while (true) {} }, 1000); // fallback freeze
  }
}
