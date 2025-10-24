// التعامل مع slider إعادة الاستثمار
const reinvestSlider = document.getElementById('reinvestPercent');
const reinvestValue = document.getElementById('reinvestValue');

if (reinvestSlider && reinvestValue) {
    reinvestSlider.addEventListener('input', function() {
        reinvestValue.textContent = this.value;
    });
}

// أزرار اختيار الأيام السريعة
const dayButtons = document.querySelectorAll('.day-btn');
const daysInput = document.getElementById('days');

dayButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const days = this.getAttribute('data-days');
        daysInput.value = days;
        
        // إزالة التحديد من جميع الأزرار
        dayButtons.forEach(b => b.classList.remove('active'));
        // تحديد الزر المضغوط
        this.classList.add('active');
    });
});

// التحقق من القيمة الحالية عند تحميل الصفحة
if (daysInput) {
    const currentValue = daysInput.value;
    dayButtons.forEach(btn => {
        if (btn.getAttribute('data-days') === currentValue) {
            btn.classList.add('active');
        }
    });
}

// التنقل السلس
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// تفعيل روابط التنقل عند التمرير
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Tooltips
document.querySelectorAll('[title]').forEach(element => {
    element.addEventListener('mouseenter', function() {
        const title = this.getAttribute('title');
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = title;
        tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.875rem;
            z-index: 10000;
            pointer-events: none;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
        tooltip.style.right = (window.innerWidth - rect.right) + 'px';
        
        this.tooltipElement = tooltip;
    });
    
    element.addEventListener('mouseleave', function() {
        if (this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }
    });
});

// التحقق من صحة النموذج والحساب عبر API
const form = document.getElementById('calculatorForm');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const principal = parseFloat(document.getElementById('principal').value);
        const profitPerTrade = parseFloat(document.getElementById('profitPerTrade').value);
        const tradesPerDay = parseInt(document.getElementById('tradesPerDay').value);
        const days = parseInt(document.getElementById('days').value);

        if (principal <= 0) {
            alert('رأس المال يجب أن يكون أكبر من صفر');
            return false;
        }

        if (profitPerTrade <= 0) {
            alert('الربح لكل صفقة يجب أن يكون أكبر من صفر');
            return false;
        }

        if (tradesPerDay <= 0) {
            alert('عدد الصفقات يجب أن يكون أكبر من صفر');
            return false;
        }

        if (days <= 0) {
            alert('عدد الأيام يجب أن يكون أكبر من صفر');
            return false;
        }

        // عرض رسالة تحميل
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحساب...';
        submitBtn.disabled = true;

        try {
            // جمع البيانات
            const formData = {
                principal: principal,
                profitPerTrade: profitPerTrade,
                tradesPerDay: tradesPerDay,
                reinvestPercent: parseFloat(document.getElementById('reinvestPercent').value),
                workDaysPerWeek: parseInt(document.getElementById('workDaysPerWeek').value),
                monthlyExpenses: parseFloat(document.getElementById('monthlyExpenses').value),
                days: days
            };

            // إرسال الطلب إلى API
            const response = await fetch('/.netlify/functions/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('فشل الحساب');
            }

            const result = await response.json();

            // عرض النتائج
            displayResults(result.data);

            // التمرير إلى قسم النتائج
            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('خطأ:', error);
            alert('حدث خطأ في الحساب: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// دالة عرض النتائج
function displayResults(data) {
    const resultsSection = document.getElementById('results');
    const statsGrid = document.getElementById('statsGrid');
    const tableBody = document.getElementById('tableBody');

    // عرض قسم النتائج
    resultsSection.style.display = 'block';

    // عرض البطاقات الإحصائية
    const stats = data.summary;
    statsGrid.innerHTML = `
        <div class="stat-card gradient-purple">
            <div class="stat-icon"><i class="fas fa-wallet"></i></div>
            <div class="stat-content">
                <h3>الرصيد النهائي</h3>
                <p class="stat-value">$${stats.finalBalance.toLocaleString()}</p>
                <span class="stat-label">من أصل $${stats.initialBalance.toLocaleString()}</span>
            </div>
        </div>
        <div class="stat-card gradient-blue">
            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            <div class="stat-content">
                <h3>صافي الربح</h3>
                <p class="stat-value">$${stats.netProfit.toLocaleString()}</p>
                <span class="stat-label">نسبة العائد: ${stats.roi}%</span>
            </div>
        </div>
        <div class="stat-card gradient-green">
            <div class="stat-icon"><i class="fas fa-coins"></i></div>
            <div class="stat-content">
                <h3>إجمالي الأرباح</h3>
                <p class="stat-value">$${stats.totalEarnings.toLocaleString()}</p>
                <span class="stat-label">خلال ${stats.totalDays} يوم</span>
            </div>
        </div>
        <div class="stat-card gradient-orange">
            <div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div>
            <div class="stat-content">
                <h3>السحوبات النقدية</h3>
                <p class="stat-value">$${stats.totalCashOut.toLocaleString()}</p>
                <span class="stat-label">متاح للسحب</span>
            </div>
        </div>
        <div class="stat-card gradient-pink">
            <div class="stat-icon"><i class="fas fa-recycle"></i></div>
            <div class="stat-content">
                <h3>إعادة الاستثمار</h3>
                <p class="stat-value">$${stats.totalReinvested.toLocaleString()}</p>
                <span class="stat-label">أُعيد استثماره</span>
            </div>
        </div>
        <div class="stat-card gradient-red">
            <div class="stat-icon"><i class="fas fa-receipt"></i></div>
            <div class="stat-content">
                <h3>المصاريف</h3>
                <p class="stat-value">$${stats.totalExpenses.toLocaleString()}</p>
                <span class="stat-label">مصاريف شهرية</span>
            </div>
        </div>
        <div class="stat-card gradient-teal">
            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-content">
                <h3>متوسط الربح الشهري</h3>
                <p class="stat-value">$${stats.avgMonthlyProfit.toLocaleString()}</p>
                <span class="stat-label">لكل شهر</span>
            </div>
        </div>
        <div class="stat-card gradient-indigo">
            <div class="stat-icon"><i class="fas fa-percent"></i></div>
            <div class="stat-content">
                <h3>متوسط النمو الشهري</h3>
                <p class="stat-value">${stats.avgMonthlyGrowth}%</p>
                <span class="stat-label">نمو شهري</span>
            </div>
        </div>
    `;

    // عرض جدول البيانات الشهرية
    tableBody.innerHTML = data.monthlyData.map(row => `
        <tr>
            <td><strong>${row.month}</strong></td>
            <td class="text-success">$${row.earnings.toLocaleString()}</td>
            <td class="text-info">$${row.reinvest.toLocaleString()}</td>
            <td class="text-warning">$${row.cashOut.toLocaleString()}</td>
            <td class="text-danger">$${row.expenses.toLocaleString()}</td>
            <td class="text-primary"><strong>$${row.balance.toLocaleString()}</strong></td>
            <td class="text-success">${row.roi}%</td>
        </tr>
    `).join('');

    // تحديث الرسوم البيانية
    if (window.updateCharts) {
        window.updateCharts(data);
    }
}

// طباعة النتائج
function printResults() {
    window.print();
}

// نسخ النتائج
function copyResults() {
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        const textContent = resultsSection.innerText;
        navigator.clipboard.writeText(textContent).then(() => {
            alert('تم نسخ النتائج بنجاح!');
        }).catch(err => {
            console.error('فشل النسخ:', err);
        });
    }
}

// مشاركة النتائج
function shareResults() {
    if (navigator.share) {
        navigator.share({
            title: 'نتائج حاسبة التداول',
            text: 'شاهد نتائج حساباتي في حاسبة التداول الذكية',
            url: window.location.href
        }).then(() => {
            console.log('تمت المشاركة بنجاح');
        }).catch(err => {
            console.error('فشلت المشاركة:', err);
        });
    } else {
        alert('المشاركة غير مدعومة في هذا المتصفح');
    }
}

// حفظ الإعدادات في Local Storage
function saveSettings() {
    const settings = {
        principal: document.getElementById('principal').value,
        profitPerTrade: document.getElementById('profitPerTrade').value,
        tradesPerDay: document.getElementById('tradesPerDay').value,
        reinvestPercent: document.getElementById('reinvestPercent').value,
        workDaysPerWeek: document.getElementById('workDaysPerWeek').value,
        monthlyExpenses: document.getElementById('monthlyExpenses').value,
        days: document.getElementById('days').value
    };
    
    localStorage.setItem('tradingCalculatorSettings', JSON.stringify(settings));
}

// استرجاع الإعدادات من Local Storage
function loadSettings() {
    const saved = localStorage.getItem('tradingCalculatorSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.value = settings[key];
                if (key === 'reinvestPercent') {
                    document.getElementById('reinvestValue').textContent = settings[key];
                }
            }
        });
    }
}

// حفظ الإعدادات عند التغيير
const inputs = document.querySelectorAll('.form-input, .form-select, .form-slider');
inputs.forEach(input => {
    input.addEventListener('change', saveSettings);
});

// تحميل الإعدادات عند بدء التشغيل
// loadSettings(); // معطل افتراضياً لعدم التداخل مع القيم الافتراضية

console.log('✅ Trading Calculator loaded successfully!');
