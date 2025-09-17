document.addEventListener("DOMContentLoaded", async () => {
    await loadProfileOverview();
    await renderSimpleOrgChart();
});

// Profile Overview Loader
async function loadProfileOverview() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href="/login.html";
        return;
    }

    try {
        const userRes = await fetch(`https://localhost:5001/profile/${user.userId}`);
        if (!userRes.ok) throw new Error("Failed to load profile");
        const self = await userRes.json();

        const setTextSafe = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };

        setTextSafe("js-manager-name", self.managerName ?? "—");
        setTextSafe("js-direct-reports", self.directReportsCount ?? 0);
        setTextSafe("js-referral-chain", self.referralChain?.length ? self.referralChain.join(" → ") : "—");

        const installersBody = document.getElementById("js-installers-body");
        if (installersBody) {
            installersBody.innerHTML = "";
            if (self.installers?.length) {
                self.installers.forEach(installer => {
                    const tr = `<tr>
                        <th scope="row">${installer.name}</th>
                        <td>${installer.states?.join(", ") || "—"}</td>
                    </tr>`;
                    installersBody.innerHTML += tr;
                });
            } else {
                installersBody.innerHTML = '<tr><td colspan="2" class="text-muted text-center">No approved installers</td></tr>';
            }
        }

        const compBody = document.getElementById("js-compensation-body");
        if (compBody) {
            compBody.innerHTML = "";
            if (self.payouts?.length) {
                self.payouts.forEach(payout => {
                    const tr = `<tr>
                        <th scope="row">${payout.period}</th>
                        <td>${payout.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                    </tr>`;
                    compBody.innerHTML += tr;
                });
            }
            if (self.nextPayout) {
                const tr = `<tr class="fw-bold">
                    <th scope="row">${self.nextPayout.period} (expected)</th>
                    <td>${self.nextPayout.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                </tr>`;
                compBody.innerHTML += tr;
            } else if (!self.payouts?.length) {
                compBody.innerHTML = '<tr><td colspan="2" class="text-muted text-center">No payout data available</td></tr>';
            }
        }

        const docsBody = document.getElementById("js-docs-body");
        if (docsBody) {
            docsBody.innerHTML = "";
            if (self.documents?.length) {
                self.documents.forEach(doc => {
                    const tr = `<tr>
                        <th scope="row">${doc.name}</th>
                        <td><a href="${doc.url}" target="_blank" rel="noopener">Download</a></td>
                    </tr>`;
                    docsBody.innerHTML += tr;
                });
            } else {
                docsBody.innerHTML = '<tr><td colspan="2" class="text-muted text-center">No recent documents</td></tr>';
            }
        }

    } catch (err) {
        console.error("Failed to load overview data:", err);
        ["js-manager-name", "js-direct-reports", "js-referral-chain"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = "Error";
        });
        ["js-installers-body", "js-compensation-body", "js-docs-body"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<tr><td colspan="2" class="text-center text-danger">Error loading data</td></tr>';
        });
    }
}

// Org Chart Loader
async function renderSimpleOrgChart() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href="/login.html";
        return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener('beforeunload', () => controller.abort());

    try {
        const userRes = await fetch(`https://localhost:5001/profile/${user.userId}`, { signal });
        if (!userRes.ok) throw new Error("Failed to load profile");
        const self = await userRes.json();
        const selfCompanyId = self.companyId ?? self.company_id;

        const [registryRes, usersRes] = await Promise.all([
            fetch(`https://localhost:5001/employee_registry`, { signal }),
            fetch(`https://localhost:5001/users`, { signal })
        ]);
        if (!registryRes.ok || !usersRes.ok) throw new Error("Failed to load registry or users");

        const [registry, users] = await Promise.all([
            registryRes.json(), usersRes.json()
        ]);

        const filteredRegistry = registry.filter(emp =>
            String(emp.companyId ?? emp.company_id) === String(selfCompanyId));
        const filteredUsers = users.filter(u =>
            String(u.companyId ?? u.company_id) === String(selfCompanyId));

        const userNameMap = Object.fromEntries(filteredUsers.map(u => [
            String(u.userId), `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
        ]));

        const selfEntry = filteredRegistry.find(emp =>
            String(emp.user_id ?? emp.userId) === String(user.userId));
        if (!selfEntry) {
            document.getElementById('js-org-chart').innerHTML =
                '<div class="text-danger">You are not in the employee registry for this company.</div>';
            return;
        }

        const manager = filteredRegistry.find(emp =>
            String(emp.user_id) === String(selfEntry.manager_id));
        const directs = filteredRegistry.filter(emp =>
            String(emp.manager_id) === String(selfEntry.user_id));

        function personCard(emp, heading = "h2", levelClass = "") {
            const userId = String(emp.user_id ?? emp.userId);
            const name = userNameMap[userId] || emp.name || userId;
            const initials = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
            return `
                <${heading} class="rectangle ${levelClass} d-flex flex-column align-items-center">
                    <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center mb-1"
                        style="width:48px;height:48px;">
                        ${initials}
                    </div>
                    <div class="fw-bold">${name}</div>
                    <div class="small text-secondary">${emp.title ?? ""}</div>
                </${heading}>`;
        }

        let html = `<div class="d-flex flex-column align-items-center">`;
        if (manager) {
            html += personCard(manager, "h3", "level-1") + `<div style="width:2px;height:20px;background:#333;"></div>`;
        }
        html += personCard(selfEntry, "h2", "level-2");
        if (directs.length) {
            html += `<div style="width:2px;height:20px;background:#333;"></div>`;
            html += `<div class="d-flex justify-content-center gap-2">`;
            directs.forEach(dr => html += personCard(dr, "h4", "level-3"));
            html += `</div>`;
        }
        html += `</div>`;
        document.getElementById('js-org-chart').innerHTML = html;

    } catch (err) {
        if (err.name === 'AbortError') {
            console.warn("Fetch aborted due to navigation or reload");
            return;
        }
        console.error("Failed to load org chart:", err);
        document.getElementById('js-org-chart').innerHTML =
            `<div class="text-warning">Error loading org chart: ${err.message}</div>`;
    }
}