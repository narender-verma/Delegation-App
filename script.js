const API_URL = "https://script.google.com/macros/s/AKfycby3OyyGuyWKyT7_TmUd7O_qqs554lIbXof8GnzRI3S1IbaK3TPflUB-w8KGZXpcRgvT/exec";

/* ================= HELPERS ================= */
const $ = id => document.getElementById(id);

function formatDate(dateValue) {
  const d = new Date(dateValue);

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
}

let currentTaskFilter = "all"; 
// all | pending | completed | delayed


/* ================= LOADER ================= */
function showLoader() { $("loader").style.display = "flex"; }
function hideLoader() { $("loader").style.display = "none"; }

/* ================= TOAST ================= */
function showToast(msg) {
  $("toastMsg").innerText = msg;
  $("toast").style.opacity = "1";
  setTimeout(() => $("toast").style.opacity = "0", 2500);
}

/* ================= PAGE SHOW ================= */
function show(pageId) {
  document.querySelectorAll(".login-wrapper, .app")
    .forEach(p => p.style.display = "none");

  const page = $(pageId);
  if (!page) return;

  page.style.display =
    page.classList.contains("login-wrapper") ? "flex" : "block";
}

/* ================= CLEAR INPUTS ================= */
function clearInputs(pageId) {
  const page = $(pageId);
  if (!page) return;

  page.querySelectorAll("input").forEach(i => i.value = "");
}

/* ================= PASSWORD TOGGLE ================= */
function togglePassword(inputId, iconId) {
  const input = $(inputId);
  const icon = $(iconId);
  if (!input || !icon) return;

  icon.onclick = () => {
    input.type = input.type === "password" ? "text" : "password";
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  };
}

/* ===== bind toggles ===== */
togglePassword("adminLoginPassword", "toggleLoginPass");
togglePassword("adminSignupPassword", "toggleSignupPass");
togglePassword("adminSignupConfirm", "toggleSignupConfirm");
togglePassword("doerLoginPassword", "toggleDoerLoginPass");
togglePassword("doerSignupPassword", "toggleDoerSignupPass");
togglePassword("doerSignupConfirm", "toggleDoerSignupConfirm");

/* ================= DASHBOARD SELECTION ================= */
$("adminBtn").onclick = () => show("adminLoginPage");
$("doerBtn").onclick = () => show("doerLoginPage");

/* ================= NAVIGATION ================= */
$("goToAdminSignup").onclick = () => show("adminSignupPage");
$("goToAdminLogin").onclick = () => show("adminLoginPage");
$("goToDoerSignup").onclick = () => show("doerSignupPage");
$("goToDoerLogin").onclick = () => show("doerLoginPage");

/* ================= ADMIN SIGNUP ================= */
$("adminSignupBtn").onclick = async () => {
  const name = $("adminSignupName").value.trim();
  const email = $("adminSignupEmail").value.trim();
  const pass = $("adminSignupPassword").value;
  const confirm = $("adminSignupConfirm").value;

  if (!name || !email || !pass || pass !== confirm)
    return showToast("Invalid signup data");

  showLoader();
  try {
    const res = await fetch(
      `${API_URL}?action=adminSignup&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`
    );
    const data = await res.json();

    if (data.success) {
      showToast("Admin signup successful");
      clearInputs("adminSignupPage");
      show("adminLoginPage");
    } else showToast(data.message ||"Email already exists");
  } finally { hideLoader(); }
};

/* ================= ADMIN LOGIN ================= */
$("adminLoginBtn2").onclick = async () => {
  const email = $("adminLoginEmail").value.trim();
  const pass = $("adminLoginPassword").value;

  if (!email || !pass)
    return showToast("Enter email & password");

  showLoader();
  try {
    const res = await fetch(
      `${API_URL}?action=adminLogin` +
      `&email=${encodeURIComponent(email)}` +
      `&password=${encodeURIComponent(pass)}`
    );

    const data = await res.json();

    if (data.success) {

  localStorage.setItem("adminName", data.adminName);

  $("loggedAdminName").innerText = `👤 Welcome ${data.adminName}`;
  clearInputs("adminLoginPage");
  show("adminPage");

  showLoader();               // ✅ LOADER ON
  await loadDoersForAdmin();
  await loadTasksForAdmin();  // backend calls
  hideLoader();               // ✅ LOADER OFF

 }
 else {
      showToast("Invalid admin login");
    }

  } finally {
    hideLoader();
  }
};


/* ================= ADMIN LOGOUT ================= */
$("logoutBtn").onclick = () => {
  clearInputs("adminLoginPage");
  show("adminLoginPage");
};

/* ================= DOER SIGNUP ================= */
$("doerSignupBtn").onclick = async () => {
  const name = $("doerSignupName").value.trim();
  const email = $("doerSignupEmail").value.trim();
  const pass = $("doerSignupPassword").value;
  const confirm = $("doerSignupConfirm").value;

  if (!name || !email || !pass || pass !== confirm)
    return showToast("Invalid signup data");

  showLoader();
  try {
    const res = await fetch(
      `${API_URL}?action=doerSignup&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`
    );
    const data = await res.json();

    if (data.success) {
      showToast("Doer account created");
      clearInputs("doerSignupPage");
      show("doerLoginPage");
    } else showToast("Email already exists");
  } finally { hideLoader(); }
};

/* ================= DOER LOGIN ================= */
$("doerLoginBtn").onclick = async () => {
  const email = $("doerLoginEmail").value.trim();
  const pass = $("doerLoginPassword").value;

  if (!email || !pass)
    return showToast("Enter email & password");

  showLoader();
  try {
    const res = await fetch(
      `${API_URL}?action=doerLogin&email=${encodeURIComponent(email)}&password=${encodeURIComponent(pass)}`
    );
    const data = await res.json();

    if (data.success) {

  localStorage.setItem("doerEmail", data.email);
  localStorage.setItem("doerLoggedIn", "true"); // ✅ ADD

  const welcomeText = $("doerWelcomeText");
  if (welcomeText) {
    welcomeText.innerText = `Welcome ${data.name}`;
  }

  clearInputs("doerLoginPage");
  show("doerPage");

  showLoader();
  await loadTasksForDoer();
  hideLoader();
  }

 else showToast("Invalid doer login");
  } finally { 
    hideLoader();
  }
};


/* ================= LOAD TASKS (DOER) ================= */
async function loadTasksForDoer() {

  const email = localStorage.getItem("doerEmail");
  if (!email) return;

  showLoader();

  try {
    const res = await fetch(
      `${API_URL}?action=getDoerTasks&email=${encodeURIComponent(email)}`
    );
    const data = await res.json();

    const container = $("doerTaskList");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.className = "task-table";

    table.innerHTML = `
      <thead>
        <tr>
          <th>Task Given By</th>
          <th>Task</th>
          <th>Due Date</th>
          <th>Completed At</th>
          <th>Mark Done</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");
    const now = new Date();

    // ✅ HIDE completed tasks after 15 minutes
    const visibleTasks = (data.tasks || []).filter(t => {
      if (t.status !== "completed") return true;
      if (!t.hideAfter) return true;
      return new Date(t.hideAfter) > now;
    });

    if (visibleTasks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;padding:16px">
            No tasks assigned
          </td>
        </tr>
      `;
      container.appendChild(table);
      return;
    }

    visibleTasks.forEach(t => {
      const tr = document.createElement("tr");
      const deadlineDate = new Date(t.deadline);

      if (t.status === "completed") {
        tr.classList.add("done");
      } else if (t.status === "pending" && deadlineDate < now) {
        tr.classList.add("delayed");
      }

      tr.innerHTML = `
        <td>${t.taskGivenBy}</td>
        <td>${t.text}</td>
        <td>${formatDate(t.deadline)}</td>
        <td>${t.completedAt ? formatDate(t.completedAt) : "-"}</td>
        <td style="text-align:center">
          <input type="checkbox" ${t.status === "completed" ? "checked" : ""}>
        </td>
      `;

      tr.querySelector("input").onchange = async e => {
        const status = e.target.checked ? "completed" : "pending";
        showLoader();
        await fetch(
          `${API_URL}?action=updateTaskStatus&rowIndex=${t.rowIndex}&status=${status}`
        );
        await loadTasksForDoer();
        hideLoader();
      };

      tbody.appendChild(tr);
    });

    container.appendChild(table);

  } catch (err) {
    console.error(err);
    showToast("Server error");
  } finally {
    hideLoader();
  }
}



/* ================= DOER LOGOUT ================= */
$("doerLogoutBtn").onclick = () => {
  localStorage.removeItem("doerEmail");
  localStorage.removeItem("doerLoggedIn");
  clearInputs("doerLoginPage");
  show("doerLoginPage");
};


/* ================= INITIAL LOAD ================= */
window.onload = async () => {

  const isDoerLoggedIn = localStorage.getItem("doerLoggedIn");
  const doerEmail = localStorage.getItem("doerEmail");

  if (isDoerLoggedIn === "true" && doerEmail) {
    show("doerPage");
    showLoader();
    await loadTasksForDoer();
    hideLoader();
    return;
  }

  // default
  show("loginPage");
};


/* ================= BACK BUTTONS ================= */

// Admin
$("backFromAdminLogin").onclick = () => {
  clearInputs("adminLoginPage");
  show("loginPage");
};

$("backFromAdminSignup").onclick = () => {
  clearInputs("adminSignupPage");
  show("adminLoginPage");
};

// Doer
$("backFromDoerLogin").onclick = () => {
  clearInputs("doerLoginPage");
  show("loginPage");
};

$("backFromDoerSignup").onclick = () => {
  clearInputs("doerSignupPage");
  show("doerLoginPage");
};

async function loadDoersForAdmin() {
  try {
    const res = await fetch(`${API_URL}?action=getDoers`);
    const data = await res.json();

    if (!data.success) return;

    const select = $("doerSelect");
    select.innerHTML = `<option value="">Select doer...</option>`;

    data.doers.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d.email;
      opt.textContent = d.name;
      opt.dataset.email = d.email;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Load doers error", err);
  }
}

const doerSelectEl = $("doerSelect");
if (doerSelectEl) {
  doerSelectEl.addEventListener("change", () => {
    const selected = doerSelectEl.selectedOptions[0];
    $("emailSelect").value = selected?.dataset.email || "";
  });
}


/* ================= SAVE TASK (ADMIN) ================= */
const addTaskBtn = $("addTaskBtn");
if (addTaskBtn) {
  addTaskBtn.onclick = async () => {

    const doerSelect = $("doerSelect");
    const doerName = doerSelect.selectedOptions[0]?.textContent;
    const doerEmail = $("emailSelect").value;
    const task = $("taskInput").value.trim();
    const deadline = $("deadlineInput").value;

    if (!doerName || !doerEmail || !task || !deadline) {
      return showToast("All fields required");
    }

    const adminName = localStorage.getItem("adminName") || "Admin";

    showLoader();
    try {
      const res = await fetch(
        `${API_URL}?action=addTask` +
        `&doerName=${encodeURIComponent(doerName)}` +
        `&doerEmail=${encodeURIComponent(doerEmail)}` +
        `&taskGivenBy=${encodeURIComponent(adminName)}` +
        `&task=${encodeURIComponent(task)}` +
        `&deadline=${deadline}`
      );

      const data = await res.json();

      if (data.success) {

        showToast("Task saved");

        /* ✅ FULL RESET AFTER SAVE */
        doerSelect.selectedIndex = 0;     // reset dropdown
        $("emailSelect").value = "";      // clear email
        $("taskInput").value = "";        // clear task
        $("deadlineInput").value = "";    // clear date

        loadTasksForAdmin();              // reload table

      } else {
        showToast(data.message || "Task save failed");
      }

    } catch (err) {
      console.error(err);
      showToast("Server error");
    } finally {
      hideLoader();
    }
  };
}




document.querySelectorAll(".stat-card").forEach(card => {

  card.onclick = async () => {

    // 🔥 ACTIVE CLASS HANDLE
    document.querySelectorAll(".stat-card")
      .forEach(c => c.classList.remove("active"));

    card.classList.add("active");

    // 🔥 FILTER SET
    const filter = card.dataset.filter || "all";
    currentTaskFilter = filter;

    // 🔥 SHOW LOADER
    showLoader();

    // 🔥 LOAD TASKS
    await loadTasksForAdmin();

    // 🔥 HIDE LOADER
    hideLoader();
  };

});




/* ================= LOAD TASKS (ADMIN) ================= */
async function loadTasksForAdmin() {
  try {
    showLoader();

    const res = await fetch(`${API_URL}?action=getTasks`);
    const data = await res.json();

    const container = $("taskList");
    container.innerHTML = "";

    if (!data.success) {
      $("taskCount").innerText = "0 tasks";
      return;
    }

    const allTasks = data.tasks || [];
    const now = new Date();

    /* ================= VISIBLE TASKS (15 MIN RULE) ================= */
    const visibleTasks = allTasks.filter(t => {
      if (t.status !== "completed") return true;
      if (!t.hideAfter) return true;
      return new Date(t.hideAfter) > now;
    });

    /* ================= COUNTS (VISIBLE TASKS ONLY) ================= */
    let pending = 0;
    let completed = 0;
    let delayed = 0;

    visibleTasks.forEach(t => {
      const deadline = new Date(t.deadline);

      if (t.status === "completed") {
        completed++;
      } else if (deadline < now) {
        delayed++;
        pending++;
      } else {
        pending++;
      }
    });

    $("pendingCount").innerText   = pending;
    $("completedCount").innerText = completed;
    $("delayedCount").innerText   = delayed;
    $("allCount").innerText       = visibleTasks.length;

    /* ================= FILTER LOGIC (VISIBLE TASKS) ================= */
    let filteredTasks = visibleTasks;

    if (currentTaskFilter === "pending") {
      filteredTasks = visibleTasks.filter(t => t.status === "pending");
    }

    if (currentTaskFilter === "completed") {
      filteredTasks = visibleTasks.filter(t => t.status === "completed");
    }

    if (currentTaskFilter === "delayed") {
      filteredTasks = visibleTasks.filter(t =>
        t.status === "pending" && new Date(t.deadline) < now
      );
    }

    /* ================= TABLE ================= */
    const table = document.createElement("table");
    table.className = "task-table";

    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Task Given By</th>
          <th>Task</th>
          <th>Due Date</th>
          <th>Completed At</th>
          <th>Mark Done</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    if (filteredTasks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:16px">
            No tasks
          </td>
        </tr>
      `;
      container.appendChild(table);
      $("taskCount").innerText = "0 tasks";
      return;
    }

    filteredTasks.forEach(t => {
      const tr = document.createElement("tr");
      const deadline = new Date(t.deadline);

      if (t.status === "completed") {
        tr.classList.add("done");
      } else if (deadline < now) {
        tr.classList.add("delayed");
      }

      tr.innerHTML = `
        <td>${t.doerName}</td>
        <td>${t.doerEmail}</td>
        <td>${t.taskGivenBy}</td>
        <td>${t.task}</td>
        <td>${formatDate(t.deadline)}</td>
        <td>${t.completedAt ? formatDate(t.completedAt) : "-"}</td>
        <td style="text-align:center">
          <input type="checkbox" ${t.status === "completed" ? "checked" : ""}>
        </td>
        <td>
          <button class="task-delete-btn">Delete</button>
        </td>
      `;

      // ✅ MARK DONE / UNDO
      tr.querySelector("input").onchange = async e => {
        const status = e.target.checked ? "completed" : "pending";
        showLoader();
        await fetch(
          `${API_URL}?action=updateTaskStatus&rowIndex=${t.rowIndex}&status=${status}`
        );
        await loadTasksForAdmin();
        hideLoader();
      };

      // ❌ DELETE (MANUAL)
      tr.querySelector(".task-delete-btn").onclick = async () => {
        if (!confirm("Delete this task?")) return;
        showLoader();
        await fetch(
          `${API_URL}?action=deleteTask&rowIndex=${t.rowIndex}`
        );
        await loadTasksForAdmin();
        hideLoader();
      };

      tbody.appendChild(tr);
    });

    container.appendChild(table);
    $("taskCount").innerText = `${filteredTasks.length} tasks`;

  } catch (err) {
    console.error(err);
    showToast("Server error");
  } finally {
    hideLoader();
  }
}
