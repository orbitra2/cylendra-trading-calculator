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

// معالجة اختيار طريقة حساب الربح
const profitModeBtns = document.querySelectorAll('.profit-mode-btn');
const fixedProfitGroup = document.getElementById('fixedProfitGroup');
const percentageProfitGroup = document.getElementById('percentageProfitGroup');
const profitPerTradeInput = document.getElementById('profitPerTrade');
const dailyProfitPercentageInput = document.getElementById('dailyProfitPercentage');
const principalInput = document.getElementById('principal');
const tradesPerDayInput = document.getElementById('tradesPerDay');
const profitCalculationDisplay = document.getElementById('profitCalculationDisplay');

console.log('Profit Mode Buttons:', profitModeBtns.length);
console.log('Fixed Profit Group:', fixedProfitGroup);
console.log('Percentage Profit Group:', percentageProfitGroup);

if (profitModeBtns.length > 0) {
    profitModeBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const mode = this.getAttribute('data-mode');
            console.log('Profit mode selected:', mode);

            // إزالة التحديد من جميع الأزرار
            profitModeBtns.forEach(b => b.classList.remove('active'));
            // تحديد الزر المضغوط
            this.classList.add('active');

            // إظهار/إخفاء المجموعات
            if (mode === 'fixed') {
                if (fixedProfitGroup) fixedProfitGroup.style.display = 'block';
                if (percentageProfitGroup) percentageProfitGroup.style.display = 'none';
                if (profitPerTradeInput) profitPerTradeInput.required = true;
                if (dailyProfitPercentageInput) dailyProfitPercentageInput.required = false;
            } else {
                if (fixedProfitGroup) fixedProfitGroup.style.display = 'none';
                if (percentageProfitGroup) percentageProfitGroup.style.display = 'block';
                if (profitPerTradeInput) profitPerTradeInput.required = false;
                if (dailyProfitPercentageInput) dailyProfitPercentageInput.required = true;
                updateProfitCalculation();
            }
        });
    });
}

// تحديث حساب الربح عند تغيير القيم
function updateProfitCalculation() {
    const principal = parseFloat(principalInput.value) || 0;
    const percentage = parseFloat(dailyProfitPercentageInput.value) || 0;
    const tradesPerDay = parseInt(tradesPerDayInput.value) || 1;

    if (principal > 0 && percentage > 0) {
        const dailyProfit = (principal * percentage) / 100;
        const profitPerTrade = dailyProfit / tradesPerDay;

        const exampleText = window.t ? window.t('calculator:fields.dailyProfitPercentage.example') : 'مثال: سيكون الربح لكل صفقة';
        const calculationText = window.t ? window.t('calculator:fields.dailyProfitPercentage.calculation') : 'الربح اليومي = رأس المال × النسبة ÷ عدد الصفقات';
        
        profitCalculationDisplay.innerHTML = `
            ${exampleText} <strong>$${profitPerTrade.toFixed(2)}</strong>
            <br>
            <small>(${principal} × ${percentage}% ÷ ${tradesPerDay} = ${profitPerTrade.toFixed(2)})</small>
        `;
    }
}

// إضافة مستمعي الأحداث لتحديث الحساب
if (principalInput) {
    principalInput.addEventListener('input', updateProfitCalculation);
}
if (dailyProfitPercentageInput) {
    dailyProfitPercentageInput.addEventListener('input', updateProfitCalculation);
}
if (tradesPerDayInput) {
    tradesPerDayInput.addEventListener('input', updateProfitCalculation);
}

// تفعيل روابط التنقل عند التمرير
const sections = document.querySelectorAll('.section');
const navLinkItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinkItems.forEach(link => {
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
        const tradesPerDay = parseInt(document.getElementById('tradesPerDay').value);
        const days = parseInt(document.getElementById('days').value);

        // تحديد طريقة الربح المختارة
        const activeProfitModeBtn = document.querySelector('.profit-mode-btn.active');
        const profitMode = activeProfitModeBtn ? activeProfitModeBtn.getAttribute('data-mode') : 'fixed';

        let profitPerTrade = 0;
        let dailyProfitPercentage = 0;

        if (profitMode === 'fixed') {
            profitPerTrade = parseFloat(document.getElementById('profitPerTrade').value);
            if (profitPerTrade <= 0) {
                alert(window.t ? window.t('validation.profitPerTradeRequired', {ns: 'calculator'}) : 'الربح لكل صفقة يجب أن يكون أكبر من صفر');
                return false;
            }
        } else {
            dailyProfitPercentage = parseFloat(document.getElementById('dailyProfitPercentage').value);
            if (dailyProfitPercentage <= 0) {
                alert(window.t ? window.t('validation.percentageRequired', {ns: 'calculator'}) : 'النسبة المئوية يجب أن تكون أكبر من صفر');
                return false;
            }
        }

        if (principal <= 0) {
            alert(window.t ? window.t('validation.principalRequired', {ns: 'calculator'}) : 'رأس المال يجب أن يكون أكبر من صفر');
            return false;
        }

        if (tradesPerDay <= 0) {
            alert(window.t ? window.t('validation.tradesPerDayRequired', {ns: 'calculator'}) : 'عدد الصفقات يجب أن يكون أكبر من صفر');
            return false;
        }

        if (days <= 0) {
            alert(window.t ? window.t('validation.daysRequired', {ns: 'calculator'}) : 'عدد الأيام يجب أن يكون أكبر من صفر');
            return false;
        }

        // عرض رسالة تحميل
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        const calculatingText = window.t ? window.t('buttons.calculating', {ns: 'common'}) : 'جاري الحساب...';
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${calculatingText}`;
        submitBtn.disabled = true;

        try {
            // جمع البيانات
            const formData = {
                principal: principal,
                profitPerTrade: profitPerTrade,
                dailyProfitPercentage: dailyProfitPercentage,
                profitMode: profitMode,
                tradesPerDay: tradesPerDay,
                reinvestPercent: parseFloat(document.getElementById('reinvestPercent').value),
                workDaysPerWeek: parseInt(document.getElementById('workDaysPerWeek').value),
                monthlyExpenses: parseFloat(document.getElementById('monthlyExpenses').value),
                days: days
            };

            console.log('Form Data:', formData);
            console.log('Profit Mode:', profitMode);

            // إرسال الطلب إلى API
            // استخدم /api/calculate للتطوير المحلي و /.netlify/functions/api للإنتاج
            const apiUrl = window.location.hostname === 'localhost' ? '/api/calculate' : '/.netlify/functions/api';
            console.log('API URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error Response:', errorText);
                const errorMsg = window.t ? window.t('calculationFailed', {ns: 'common'}) : 'فشل الحساب';
                throw new Error(`${errorMsg}: ${response.status}`);
            }

            const result = await response.json();
            console.log('Result:', result);

            // عرض النتائج
            displayResults(result.data);

            // التمرير إلى قسم النتائج
            document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error('خطأ:', error);
            const errorMsg = window.t ? window.t('calculationError', {ns: 'common'}) : 'حدث خطأ في الحساب';
            alert(`${errorMsg}: ${error.message}`);
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
    const dailyTableBody = document.getElementById('dailyTableBody');

    // عرض قسم النتائج
    resultsSection.style.display = 'block';

    // عرض البطاقات الإحصائية
    const stats = data.summary;
    const finalBalanceText = window.t ? window.t('stats.finalBalance', {ns: 'results'}) : 'الرصيد النهائي';
    const fromInitialText = window.t ? window.t('stats.fromInitial', {ns: 'results'}) : 'من أصل';
    statsGrid.innerHTML = `
        <div class="stat-card gradient-purple">
            <div class="stat-icon"><i class="fas fa-wallet"></i></div>
            <div class="stat-content">
                <h3>${finalBalanceText}</h3>
                <p class="stat-value">$${stats.finalBalance.toLocaleString()}</p>
                <span class="stat-label">${fromInitialText} $${stats.initialBalance.toLocaleString()}</span>
            </div>
        </div>
        <div class="stat-card gradient-blue">
            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            <div class="stat-content">
                <h3>${window.t ? window.t('stats.netProfit', {ns: 'results'}) : 'صافي الربح'}</h3>
                <p class="stat-value">$${stats.netProfit.toLocaleString()}</p>
                <span class="stat-label">${window.t ? window.t('stats.roi', {ns: 'results'}) : 'نسبة العائد'}: ${stats.roi}%</span>
            </div>
        </div>
        <div class="stat-card gradient-green">
            <div class="stat-icon"><i class="fas fa-coins"></i></div>
            <div class="stat-content">
                <h3>${window.t ? window.t('stats.totalEarnings', {ns: 'results'}) : 'إجمالي الأرباح'}</h3>
                <p class="stat-value">$${stats.totalEarnings.toLocaleString()}</p>
                <span class="stat-label">${window.t ? window.t('stats.inDays', {ns: 'results'}) : 'خلال'} ${stats.totalDays} ${window.t ? window.t('day', {ns: 'common'}) : 'يوم'}</span>
            </div>
        </div>
        <div class="stat-card gradient-orange">
            <div class="stat-icon"><i class="fas fa-hand-holding-usd"></i></div>
            <div class="stat-content">
                <h3>${window.t ? window.t('stats.totalCashOut', {ns: 'results'}) : 'السحوبات النقدية'}</h3>
                <p class="stat-value">$${stats.totalCashOut.toLocaleString()}</p>
                <span class="stat-label">${window.t ? window.t('stats.availableForWithdrawal', {ns: 'results'}) : 'متاح للسحب'}</span>
            </div>
        </div>
        <div class="stat-card gradient-pink">
            <div class="stat-icon"><i class="fas fa-recycle"></i></div>
            <div class="stat-content">
                <h3>${window.t ? window.t('stats.totalReinvested', {ns: 'results'}) : 'إعادة الاستثمار'}</h3>
                <p class="stat-value">$${stats.totalReinvested.toLocaleString()}</p>
                <span class="stat-label">${window.t ? window.t('stats.reinvested', {ns: 'results'}) : 'أُعيد استثماره'}</span>
            </div>
        </div>
        <div class="stat-card gradient-red">
            <div class="stat-icon"><i class="fas fa-receipt"></i></div>
            <div class="stat-content">
                <h3>${window.t ? window.t('stats.totalExpenses', {ns: 'results'}) : 'المصاريف'}</h3>
                <p class="stat-value">$${stats.totalExpenses.toLocaleString()}</p>
                <span class="stat-label">${window.t ? window.t('stats.monthlyExpenses', {ns: 'results'}) : 'مصاريف شهرية'}</span>
            </div>
        </div>
        <div class="stat-card gradient-teal">
            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-content">
                <h3>${window.t ? window.t('stats.avgMonthlyProfit', {ns: 'results'}) : 'متوسط الربح الشهري'}</h3>
                <p class="stat-value">$${stats.avgMonthlyProfit.toLocaleString()}</p>
                <span class="stat-label">${window.t ? window.t('stats.perMonth', {ns: 'results'}) : 'لكل شهر'}</span>
            </div>
        </div>
        <div class="stat-card gradient-indigo">
            <div class="stat-icon"><i class="fas fa-percent"></i></div>
            <div class="stat-content">
                <h3>${window.t ? window.t('stats.avgMonthlyGrowth', {ns: 'results'}) : 'متوسط النمو الشهري'}</h3>
                <p class="stat-value">${stats.avgMonthlyGrowth}%</p>
                <span class="stat-label">${window.t ? window.t('stats.monthlyGrowth', {ns: 'results'}) : 'نمو شهري'}</span>
            </div>
        </div>
    `;

    // عرض جدول البيانات الشهرية
    tableBody.innerHTML = data.monthlyData.map((row, index) => `
        <tr>
            <td><strong>${window.t ? window.t('results:tables.monthLabel', {month: index + 1}) : `Month ${index + 1}`}</strong></td>
            <td class="text-success">$${row.earnings.toLocaleString()}</td>
            <td class="text-info">$${row.reinvest.toLocaleString()}</td>
            <td class="text-warning">$${row.cashOut.toLocaleString()}</td>
            <td class="text-danger">$${row.expenses.toLocaleString()}</td>
            <td class="text-primary"><strong>$${row.balance.toLocaleString()}</strong></td>
            <td class="text-success">${row.roi}%</td>
        </tr>
    `).join('');

    // عرض جدول البيانات اليومية
    if (data.dailyData && data.dailyData.length > 0) {
        dailyTableBody.innerHTML = data.dailyData.map(row => `
            <tr>
                <td><strong>${window.t ? window.t('results:tables.dayLabel', {day: row.day}) : `Day ${row.day}`}</strong></td>
                <td class="text-success">$${row.profit.toLocaleString()}</td>
                <td class="text-warning">$${row.cashout.toLocaleString()}</td>
                <td class="text-primary"><strong>$${row.balance.toLocaleString()}</strong></td>
            </tr>
        `).join('');
    }

    // عرض نسبة الخطورة
    displayRiskRatio(stats);

    // تحديث الرسوم البيانية
    createCharts(data);
}

// دالة عرض نسبة الخطورة - محسّنة
function displayRiskRatio(stats) {
    const riskRatioValue = document.getElementById('riskRatioValue');
    const riskLevelText = document.getElementById('riskLevelText');
    const riskDescription = document.getElementById('riskDescription');
    const riskCircle = document.getElementById('riskCircle');

    if (!riskRatioValue || !riskLevelText || !riskDescription || !riskCircle) {
        console.warn('Risk ratio elements not found');
        return;
    }

    const riskValue = stats.riskRatio || 0;
    riskRatioValue.textContent = riskValue.toFixed(2);
    // Use translation system for risk level
    if (window.t && stats.riskLevel) {
        const riskLevelKey = `results:risk.levels.${stats.riskLevel}`;
        riskLevelText.textContent = window.t(riskLevelKey) || stats.riskLevel;
    } else {
        riskLevelText.textContent = stats.riskLevel || 'منخفضة جداً';
    }

    // تحديث لون البطاقة حسب مستوى الخطورة
    riskCircle.className = 'risk-circle';

    let descriptionText = '';
    let colorClass = '';
    let emoji = '';

    if (riskValue <= 5) {
        colorClass = 'risk-very-low';
        emoji = '✅';
        descriptionText = 'خطورة منخفضة جداً - استراتيجية آمنة جداً مع رأس مال كبير وأرباح محدودة. مناسبة للمحافظين.';
    } else if (riskValue <= 10) {
        colorClass = 'risk-low';
        emoji = '✅';
        descriptionText = 'خطورة منخفضة - استراتيجية آمنة وموثوقة للمبتدئين. نمو مستقر مع مخاطر محدودة.';
    } else if (riskValue <= 20) {
        colorClass = 'risk-medium';
        emoji = '⚠️';
        descriptionText = 'خطورة متوسطة - توازن معقول بين النمو والأمان. تتطلب مراقبة منتظمة.';
    } else if (riskValue <= 50) {
        colorClass = 'risk-high';
        emoji = '⚠️';
        descriptionText = 'خطورة عالية - استراتيجية عدوانية تتطلب خبرة وتحمل للمخاطر. قد تؤدي لخسائر كبيرة.';
    } else {
        colorClass = 'risk-very-high';
        emoji = '❌';
        descriptionText = 'خطورة عالية جداً - استراتيجية محفوفة بالمخاطر جداً. غير موصى بها للمبتدئين. احذر من الخسائر الكبيرة.';
    }

    riskCircle.classList.add(colorClass);
    // Use translation system for risk description
    let translatedDescription = descriptionText;
    if (window.t && stats.riskLevel) {
        const riskDescKey = `results:risk.descriptions.${stats.riskLevel}`;
        translatedDescription = window.t(riskDescKey) || descriptionText;
    }
    
    riskDescription.innerHTML = `<strong>${emoji} ${stats.riskLevel}</strong><br>${translatedDescription}`;

    console.log('Risk Ratio Updated:', { riskValue, riskLevel: stats.riskLevel, colorClass });
}

// دالة إنشاء الرسوم البيانية
function createCharts(data) {
    const months = data.monthlyData.map((d, index) => 
        window.t ? window.t('results:tables.monthLabel', {month: index + 1}) : `Month ${index + 1}`
    );
    const balanceData = data.monthlyData.map(d => d.balance);
    const earningsData = data.monthlyData.map(d => d.earnings);
    const cashOutData = data.monthlyData.map(d => d.cashOut);
    const reinvestData = data.monthlyData.map(d => d.reinvest);
    const roiData = data.monthlyData.map(d => d.roi);

    // الرسم البياني الرئيسي
    const mainChartCtx = document.getElementById('mainChart');
    if (mainChartCtx && window.Chart) {
        // حذف الرسم البياني السابق إن وجد
        if (mainChartCtx.chart) {
            mainChartCtx.chart.destroy();
        }

        mainChartCtx.chart = new Chart(mainChartCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [
                    {
                        label: window.t ? window.t('results:charts.balance') : 'الرصيد',
                        data: balanceData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: window.t ? window.t('results:charts.monthlyEarnings') : 'الأرباح الشهرية',
                        data: earningsData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: { size: 12, family: 'Cairo' },
                            color: '#333',
                            padding: 15
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { font: { family: 'Cairo' } }
                    },
                    x: {
                        ticks: { font: { family: 'Cairo' } }
                    }
                }
            }
        });
    }

    // رسم بياني توزيع الأرباح
    const pieChartCtx = document.getElementById('pieChart');
    if (pieChartCtx && window.Chart) {
        if (pieChartCtx.chart) {
            pieChartCtx.chart.destroy();
        }

        pieChartCtx.chart = new Chart(pieChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['السحوبات النقدية', 'إعادة الاستثمار', 'المصاريف'],
                datasets: [{
                    data: [
                        data.summary.totalCashOut,
                        data.summary.totalReinvested,
                        data.summary.totalExpenses
                    ],
                    backgroundColor: [
                        '#f59e0b',
                        '#ec4899',
                        '#ef4444'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            font: { size: 12, family: 'Cairo' },
                            color: '#333',
                            padding: 15
                        }
                    }
                }
            }
        });
    }

    // رسم بياني نسبة العائد الشهري
    const roiChartCtx = document.getElementById('roiChart');
    if (roiChartCtx && window.Chart) {
        if (roiChartCtx.chart) {
            roiChartCtx.chart.destroy();
        }

        roiChartCtx.chart = new Chart(roiChartCtx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'نسبة العائد %',
                    data: roiData,
                    backgroundColor: '#06b6d4',
                    borderColor: '#0891b2',
                    borderWidth: 2,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            font: { size: 12, family: 'Cairo' },
                            color: '#333'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { font: { family: 'Cairo' } }
                    },
                    y: {
                        ticks: { font: { family: 'Cairo' } }
                    }
                }
            }
        });
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

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const navLinks = document.getElementById('navLinks');
const menuOverlay = document.getElementById('menuOverlay');
const body = document.body;

function closeMobileMenu() {
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        if (menuOverlay) {
            menuOverlay.classList.remove('active');
        }
        body.style.overflow = '';
        body.style.position = '';
        // Force transform reset for Android
        setTimeout(() => {
            navLinks.style.transform = '';
            navLinks.style.webkitTransform = '';
            navLinks.style.mozTransform = '';
            navLinks.style.msTransform = '';
        }, 350);
    }
}

function openMobileMenu() {
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.classList.add('active');
        navLinks.classList.add('active');
        if (menuOverlay) {
            menuOverlay.classList.add('active');
        }
        body.style.overflow = 'hidden';
        // Force reflow for Android
        navLinks.offsetHeight;
        // Force transform for Android
        navLinks.style.transform = 'translateX(0)';
        navLinks.style.webkitTransform = 'translateX(0)';
    }
}

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        if (navLinks.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Close button in menu
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMobileMenu();
        });
    }

    // Close menu when clicking on a link
    const mobileNavLinkItems = navLinks.querySelectorAll('.nav-link');
    mobileNavLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // Close menu when clicking on overlay
    if (menuOverlay) {
        menuOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMobileMenu();
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileMenuToggle.contains(e.target) &&
            (!menuOverlay || !menuOverlay.contains(e.target))) {
            closeMobileMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Handle window resize - close menu if window becomes larger than 768px
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

console.log('✅ Trading Calculator loaded successfully!');
