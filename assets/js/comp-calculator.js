(() => {
    // Configuration: (modify endpoint URL as needed for the Spark backend API)
    const API_URL = 'https://localhost:5000/sales/{id}/details';

    // Utility: Safely get nested values or default
    const getSafe = (obj, key, defaultVal = 'N/A') => (obj && obj[key] != null ? obj[key] : defaultVal);

    // State: will hold fetched commission data grouped by project type
    let commissionsByType = {};
    let allCommissions = [];

    // Initialize module
    async function initCompensationModule() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`Failed to fetch data (status ${response.status})`);
            const data = await response.json();
            if (!Array.isArray(data)) {
                console.warn('Unexpected data format: expected an array of sales.');
                return;
            }
            allCommissions = data;
            groupDataByProjectType(data);
            renderFilterOptions();
            renderCompensationTable(data);
            attachRowClickHandlers();
        } catch (err) {
            console.error('Error initializing compensation module:', err);
            // UI feedback for error
            const errorDiv = document.createElement('errorDiv');
            errorDiv.className = 'alert alert-danger';
            errorDiv.textContent = 'Failed to load compensation data. Please try again.';
            document.body.prepend(errorDiv);
        }
    }

    // Group data by projectType for filtering (Solar, Roof, Pest, etc.)
    function groupDataByProjectType(data) {
        commissionsByType = {};  // reset grouping
        data.forEach(sale => {
            const type = sale.projectType || 'Other';  // use 'Other' if type is missing
            if (!commissionsByType[type]) commissionsByType[type] = [];
            commissionsByType[type].push(sale);
        });
    }

    // Render filter dropdown for project types
    function renderFilterOptions() {
        const filterSelect = document.getElementById('projectTypeFilter');
        if (!filterSelect) {
            // If no filter dropdown exists in HTML, create one
            const filterContainer = document.getElementById('filterContainer') || document.body;
            const select = document.createElement('select');
            select.id = 'projectTypeFilter';
            select.className = 'form-select mb-3';
            select.innerHTML = `
        <option value="">All Projects</option>
        ${Object.keys(commissionsByType).map(type =>
                `<option value="${type}">${type} Projects</option>`).join('')}`;
            filterContainer.prepend(select);
        } else {
            // Populate existing select
            filterSelect.innerHTML = `
        <option value="">All Projects</option>
        ${Object.keys(commissionsByType).map(type =>
                `<option value="${type}">${type} Projects</option>`).join('')}`;
        }
        // Attach filter change handler
        (document.getElementById('projectTypeFilter') || filterSelect)
            .addEventListener('change', event => {
                const selectedType = event.target.value;
                if (selectedType === "") {
                    renderCompensationTable(allCommissions);
                } else {
                    renderCompensationTable(commissionsByType[selectedType] || []);
                }
                attachRowClickHandlers();  // reattach handlers after re-render
            });
    }

    // Render the compensation summary table
    function renderCompensationTable(data) {
        const tableBody = document.getElementById('compTableBody') || document.createElement('tbody');
        // If table body is not present in DOM, create a table structure
        let tableElement;
        if (!document.getElementById('compTableBody')) {
            tableElement = document.createElement('table');
            tableElement.className = 'table table-striped table-hover';
            const header = document.createElement('thead');
            header.innerHTML = `
        <tr>
            <th>Name</th><th>Role</th><th>Status</th>
            <th>Sale Date</th><th>Project Type</th><th>Total Payout</th>
        </tr>`;
            tableElement.appendChild(header);
            tableBody.id = 'compTableBody';
            tableElement.appendChild(tableBody);
            document.body.appendChild(tableElement);
        } else {
            // Clear existing table body content
            tableBody.innerHTML = '';
        }
        // Populate table rows
        data.forEach((sale, index) => {
            const name = getSafe(sale, 'name');                   // customer name
            const role = getSafe(sale, 'userRole');               // user's role in this sale (e.g. Setter, Closer)
            const status = getSafe(sale, 'status');
            const saleDate = sale.saleDate ? new Date(sale.saleDate).toLocaleDateString() : 'N/A';
            const projectType = getSafe(sale, 'projectType');
            let totalPayout = sale.totalPayout;
            let payoutWarning = false;
            if (totalPayout == null && sale.participants) {
                // If totalPayout missing, compute from participants
                totalPayout = sale.participants.reduce((sum, p) => sum + (p.amount || 0), 0);
                sale.totalPayout = totalPayout;
                payoutWarning = true;  // mark warning because data was incomplete
            } else if (sale.participants) {
                const sumParts = sale.participants.reduce((sum, p) => sum + (p.amount || 0), 0);
                if (Math.abs(sumParts - totalPayout) > 0.01) {  // allow small rounding tolerance
                    payoutWarning = true;  // mismatch between reported total and sum
                }
            }
            // Create table row
            const tr = document.createElement('tr');
            tr.setAttribute('data-index', index);  // store index for lookup on click
            tr.style.cursor = 'pointer';
            tr.innerHTML = `
        <td>${name}</td>
        <td>${role}</td>
        <td>${status}</td>
        <td>${saleDate}</td>
        <td>${projectType}</td>
        <td>${totalPayout != null ? formatCurrency(totalPayout) : 'N/A'}${payoutWarning ? ' <span class="text-warning" title="Payout data incomplete or mismatched">*</span>' : ''}</td>`;
            tableBody.appendChild(tr);
        });
    }

    // Attach click handlers to each table row to open modal with details
    function attachRowClickHandlers() {
        const tableBody = document.getElementById('compTableBody');
        if (!tableBody) return;
        Array.from(tableBody.querySelectorAll('tr')).forEach(row => {
            row.addEventListener('click', () => {
                const idx = row.getAttribute('data-index');
                const saleData = (tableBody.filteredData || allCommissions)[idx];
                if (saleData) {
                    showCommissionModal(saleData);
                }
            });
        });
    }

    // Show Bootstrap modal with detailed commission breakdown for a sale
    function showCommissionModal(sale) {
        // Ensure modal element exists (if not, create it from sample structure)
        let modalElem = document.getElementById('compDetailModal');
        if (!modalElem) {
            modalElem = document.createElement('div');
            modalElem.id = 'compDetailModal';
            modalElem.className = 'modal fade';
            modalElem.setAttribute('tabindex', '-1');
            modalElem.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Commission Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="commissionDetailsContent"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>`;
            document.body.appendChild(modalElem);
        }
        // Populate modal content
        const modalContentDiv = modalElem.querySelector('#commissionDetailsContent');
        if (!modalContentDiv) return;
        modalContentDiv.innerHTML = '';  // clear previous content

        // Title: use sale name or project identifier
        const titleElem = modalElem.querySelector('.modal-title');
        if (titleElem) {
            titleElem.textContent = `Commission Details – ${getSafe(sale, 'name', 'Sale')}`;
        }

        // Build the commission breakdown content (participants table and summary info)
        const parts = sale.participants || [];
        // If participants data is missing but we have totalRevenue and roles, attempt calculation
        let calculatedParts = [];
        if ((!parts || parts.length === 0) && sale.totalRevenue) {
            calculatedParts = calculateCommissionsByFormula(sale);
        }
        const participantsList = parts.length ? parts : calculatedParts;

        // Create participants breakdown table
        let breakdownHTML = `<table class="table table-sm">
        <thead><tr><th>Role</th><th>Name</th><th>Cut</th><th>Amount</th></tr></thead><tbody>`;
        if (participantsList.length > 0) {
            participantsList.forEach(p => {
                const role = getSafe(p, 'role');
                const name = getSafe(p, 'name');
                const cut = getSafe(p, 'cut');  // e.g. "10%" or description of their commission cut
                const amount = p.amount != null ? formatCurrency(p.amount) : 'N/A';
                breakdownHTML += `
                <tr>
                    <td>${role}</td>
                    <td>${name}</td>
                    <td>${cut || '—'}</td>
                    <td>${amount}</td>
                </tr>`;
            });
        } else {
            breakdownHTML += `<tr><td colspan="4" class="text-muted">No commission detail available</td></tr>`;
        }
        breakdownHTML += `</tbody></table>`;

        // Summary info: total revenue, total payout, company profit (MP3), adjustments
        const totalRevenue = sale.totalRevenue != null ? formatCurrency(sale.totalRevenue) : 'N/A';
        const totalPayout = sale.totalPayout != null ? formatCurrency(sale.totalPayout) : (participantsList.length ? formatCurrency(participantsList.reduce((sum, p) => sum + (p.amount || 0), 0)) : 'N/A');
        let companyProfit;
        if (sale.companyMP3 != null) {
            companyProfit = formatCurrency(sale.companyMP3);
        } else {
            // Calculate company profit as remainder if data available
            if (sale.totalRevenue != null) {
                const payoutSum = participantsList.reduce((sum, p) => sum + (p.amount || 0), 0);
                companyProfit = formatCurrency(sale.totalRevenue - payoutSum);
            } else {
                companyProfit = 'N/A';
            }
        }
        // Adjustments (if any)
        let adjustmentsHTML = '';
        if (sale.adjustments) {
            if (Array.isArray(sale.adjustments) && sale.adjustments.length > 0) {
                adjustmentsHTML = '<ul>';
                sale.adjustments.forEach(adj => {
                    if (typeof adj === 'string') {
                        adjustmentsHTML += `<li>${adj}</li>`;
                    } else if (adj.description) {
                        // if adjustment object with description and maybe amount
                        adjustmentsHTML += `<li>${adj.description}${adj.amount ? ' (' + formatCurrency(adj.amount) + ')' : ''}</li>`;
                    }
                });
                adjustmentsHTML += '</ul>';
            } else if (typeof sale.adjustments === 'string') {
                adjustmentsHTML = `<p>${sale.adjustments}</p>`;
            }
        }

        // Append summary info below breakdown table
        breakdownHTML += `
      <div class="mt-3">
        <p><strong>Total Revenue:</strong> ${totalRevenue}</p>
        <p><strong>Total Payout:</strong> ${totalPayout}</p>
        <p><strong>Company Profit (MP3):</strong> ${companyProfit}</p>
        ${adjustmentsHTML ? `<p><strong>Adjustments:</strong>${adjustmentsHTML}</p>` : ''}
      </div>`;
        // Warning for data mismatch
        if (sale.totalPayout != null) {
            const sumParts = participantsList.reduce((sum, p) => sum + (p.amount || 0), 0);
            if (Math.abs(sumParts - (sale.totalPayout || 0)) > 0.01) {
                breakdownHTML += `<p class="text-warning"><em>Note: Discrepancy between total payout and sum of participant payouts.</em></p>`;
            }
        }

        modalContentDiv.innerHTML = breakdownHTML;
        // Show the modal (Bootstrap 5)
        const modal = new bootstrap.Modal(modalElem);
        modal.show();
    }

    // Calculate commissions using formulas (matching backend logic in calculators)
    function calculateCommissionsByFormula(sale) {
        const { projectType, totalRevenue } = sale;
        const participants = [];
        if (!totalRevenue) return participants;
        let total = totalRevenue;
        // Example logic (to be replaced with actual formulas from solar_calculator.cs, roof_calculator.cs, etc.):
        if (projectType === 'Solar') {
            // Example: Suppose Solar commissions: Closer 40%, Setter 10%, Manager 5%, remainder to company
            const closerAmt = 0.40 * total;
            const setterAmt = 0.10 * total;
            const managerAmt = 0.05 * total;
            participants.push({ role: 'Closer', name: '', cut: '40%', amount: closerAmt });
            participants.push({ role: 'Setter', name: '', cut: '10%', amount: setterAmt });
            participants.push({ role: 'Manager', name: '', cut: '5%', amount: managerAmt });
            // Company profit (MP3) would be remainder, calculated later
        } else if (projectType === 'Roof') {
            // Example: Roof commissions (for illustration): Closer 30%, Setter 5%, Manager 5%
            const closerAmt = 0.30 * total;
            const setterAmt = 0.05 * total;
            const managerAmt = 0.05 * total;
            participants.push({ role: 'Closer', name: '', cut: '30%', amount: closerAmt });
            participants.push({ role: 'Setter', name: '', cut: '5%', amount: setterAmt });
            participants.push({ role: 'Manager', name: '', cut: '5%', amount: managerAmt });
        } else if (projectType === 'Pest') {
            // Example: Pest commissions: Closer 20%, Setter 5%, Manager 5%
            const closerAmt = 0.20 * total;
            const setterAmt = 0.05 * total;
            const managerAmt = 0.05 * total;
            participants.push({ role: 'Closer', name: '', cut: '20%', amount: closerAmt });
            participants.push({ role: 'Setter', name: '', cut: '5%', amount: setterAmt });
            participants.push({ role: 'Manager', name: '', cut: '5%', amount: managerAmt });
        } else {
            // Other project types: default distribution (e.g., Closer 30%, remainder to company)
            const closerAmt = 0.30 * total;
            participants.push({ role: 'Closer', name: '', cut: '30%', amount: closerAmt });
        }
        // (In a real scenario, this function would mirror the exact calculations from the backend calculators.)
        return participants;
    }

    // Helper: format number as currency string (assuming USD for example)
    function formatCurrency(amount) {
        return typeof amount === 'number'
            ? `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
            : amount;
    }

    // Start the module on page load
    document.addEventListener('DOMContentLoaded', initCompensationModule);
})();
