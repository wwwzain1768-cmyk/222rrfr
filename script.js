// script.js
let currentLoggedTowerCode = "";
let editCustomerId = null;

function showModal(msg, type, onConfirmCallback) {
    document.getElementById('customModal').style.display = 'flex';
    document.getElementById('modalMsg').innerText = msg;
    let actions = document.getElementById('modalActions');
    actions.innerHTML = "";

    if (type === 'alert') {
        let btn = document.createElement('button');
        btn.className = 'modal-btn btn-confirm';
        btn.innerText = 'حسناً';
        btn.onclick = () => { document.getElementById('customModal').style.display = 'none'; };
        actions.appendChild(btn);
    } else if (type === 'confirm') {
        let btnYes = document.createElement('button');
        btnYes.className = 'modal-btn btn-confirm';
        btnYes.innerText = 'نعم';
        btnYes.onclick = () => { 
            document.getElementById('customModal').style.display = 'none'; 
            if (onConfirmCallback) onConfirmCallback();
        };
        let btnNo = document.createElement('button');
        btnNo.className = 'modal-btn btn-cancel';
        btnNo.innerText = 'إلغاء';
        btnNo.onclick = () => { document.getElementById('customModal').style.display = 'none'; };
        actions.appendChild(btnYes);
        actions.appendChild(btnNo);
    }
}

function showInputModal(msg, onConfirmCallback) {
    document.getElementById('inputModal').style.display = 'flex';
    document.getElementById('inputModalMsg').innerText = msg;
    document.getElementById('inputModalValue').value = "";
    let actions = document.getElementById('inputModalActions');
    actions.innerHTML = "";

    let btnYes = document.createElement('button');
    btnYes.className = 'modal-btn btn-confirm';
    btnYes.innerText = 'تأكيد';
    btnYes.onclick = () => { 
        let val = document.getElementById('inputModalValue').value;
        document.getElementById('inputModal').style.display = 'none'; 
        if (onConfirmCallback) onConfirmCallback(val);
    };
    let btnNo = document.createElement('button');
    btnNo.className = 'modal-btn btn-cancel';
    btnNo.innerText = 'إلغاء';
    btnNo.onclick = () => { document.getElementById('inputModal').style.display = 'none'; };
    
    actions.appendChild(btnYes);
    actions.appendChild(btnNo);
}

function checkCode() {
    let enteredCode = document.getElementById('enteredCode').value;
    let errorMsg = document.getElementById('error-msg');
    
    let savedData = localStorage.getItem('towersData');
    if (!savedData) { 
        errorMsg.innerText = "لا توجد أبراج مسجلة! تأكد من إنشائها في موقع الإدارة أولاً."; 
        return; 
    }

    let towersArray = JSON.parse(savedData);
    let foundTower = null;

    for (let i = 0; i < towersArray.length; i++) {
        if (towersArray[i].towerCode === enteredCode) { 
            foundTower = towersArray[i]; 
            break; 
        }
    }

    if (foundTower) {
        errorMsg.innerText = ""; 
        currentLoggedTowerCode = foundTower.towerCode; 
        
        document.getElementById('greeting-text').innerText = `هل أنت الأستاذ/ة ${foundTower.ownerName}؟`;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('greeting-section').style.display = 'flex';
    } else {
        errorMsg.innerText = "كلمة السر (الرمز) غير صحيحة، يرجى المحاولة مرة أخرى.";
    }
}

function confirmIdentity() {
    document.getElementById('greeting-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    renderCustomers(); 
}

function cancelLogin() {
    document.getElementById('greeting-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('enteredCode').value = "";
    currentLoggedTowerCode = ""; 
}

function switchCustomerTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.customer-tab-content').forEach(content => content.classList.remove('active'));

    if(tab === 'all') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('all-customers-tab').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('expired-customers-tab').classList.add('active');
    }
}

function toggleAddForm() {
    let formSection = document.getElementById('addCustomerSection');
    if (formSection.style.display === 'none') {
        formSection.style.display = 'block';
        if (editCustomerId === null) {
            let today = new Date();
            document.getElementById('startDate').value = today.toISOString().split('T')[0];
            let endDate = new Date(today);
            endDate.setDate(today.getDate() + 30);
            document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
        }
    } else {
        formSection.style.display = 'none';
        resetForm();
    }
}

function resetForm() {
    document.getElementById('customerName').value = "";
    document.getElementById('customerPrice').value = "";
    document.getElementById('startDate').value = "";
    document.getElementById('endDate').value = "";
    editCustomerId = null;
    document.getElementById('saveCustomerBtn').innerText = "حفظ بيانات الزبون";
}

function addCustomer() {
    let name = document.getElementById('customerName').value;
    let price = document.getElementById('customerPrice').value;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;

    if (name === "" || price === "" || startDate === "" || endDate === "") { 
        showModal("الرجاء تعبئة جميع البيانات!", "alert"); 
        return; 
    }

    let customersData = JSON.parse(localStorage.getItem('customersData')) || [];

    if (editCustomerId === null) {
        let newCustomer = {
            id: Date.now(),
            towerCode: currentLoggedTowerCode,
            name: name,
            price: price,
            startDate: startDate,
            endDate: endDate,
            paid: 0,
            debts: 0,
            history: [{date: new Date().toISOString().split('T')[0], action: 'تسجيل اشتراك', amount: parseFloat(price)}],
            isPaid: false
        };
        customersData.push(newCustomer);
        showModal("تمت إضافة الزبون بنجاح!", "alert");
    } else {
        for (let i = 0; i < customersData.length; i++) {
            if (customersData[i].id === editCustomerId) {
                customersData[i].name = name;
                customersData[i].price = price;
                customersData[i].startDate = startDate;
                customersData[i].endDate = endDate;
                break;
            }
        }
        showModal("تم التعديل بنجاح!", "alert");
    }

    localStorage.setItem('customersData', JSON.stringify(customersData));
    resetForm();
    document.getElementById('addCustomerSection').style.display = 'none';
    renderCustomers(); 
}

function searchCustomers() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let items = document.querySelectorAll('.customer-item');
    items.forEach(item => {
        let name = item.querySelector('.customer-header span').innerText.toLowerCase();
        if (name.includes(input)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

function renderCustomers() {
    let listContainer = document.getElementById('customersList');
    let expiredContainer = document.getElementById('expiredList');
    listContainer.innerHTML = ""; 
    expiredContainer.innerHTML = "";

    let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
    let towerCustomers = allCustomers.filter(cust => cust.towerCode === currentLoggedTowerCode);

    towerCustomers.sort((a, b) => {
        let today = new Date();
        today.setHours(0,0,0,0);
        let getRemaining = (dateString) => {
            if (!dateString) return 0;
            let end = new Date(dateString);
            end.setHours(0,0,0,0);
            return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        };
        return getRemaining(a.endDate) - getRemaining(b.endDate);
    });

    let towerDebt = 0;
    towerCustomers.forEach(cust => {
        let cDebts = cust.debts || 0;
        let cPaid = cust.paid || 0;
        let cTotal = parseFloat(cust.price || 0) + parseFloat(cDebts);
        let rem = cTotal - cPaid;
        if (rem > 0) {
            towerDebt += rem;
        }
    });
    
    document.getElementById('towerSubscribers').innerText = towerCustomers.length;
    document.getElementById('towerDebt').innerText = towerDebt;

    if (towerCustomers.length === 0) {
        listContainer.innerHTML = "<p style='text-align:center; color:#7f8c8d;'>لا يوجد زبائن حالياً في هذا البرج.</p>";
        expiredContainer.innerHTML = "<p style='text-align:center; color:#7f8c8d;'>لا يوجد زبائن منتهية اشتراكاتهم.</p>";
        return;
    }

    towerCustomers.forEach(customer => {
        let remainingDays = 0;
        if (customer.endDate) {
            let end = new Date(customer.endDate);
            let today = new Date();
            today.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            let diffTime = end - today;
            remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        let isExpired = remainingDays <= 0;
        
        let cDebts = customer.debts || 0;
        let cPaid = customer.paid || 0;
        let originalPrice = parseFloat(customer.price || 0) + parseFloat(cDebts);
        let currentTotal = originalPrice - cPaid;
        let remaining = currentTotal;

        let itemDiv = document.createElement('div');
        itemDiv.className = 'customer-item';
        
        itemDiv.onclick = function(e) {
            if (e.target.tagName.toLowerCase() === 'button') return;
            let details = document.getElementById('details-' + customer.id);
            if (details.classList.contains('show')) {
                details.classList.remove('show');
            } else {
                details.classList.add('show');
            }
        };

        let paymentHTML = "";
        if (remaining <= 0) {
            paymentHTML = `<span class="paid-badge">✔ تم التسديد</span>`;
        } else {
            paymentHTML = `<button class="pay-btn" onclick="paySubscription(${customer.id})">تسديد</button>`;
        }

        itemDiv.innerHTML = `
            <div class="customer-header">
                <span>${customer.name}</span>
                <span style="font-size: 0.9rem; color: ${isExpired ? '#e74c3c' : '#27ae60'}">${isExpired ? 'منتهي' : remainingDays + ' يوم'}</span>
            </div>
            <div class="customer-details" id="details-${customer.id}">
                <div class="customer-info">
                    <p><strong>المبلغ الكلي:</strong> ${currentTotal} دينار</p>
                    <p><strong>الباقي:</strong> <span style="color:#e74c3c; font-weight:bold;">${remaining} دينار</span></p>
                    <p><strong>تاريخ البدء:</strong> ${customer.startDate}</p>
                    <p><strong>تاريخ الانتهاء:</strong> ${customer.endDate}</p>
                </div>
                <div class="payment-action" style="margin-top: 15px;">
                    <button class="add-debt-btn" onclick="addDebt(${customer.id})">إضافة دين</button>
                    ${paymentHTML}
                    <button class="edit-btn" onclick="editCustomer(${customer.id})">تعديل</button>
                    <button class="history-btn" onclick="showHistory(${customer.id})">سجل كامل</button>
                    <button class="delete-btn" onclick="deleteCustomer(${customer.id})">حذف</button>
                </div>
            </div>
        `;

        listContainer.appendChild(itemDiv);

        if (isExpired) {
            let expDiv = itemDiv.cloneNode(true);
            expDiv.innerHTML = itemDiv.innerHTML.replace(`id="details-${customer.id}"`, `id="details-exp-${customer.id}"`);
            expDiv.onclick = function(e) {
                if (e.target.tagName.toLowerCase() === 'button') return;
                let details = document.getElementById('details-exp-' + customer.id);
                if (details.classList.contains('show')) details.classList.remove('show');
                else details.classList.add('show');
            };
            expiredContainer.appendChild(expDiv);
        }
    });

    if (expiredContainer.innerHTML === "") {
        expiredContainer.innerHTML = "<p style='text-align:center; color:#7f8c8d;'>لا يوجد زبائن منتهية اشتراكاتهم.</p>";
    }
}

function paySubscription(id) {
    showInputModal("أدخل المبلغ المراد تسديده:", (amount) => {
        if(!amount || isNaN(amount) || amount <= 0) {
            showModal("الرجاء إدخال مبلغ صحيح!", "alert");
            return;
        }
        let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
        let customer = allCustomers.find(c => c.id === id);
        if (customer) {
            customer.paid = (customer.paid || 0) + parseFloat(amount);
            customer.history = customer.history || [];
            let today = new Date().toISOString().split('T')[0];
            customer.history.push({date: today, action: `تسديد مبلغ`, amount: parseFloat(amount)});
            localStorage.setItem('customersData', JSON.stringify(allCustomers));
            renderCustomers();
            showModal("تم التسديد بنجاح!", "alert");
        }
    });
}

function addDebt(id) {
    showInputModal("أدخل مبلغ الدين المضاف:", (amount) => {
        if(!amount || isNaN(amount) || amount <= 0) {
            showModal("الرجاء إدخال مبلغ صحيح!", "alert");
            return;
        }
        let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
        let customer = allCustomers.find(c => c.id === id);
        if (customer) {
            customer.debts = (customer.debts || 0) + parseFloat(amount);
            customer.history = customer.history || [];
            let today = new Date().toISOString().split('T')[0];
            customer.history.push({date: today, action: `إضافة دين`, amount: parseFloat(amount)});
            localStorage.setItem('customersData', JSON.stringify(allCustomers));
            renderCustomers();
            showModal("تمت إضافة الدين بنجاح!", "alert");
        }
    });
}

function showHistory(id) {
    let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
    let customer = allCustomers.find(c => c.id === id);
    if (customer) {
        let historyHTML = "";
        let historyArr = customer.history || [];
        if (historyArr.length === 0) {
            historyHTML = "<p style='text-align:center; color:#7f8c8d;'>لا يوجد سجل متاح.</p>";
        } else {
            historyHTML = historyArr.map(h => `<div class='history-item'><strong>${h.date}:</strong> ${h.action} (${h.amount} دينار)</div>`).join('');
        }
        document.getElementById('historyContent').innerHTML = historyHTML;
        document.getElementById('historyModal').style.display = 'flex';
    }
}

function editCustomer(id) {
    let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
    let customer = allCustomers.find(c => c.id === id);
    if (customer) {
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPrice').value = customer.price;
        document.getElementById('startDate').value = customer.startDate || "";
        document.getElementById('endDate').value = customer.endDate || "";

        editCustomerId = id;
        document.getElementById('saveCustomerBtn').innerText = "تحديث بيانات الزبون";
        
        document.getElementById('addCustomerSection').style.display = 'block';
        window.scrollTo(0, 0);
    }
}

function deleteCustomer(id) {
    showModal("هل تود الحذف بالتأكيد؟", "confirm", () => {
        let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
        allCustomers = allCustomers.filter(c => c.id !== id);
        localStorage.setItem('customersData', JSON.stringify(allCustomers));
        renderCustomers();
        showModal("تم الحذف بنجاح!", "alert");
    });
}
