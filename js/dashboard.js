(function () {
  const ISSUES_API = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
  const SEARCH_API =
    "https://phi-lab-server.vercel.app/api/v1/lab/issues/search";

  let allIssues = [];
  let currentTab = "all";


  const spinnerWrap = document.getElementById("spinnerWrap");
  const issuesGrid = document.getElementById("issuesGrid");
  const emptyState = document.getElementById("emptyState");
  const issueCountEl = document.getElementById("issueCount");
  

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


  loadIssues();
})();
