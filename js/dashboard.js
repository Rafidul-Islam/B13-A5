(function () {
  const ISSUES_API = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
  const SEARCH_API =
    "https://phi-lab-server.vercel.app/api/v1/lab/issues/search";

  let allIssues = [];
  let currentTab = "all";
  let searchTimeout = null;
  let lastSearchQuery = "";

  const spinnerWrap = document.getElementById("spinnerWrap");
  const issuesGrid = document.getElementById("issuesGrid");
  const emptyState = document.getElementById("emptyState");
  const issueCountEl = document.getElementById("issueCount");
  const searchInput = document.getElementById("searchInput");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");

  function formatDate(isoString) {
    const d = new Date(isoString);
    return d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
  }

  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function setLoading(loading) {
    if (loading) {
      spinnerWrap.classList.remove("hidden");
      issuesGrid.classList.add("hidden");
      emptyState.hidden = true;
    } else {
      spinnerWrap.classList.add("hidden");
      issuesGrid.classList.remove("hidden");
    }
  }

  function filterByTab(list) {
    if (currentTab === "all") return list;
    return list.filter(function (issue) {
      return issue.status === currentTab;
    });
  }

  function renderCards(issues) {
    issuesGrid.innerHTML = "";
    issueCountEl.textContent =
      issues.length + " Issue" + (issues.length !== 1 ? "s" : "");
    emptyState.hidden = issues.length > 0;

    issues.forEach(function (issue) {
      const card = document.createElement("div");
      card.className = "issue-card border-" + issue.status;
      card.setAttribute("data-id", issue.id);

      const prioritySlug = String(issue.priority || "")
        .trim()
        .toLowerCase();

      const labelsHtml = (issue.labels || [])
        .map(function (label) {
          const slug = String(label || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
          let cls = "issue-card-label";
          if (slug) {
            cls += " label-" + slug;
          }
          return '<span class="' + cls + '">' + escapeHtml(label) + "</span>";
        })
        .join("");

      card.innerHTML = `
        <div class="issue-card-header">
          <div class="issue-card-top">
            <img src="${
              issue.status === "open"
                ? "./assets/open.png"
                : "./assets/close.png"
            }" alt="${escapeHtml(issue.status)}" class="issue-card-status-icon">
            <span class="issue-card-priority ${
              prioritySlug ? "priority-" + prioritySlug : ""
            }">${escapeHtml((issue.priority || "").toUpperCase())}</span>
          </div>
          <h3 class="issue-card-title">${escapeHtml(issue.title)}</h3>
        </div>

        <p class="issue-card-desc">${escapeHtml(issue.description || "")}</p>
        ${labelsHtml ? `<div class="issue-card-labels">${labelsHtml}</div>` : ""}
        <div class="issue-card-footer">
          <div class="issue-card-meta">
            #${issue.id} by <span class="author">${escapeHtml(issue.author || "")}</span>
          </div>
          <div class="issue-card-date">${formatDate(issue.createdAt)}</div>
        </div>
      `;

      card.addEventListener("click", function () {
        openModal(issue);
      });
      issuesGrid.appendChild(card);
    });
  }

  function loadIssues() {
    setLoading(true);
    fetch(ISSUES_API)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (data.status === "success" && Array.isArray(data.data)) {
          allIssues = data.data;
          console.log(allIssues);
          lastSearchQuery = "";
          renderCards(filterByTab(allIssues));
        } else {
          renderCards([]);
        }
      })
      .catch(function () {
        renderCards([]);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  //Modal Logic
  function openModal(issue) {
    modalTitle.textContent = issue.title;

    const labelsHtml =
      issue.labels && issue.labels.length
        ? `<div class="modal-labels-list">
            ${issue.labels
              .map((label) => {
                const slug = String(label || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-");

                let cls = "issue-card-label";
                if (slug) cls += ` label-${slug}`;

                return `<span class="${cls}">${escapeHtml(label)}</span>`;
              })
              .join("")}
          </div>`
        : "—";

    modalBody.innerHTML = `
      <div class="modal-row flex items-center justify-left gap-2">
        <span class="modal-label stat ${issue.status === "open" ? "open-stat" : "close-stat"}">
          ${escapeHtml(issue.status)}
        </span>

        <span class="modal-label flex">
        opened by ${escapeHtml(issue.author || "")} on ${formatDate(issue.createdAt)}
        </span>
        
      </div>
      
      <div class="modal-row">
        <span class="modal-label"></span>
        ${labelsHtml}
      </div>

      <div class="modal-row">
        <span class="modal-label"></span>
        ${escapeHtml(issue.description || "")}
      </div>
  
  
      <div class="flex items-start justify-between bg-[#F8FAFC] py-2 border-rounded-lg">
        <div class="modal-row w-1/2" >
          <span class="modal-label">Assignee <br>
            <span class="font-bold text-black">${escapeHtml(issue.assignee.toUpperCase().replace("_", " ") || "—")}</span>
          </span>
        </div>
  
        <div class="modal-row w-1/2">
          <span class="modal-label ">
          Priority <br>
             <span class="${issue.priority} priority">${escapeHtml(issue.priority.toUpperCase() || "")}</span>
          </span>
        </div>
      </div>
  
    `;

    modalOverlay.hidden = false;
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  (() => {
    modalClose.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
    });
  })();

  function initTabs() {
    document.querySelectorAll(".tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const tab = this.getAttribute("data-tab");
        currentTab = tab;
        document.querySelectorAll(".tab").forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute(
            "aria-selected",
            b.getAttribute("data-tab") === tab ? "true" : "false",
          );
        });
        this.classList.add("active");
        this.setAttribute("aria-selected", "true");

        if (lastSearchQuery) {
          doSearch(lastSearchQuery);
        } else {
          renderCards(filterByTab(allIssues));
        }
      });
    });
  }

  // Search Logic
  function doSearch(query) {
    const q = (query || "").trim();
    lastSearchQuery = q;
    if (!q) {
      renderCards(filterByTab(allIssues));
      return;
    }
    setLoading(true);
    fetch(SEARCH_API + "?q=" + encodeURIComponent(q))
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        const list =
          data.status === "success" && Array.isArray(data.data)
            ? data.data
            : [];
        renderCards(filterByTab(list));
      })
      .catch(function () {
        renderCards([]);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  function initSearch() {
    searchInput.addEventListener("input", function () {
      const value = this.value.trim();
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function () {
        if (value) {
          doSearch(value);
        } else {
          lastSearchQuery = "";
          renderCards(filterByTab(allIssues));
        }
      }, 300);
    });

    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        if (searchTimeout) clearTimeout(searchTimeout);
        doSearch(this.value.trim());
      }
    });
  }

  initSearch();
  initTabs();
  loadIssues();
})();
