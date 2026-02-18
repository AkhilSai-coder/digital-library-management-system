/* =========================
   SIMPLE DEMO LOGIN
   ========================= */

function login() {
  const id = document.getElementById("userid").value.trim();
  const pass = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!role) {
    alert("Please select a role");
    return;
  }

  // Store session (no validation)
  sessionStorage.setItem("userRole", role);
  sessionStorage.setItem("userId", id || "guest");

  // Redirect based on role
  if (role === "student") location.href = "student-dashboard.html";
  if (role === "faculty") location.href = "faculty-dashboard.html";
  if (role === "librarian") location.href = "librarian-dashboard.html";
}

/* =========================
   DASHBOARD PROTECTION
   ========================= */

function protectDashboard(requiredRole) {
  const role = sessionStorage.getItem("userRole");

  if (!role || role !== requiredRole) {
    alert("Please login first");
    location.href = "login.html";
  }
}

/* =========================
   LOGOUT
   ========================= */

function logout() {
  sessionStorage.clear();
  location.href = "login.html";
}

/* =========================
   CATALOGUE INTERACTIVITY
========================= */

document.addEventListener("DOMContentLoaded", function(){

  const searchInput = document.getElementById("searchInput");
  const deptFilter = document.getElementById("deptFilter");
  const catFilter = document.getElementById("catFilter");
  const books = document.querySelectorAll(".card");
  const countText = document.getElementById("bookCount");

  if(!searchInput) return; // Prevent error on other pages

  function filterBooks(){
    const searchValue = searchInput.value.toLowerCase();
    const deptValue = deptFilter.value;
    const catValue = catFilter.value;

    let visibleCount = 0;

    books.forEach(book => {
      const text = book.innerText.toLowerCase();
      const dept = book.dataset.dept;
      const cat = book.dataset.cat;

      const matchSearch = text.includes(searchValue);
      const matchDept = deptValue === "all" || dept === deptValue;
      const matchCat = catValue === "all" || cat === catValue;

      if(matchSearch && matchDept && matchCat){
        book.style.display = "block";
        visibleCount++;
      } else {
        book.style.display = "none";
      }
    });

    if(countText){
      countText.innerText = visibleCount + " books found";
    }
  }

  searchInput.addEventListener("keyup", filterBooks);
  deptFilter.addEventListener("change", filterBooks);
  catFilter.addEventListener("change", filterBooks);

});

/* =========================
   ISSUE BOOK SYSTEM
========================= */

document.addEventListener("DOMContentLoaded", function(){

  const issueButtons = document.querySelectorAll(".issue-btn");

  if(issueButtons.length === 0) return;

  issueButtons.forEach(btn => {
    btn.addEventListener("click", function(){

      const card = this.closest(".card");
      const title = card.querySelector("h3").innerText;

      let myBooks = JSON.parse(localStorage.getItem("facultyBooks")) || [];

      const today = new Date();
      const due = new Date();
      due.setDate(today.getDate() + 15); // 15 day limit

      myBooks.push({
        title: title,
        issueDate: today.toISOString().split("T")[0],
        dueDate: due.toISOString().split("T")[0],
        status: "active"
      });

      localStorage.setItem("facultyBooks", JSON.stringify(myBooks));

      alert("Book Issued Successfully!");
    });
  });

});
