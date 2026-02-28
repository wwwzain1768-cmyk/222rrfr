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
    document.getElementById('customerPhone').value = "";
    document.getElementById('customerPrice').value = "";
    document.getElementById('startDate').value = "";
    document.getElementById('endDate').value = "";
    editCustomerId = null;
    document.getElementById('saveCustomerBtn').innerText = "حفظ بيانات الزبون";
}

function addCustomer() {
    let name = document.getElementById('customerName').value;
    let phone = document.getElementById('customerPhone').value;
    let price = document.getElementById('customerPrice').value;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;

    if (name === "" || phone === "" || price === "" || startDate === "" || endDate === "") { 
        showModal("الرجاء تعبئة جميع البيانات!", "alert"); 
        return; 
    }

    let customersData = JSON.parse(localStorage.getItem('customersData')) || [];

    if (editCustomerId === null) {
        let newCustomer = {
            id: Date.now(),
            towerCode: currentLoggedTowerCode,
            name: name,
            phone: phone,
            price: price,
            startDate: startDate,
            endDate: endDate,
            isPaid: false
        };
        customersData.push(newCustomer);
        showModal("تمت إضافة الزبون بنجاح!", "alert");
    } else {
        for (let i = 0; i < customersData.length; i++) {
            if (customersData[i].id === editCustomerId) {
                customersData[i].name = name;
                customersData[i].phone = phone;
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

function renderCustomers() {
    let listContainer = document.getElementById('customersList');
    let expiredContainer = document.getElementById('expiredList');
    listContainer.innerHTML = ""; 
    expiredContainer.innerHTML = "";

    let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
    let towerCustomers = allCustomers.filter(cust => cust.towerCode === currentLoggedTowerCode);

    let towerDebt = 0;
    towerCustomers.forEach(cust => {
        if (!cust.isPaid) towerDebt += parseFloat(cust.price || 0);
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
        if (customer.isPaid) {
            paymentHTML = `<span class="paid-badge">✔ تم التسديد</span>`;
        } else {
            paymentHTML = `<button class="pay-btn" onclick="paySubscription(${customer.id})">تسديد المبلغ</button>`;
        }

        itemDiv.innerHTML = `
            <div class="customer-header">
                <span>${customer.name}</span>
                <span style="font-size: 0.9rem; color: ${isExpired ? '#e74c3c' : '#7f8c8d'}">${isExpired ? 'منتهي' : 'نشط'}</span>
            </div>
            <div class="customer-details" id="details-${customer.id}">
                <div class="customer-info">
                    <p><strong>الرقم:</strong> ${customer.phone}</p>
                    <p><strong>المبلغ المطلوب:</strong> ${customer.price} دينار</p>
                    <p><strong>تاريخ البدء:</strong> ${customer.startDate}</p>
                    <p><strong>تاريخ الانتهاء:</strong> ${customer.endDate}</p>
                    <p><strong>الأيام المتبقية:</strong> ${remainingDays} يوم</p>
                </div>
                <div class="payment-action" style="margin-top: 15px;">
                    ${paymentHTML}
                    <button class="edit-btn" onclick="editCustomer(${customer.id})">تعديل</button>
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

function editCustomer(id) {
    let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
    let customer = allCustomers.find(c => c.id === id);
    if (customer) {
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerPrice').value = customer.price;
        document.getElementById('startDate').value = customer.startDate || "";
        document.getElementById('endDate').value = customer.endDate || "";

        editCustomerId = id;
        document.getElementById('saveCustomerBtn').innerText = "تحديث بيانات الزبون";
        
        document.getElementById('addCustomerSection').style.display = 'block';
        window.scrollTo(0, 0);
    }
}

function paySubscription(customerId) {
    showModal("هل أنت متأكد من تسديد اشتراك هذا الزبون؟", "confirm", () => {
        let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
        for (let i = 0; i < allCustomers.length; i++) {
            if (allCustomers[i].id === customerId) {
                allCustomers[i].isPaid = true; 
                break;
            }
        }
        localStorage.setItem('customersData', JSON.stringify(allCustomers));
        renderCustomers();
        showModal("تم التسديد بنجاح!", "alert");
    });
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
