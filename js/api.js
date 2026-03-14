// ================================================================
//  GRIET Central Library – Optimised API Layer  (api.js)
//  • Single /admin/dashboard call instead of 4 separate calls
//  • Paginated book catalogue with client-side state
//  • Request deduplication (in-flight cache)
//  • Automatic token redirect
// ================================================================

const API_BASE = "https://library-backend-1-e3r2.onrender.com";

// ── In-flight request dedup (prevents double-fetch on fast clicks) ─
const _inFlight = new Map();

function getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return null;
    }
    return token;
}

function getUserInfo() {
    try {
        return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch { return {}; }
}

/**
 * Core fetch wrapper.
 *  - Attaches JWT
 *  - Deduplicates identical in-flight GET requests
 *  - Returns parsed JSON or throws with readable message
 */
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    const method = (options.method || "GET").toUpperCase();
    const fullUrl = API_BASE + url;

    // Dedup: only for GET requests with no body
    const dedupKey = method === "GET" ? fullUrl : null;
    if (dedupKey && _inFlight.has(dedupKey)) {
        return _inFlight.get(dedupKey);
    }

    const promise = fetch(fullUrl, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": token ? "Bearer " + token : "",
            ...(options.headers || {})
        }
    }).then(async res => {
        if (res.status === 401) {
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }
        if (!res.ok) {
            const err = await res.text();
            throw new Error(err || `HTTP ${res.status}`);
        }
        const text = await res.text();
        try { return text ? JSON.parse(text) : null; }
        catch { return text; }
    }).finally(() => {
        if (dedupKey) _inFlight.delete(dedupKey);
    });

    if (dedupKey) _inFlight.set(dedupKey, promise);
    return promise;
}

// ================================================================
//  DASHBOARD  (1 call replaces 4)
// ================================================================

async function fetchDashboard() {
    return apiFetch("/admin/dashboard");
}

// ================================================================
//  BOOKS  (paginated)
// ================================================================

/**
 * Paginated catalogue.
 * @param {object} opts  { page, size, branch, category, available, q }
 * @returns Spring Page<Book>: { content[], totalElements, totalPages, number }
 */
async function fetchBooks(opts = {}) {
    const params = new URLSearchParams();
    params.set("page", opts.page ?? 0);
    params.set("size", opts.size ?? 20);
    if (opts.branch)    params.set("branch",    opts.branch);
    if (opts.category)  params.set("category",  opts.category);
    if (opts.available !== undefined) params.set("available", opts.available);
    if (opts.q)         params.set("q",          opts.q);
    return apiFetch(`/books?${params}`);
}

async function fetchBookFilters() {
    return apiFetch("/books/filters");  // { branches:[], categories:[] }
}

async function fetchBookByAccession(accNum) {
    return apiFetch(`/books/accession/${encodeURIComponent(accNum)}`);
}

async function addBook(bookDTO) {
    return apiFetch("/books/admin/add-book", {
        method: "POST",
        body: JSON.stringify(bookDTO)
    });
}

async function deleteBook(id) {
    return apiFetch(`/books/admin/delete/${id}`, { method: "DELETE" });
}

// ================================================================
//  BORROW / RETURN
// ================================================================

async function getAllBorrows() {
    return apiFetch("/borrow/all");
}

async function borrowBook(bookId, collegeId) {
    return apiFetch(`/borrow/issue?bookId=${bookId}&collegeId=${encodeURIComponent(collegeId)}`, {
        method: "POST"
    });
}

async function returnBook(borrowId) {
    return apiFetch(`/borrow/return/${borrowId}`, { method: "POST" });
}

async function getMyBooks() {
    return apiFetch("/borrow/my");
}

// ================================================================
//  REQUESTS
// ================================================================

async function requestBook(bookId) {
    return apiFetch(`/request/${bookId}`, { method: "POST" });
}

async function getMyRequests() {
    return apiFetch("/request/my");
}

async function getPendingRequests() {
    return apiFetch("/request/pending");
}

async function getPendingCount() {
    return apiFetch("/request/pending-count");
}

async function approveRequest(id) {
    return apiFetch(`/request/approve/${id}`, { method: "POST" });
}

/**
 * ✅ FIX: reject now calls the correct endpoint with optional reason.
 */
async function rejectRequest(id, reason = "") {
    return apiFetch(`/request/reject/${id}`, {
        method: "POST",
        body: JSON.stringify({ reason })
    });
}

// ================================================================
//  MEMBERS
// ================================================================

async function getAllMembers() {
    return apiFetch("/members");
}

async function getMemberDetails(collegeId) {
    return apiFetch(`/members/${encodeURIComponent(collegeId)}`);
}

// ================================================================
//  AUTH
// ================================================================

async function login(collegeId, password) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ collegeId, password })
    });
}

async function changePassword(oldPassword, newPassword) {
    return apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword })
    });
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// ================================================================
//  PAGINATION HELPER  (used by catalogue.html and book-management.html)
// ================================================================

class PaginatedBooks {
    constructor(container, renderFn, opts = {}) {
        this.container = container;
        this.renderFn  = renderFn;
        this.page      = 0;
        this.size      = opts.size || 20;
        this.totalPages = 0;
        this.filters   = {};
        this.loading   = false;
    }

    async load(filters = {}) {
        if (this.loading) return;
        this.loading = true;
        this.filters = filters;
        this.page    = 0;
        try {
            const data = await fetchBooks({ page: 0, size: this.size, ...filters });
            this.totalPages = data.totalPages;
            this.renderFn(data.content, data);
        } finally {
            this.loading = false;
        }
    }

    async nextPage() {
        if (this.page >= this.totalPages - 1) return;
        this.page++;
        await this._fetchPage();
    }

    async prevPage() {
        if (this.page <= 0) return;
        this.page--;
        await this._fetchPage();
    }

    async goTo(n) {
        this.page = Math.max(0, Math.min(n, this.totalPages - 1));
        await this._fetchPage();
    }

    async _fetchPage() {
        if (this.loading) return;
        this.loading = true;
        try {
            const data = await fetchBooks({ page: this.page, size: this.size, ...this.filters });
            this.totalPages = data.totalPages;
            this.renderFn(data.content, data);
        } finally {
            this.loading = false;
        }
    }
}
