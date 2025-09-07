// myprofile.js

document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  loadApprovedStates();
  loadOtherData();  // …and any other fetches you need
});

async function loadUserInfo() {
  try {
    const res = await fetch('/api/users/me'); //update the endpoint to the API
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const user = await res.json();

    // Populate each field—these IDs match the spans (or <p>) you gave them
    document.getElementById('js-user-name').textContent   = user.name;
    document.getElementById('js-user-role').textContent   = user.role;
    document.getElementById('js-user-region').textContent = user.region;
    document.getElementById('js-user-office').textContent = user.office;

    // Format the goal as currency, e.g. “$250,000”
    const goalElem = document.getElementById('js-user-goal');
    goalElem.textContent = user.incomeGoal
      ? user.incomeGoal.toLocaleString(undefined, {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        })
      : '—';

  } catch (e) {
    console.error('User info failed', e);

    // Optionally show an error in the UI
    ['js-user-name','js-user-role','js-user-region','js-user-office','js-user-goal']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = 'Error';
      });
  }
}

async function loadApprovedStates() {
  try {
    const res = await fetch('/api/states/prices'); //update the endpoint to the API
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const tbody = document.getElementById('js-approved-states-body');
    tbody.innerHTML = '';  // clear existing rows

    data.forEach(item => {
      // build <tr>
      const tr = document.createElement('tr');

      // <th scope="row">State</th>
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = item.state;

      // <td>$Price</td>
      const td = document.createElement('td');
      td.textContent = `$${item.pricePerWatt.toFixed(2)}`;

      // assemble & append
      tr.appendChild(th);
      tr.appendChild(td);
      tbody.appendChild(tr);
    });
  } 
  catch (e) {
    console.error('States failed', e);
    // show an error row if something goes wrong
    const tbody = document.getElementById('js-approved-states-body');
    tbody.innerHTML = `<tr><td colspan="2" class="text-center text-danger">
                         Error loading data
                       </td></tr>`;
  }
}

async function loadOtherData() {
  // another fetch + DOM update
}
