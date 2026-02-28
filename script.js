// متغير لحفظ رمز البرج الحالي الذي سجل الدخول
let currentLoggedTowerCode = "";

// 1. دالة التحقق من الرمز
function checkCode() {
    let enteredCode = document.getElementById('enteredCode').value;
    let errorMsg = document.getElementById('error-msg');
    
    // سحب بيانات الأبراج من موقع الإدارة (يجب أن تكون قد أنشأت برجاً هناك أولاً)
    let savedData = localStorage.getItem('towersData');
    if (!savedData) { 
        errorMsg.innerText = "لا توجد أبراج مسجلة! تأكد من إنشائها في موقع الإدارة أولاً."; 
        return; 
    }

    let towersArray = JSON.parse(savedData);
    let foundTower = null;

    // البحث عن الرمز
    for (let i = 0; i < towersArray.length; i++) {
        if (towersArray[i].towerCode === enteredCode) { 
            foundTower = towersArray[i]; 
            break; 
        }
    }

    if (foundTower) {
        errorMsg.innerText = ""; 
        currentLoggedTowerCode = foundTower.towerCode; // حفظ رمز البرج لربط الزبائن به
        
        // عرض رسالة الترحيب باسم المالك
        document.getElementById('greeting-text').innerText = `هل أنت الأستاذ/ة ${foundTower.ownerName}؟`;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('greeting-section').style.display = 'flex';
    } else {
        errorMsg.innerText = "كلمة السر (الرمز) غير صحيحة، يرجى المحاولة مرة أخرى.";
    }
}

// 2. تأكيد الدخول وفتح لوحة التحكم
function confirmIdentity() {
    document.getElementById('greeting-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';
    renderCustomers(); // جلب وعرض الزبائن الخاصين بهذا البرج
}

// 3. إلغاء الدخول
function cancelLogin() {
    document.getElementById('greeting-section').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('enteredCode').value = "";
    currentLoggedTowerCode = ""; // تصفير الرمز
}

// 4. التنقل بين التبويبات
function openClientTab(tabId) {
    let contents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < contents.length; i++) contents[i].classList.remove('active');

    let buttons = document.getElementsByClassName('tab-btn');
    for (let i = 0; i < buttons.length; i++) buttons[i].classList.remove('active');

    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 5. إضافة زبون جديد
function addCustomer() {
    let name = document.getElementById('customerName').value;
    let phone = document.getElementById('customerPhone').value;
    let price = document.getElementById('customerPrice').value;

    if (name === "" || phone === "" || price === "") { 
        alert("الرجاء تعبئة جميع البيانات!"); 
        return; 
    }

    // جلب الزبائن المخزنين سابقاً أو إنشاء مصفوفة جديدة
    let customersData = JSON.parse(localStorage.getItem('customersData')) || [];

    // إنشاء كائن الزبون (لاحظ أننا نربطه برمز البرج الحالي، ونعطيه حالة الدفع false)
    let newCustomer = {
        id: Date.now(), // رقم تعريفي فريد
        towerCode: currentLoggedTowerCode, // لكي لا تظهر الأسماء في أبراج أخرى
        name: name,
        phone: phone,
        price: price,
        isPaid: false // غير مدفوع افتراضياً
    };

    customersData.push(newCustomer);
    localStorage.setItem('customersData', JSON.stringify(customersData));

    // تفريغ الحقول
    document.getElementById('customerName').value = "";
    document.getElementById('customerPhone').value = "";
    document.getElementById('customerPrice').value = "";
    
    alert("تمت إضافة الزبون بنجاح!");
    renderCustomers(); // تحديث القائمة
}

// 6. عرض الزبائن ونظام التسديد
function renderCustomers() {
    let listContainer = document.getElementById('customersList');
    listContainer.innerHTML = ""; // تفريغ القائمة

    let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
    
    // استخراج الزبائن الذين يتبعون للبرج الحالي فقط
    let towerCustomers = allCustomers.filter(cust => cust.towerCode === currentLoggedTowerCode);

    if (towerCustomers.length === 0) {
        listContainer.innerHTML = "<p style='text-align:center; color:#7f8c8d;'>لا يوجد زبائن حالياً في هذا البرج.</p>";
        return;
    }

    towerCustomers.forEach(customer => {
        let itemDiv = document.createElement('div');
        itemDiv.className = 'customer-item';
        
        // تحديد شكل زر التسديد بناءً على حالة الدفع (isPaid)
        let paymentHTML = "";
        if (customer.isPaid) {
            paymentHTML = `<span class="paid-badge">✔ تم التسديد</span>`;
        } else {
            paymentHTML = `<button class="pay-btn" onclick="paySubscription(${customer.id})">تسديد المبلغ</button>`;
        }

        itemDiv.innerHTML = `
            <div class="customer-info">
                <p><strong>الاسم:</strong> ${customer.name}</p>
                <p><strong>الرقم:</strong> ${customer.phone}</p>
                <p><strong>المبلغ المطلوب:</strong> ${customer.price} دينار</p>
            </div>
            <div class="payment-action">
                ${paymentHTML}
            </div>
        `;
        listContainer.appendChild(itemDiv);
    });
}

// 7. دالة تسديد المبلغ (تحويل الزبون إلى مدفوع)
function paySubscription(customerId) {
    if (confirm("هل أنت متأكد من تسديد اشتراك هذا الزبون؟")) {
        let allCustomers = JSON.parse(localStorage.getItem('customersData')) || [];
        
        // البحث عن الزبون وتغيير حالة الدفع
        for (let i = 0; i < allCustomers.length; i++) {
            if (allCustomers[i].id === customerId) {
                allCustomers[i].isPaid = true; // تم الدفع
                break;
            }
        }

        // حفظ التحديثات في الذاكرة وإعادة رسم الشاشة
        localStorage.setItem('customersData', JSON.stringify(allCustomers));
        renderCustomers();
    }
}
