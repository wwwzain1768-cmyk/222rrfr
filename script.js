let currentLoggedTowerCode = "";
let editCustomerId = null;

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

function openClientTab(tabId) {
    let contents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < contents.length; i++) contents[i].classList.remove('active');

    let buttons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function addCustomer() {
    let name = document.getElementById('customerName').value;
    let phone = document.getElementById('customerPhone').value;
    let price = document.getElementById('customerPrice').value;
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;

    if (name === "" || phone === "" || price === "" || startDate === "" || endDate === "") { 
        alert("الرجاء تعبئة جميع البيانات!"); 
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
        alert("تمت إضافة الزبون بنجاح!");
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
        editCustomerId = null;
        document.getElementById('saveCustomerBtn').innerText = "حفظ بيانات الزبون";
        alert("تم التعديل بنجاح!");
    }

    localStorage.setItem('customersData', JSON.stringify(customersData));

    document.getElementById('customerName').value = "";
    document.getElementById('customerPhone').value = "";
    document.getElementById('customerPrice').value = "";
    document.getElementById('startDate').value = "";
    document.getElementById('endDate').value = "";
    
    renderCustomers(); 
}

function renderCustomers() {
    let listContainer = document.getElementById('customersList');
    listContainer.innerHTML = ""; 

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
        return;
    }

    towerCustomers.forEach(customer => {
        let itemDiv = document.createElement('div');
        itemDiv.className = 'customer-item';
        
        let paymentHTML = "";
        if (customer.isPaid) {
            paymentHTML = `<span class="paid-badge">✔ تم التسديد</span>`;
        } else {
            paymentHTML = `<button class="pay-btn" onclick="paySubscription(${customer.id})">تسديد المبلغ</button>`;
        }

        let remainingDays = 0;
        if (customer.endDate) {
            let end = new Date(customer.endDate);
            let today = new Date();
            let diffTime = end - today;
            remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        itemDiv.innerHTML = `
            <div class="customer-info">
                <p><strong>الاسم:</strong> ${customer.name}</p>
                <p><strong>الرقم:</strong> ${customer.phone}</p>
                <p><strong>المبلغ المطلوب:</strong> ${customer.price} دينار</p>
                <p><strong>تاريخ البدء:</strong> ${customer.startDate}</p>
                <p><strong>تاريخ الانتهاء:</strong> ${customer.endDate}</p>
                <p><strong>الأيام المتبقية:</strong> ${remainingDays} يوم</p>
            </div>
            <div class="payment-action">
                <button class="edit-btn" onclick="editCustomer(${customer.id})">تعديل</button>
                ${paymentHTML}
            </div>
        `;
        listContainer.appendChild(itemDiv);
    });
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
        openClientTab('tab-add-customer');
    }
}

function paySubscription(customerId) {
    if (confirm("هل أنت متأكد من تسديد اشتراك هذا الزبون؟")) {
        let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
        
        for (let i = 0; i < allCustomers.length; i++) {
            if (allCustomers[i].id === customerId) {
                allCustomers[i].isPaid = true; 
                break;
            }
        }

        localStorage.setItem('customersData', JSON.stringify(allCustomers));
        renderCustomers();
    }
}
