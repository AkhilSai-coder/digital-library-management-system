/* =========================
   SIMPLE DEMO LOGIN
   ========================= */

async function login() {

  const email = document.getElementById("userid").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {

    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!response.ok) {
      alert("Invalid credentials");
      return;
    }

    const token = await response.text();  // IMPORTANT (because backend returns String)

    localStorage.setItem("token", token);

    alert("Login success");

    window.location.href = "student-dashboard.html"; // or role based later

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}

/* =========================
   DASHBOARD PROTECTION
   ========================= */
function checkAuth() {

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
  }
}

/* =========================
   LOGOUT
   ========================= */

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
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
