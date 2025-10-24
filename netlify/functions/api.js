const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const serverless = require('serverless-http');

require('dotenv').config();

const app = express();

// إعداد محرك القوالب
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../public')));

// دالة حساب الأرباح
function calculateProfits(data) {
    const {
        principal,
        profitPerTrade,
        tradesPerDay,
        reinvestPercent,
        days,
        workDaysPerWeek = 5,
        monthlyExpenses = 0
    } = data;

    let balance = parseFloat(principal);
    const reinvestRatio = parseFloat(reinvestPercent) / 100;
    
    let totalEarnings = 0;
    let totalCashOut = 0;
    let totalReinvested = 0;
    let totalExpenses = 0;
    
    let monthlyData = [];
    let dailyData = [];
    
    let monthEarnings = 0;
    let monthReinvest = 0;
    let monthCashout = 0;
    let monthExpenses = 0;
    let month = 1;
    let dayOfMonth = 0;
    let dayOfWeek = 1;
    
    for (let d = 1; d <= days; d++) {
        let dailyProfit = 0;
        
        if (workDaysPerWeek === 7 || dayOfWeek <= workDaysPerWeek) {
            dailyProfit = parseFloat(profitPerTrade) * parseInt(tradesPerDay);
        }
        
        const reinvest = dailyProfit * reinvestRatio;
        const cashout = dailyProfit - reinvest;
        
        balance += reinvest;
        totalEarnings += dailyProfit;
        totalCashOut += cashout;
        totalReinvested += reinvest;
        
        monthEarnings += dailyProfit;
        monthReinvest += reinvest;
        monthCashout += cashout;
        
        dayOfMonth++;
        
        if (d <= 90) {
            dailyData.push({
                day: d,
                profit: round(dailyProfit, 2),
                balance: round(balance, 2),
                cashout: round(cashout, 2)
            });
        }
        
        if (dayOfMonth === 30 || d === days) {
            const expenses = parseFloat(monthlyExpenses);
            balance -= expenses;
            monthCashout -= expenses;
            totalCashOut -= expenses;
            totalExpenses += expenses;
            monthExpenses += expenses;
            
            monthlyData.push({
                month: `الشهر ${month}`,
                monthNumber: month,
                earnings: round(monthEarnings, 2),
                reinvest: round(monthReinvest, 2),
                cashOut: round(monthCashout, 2),
                expenses: round(monthExpenses, 2),
                balance: round(balance, 2),
                roi: round(((balance - principal) / principal) * 100, 2)
            });
            
            month++;
            dayOfMonth = 0;
            monthEarnings = 0;
            monthReinvest = 0;
            monthCashout = 0;
            monthExpenses = 0;
        }
        
        dayOfWeek++;
        if (dayOfWeek > 7) dayOfWeek = 1;
    }
    
    const roi = round(((balance - principal) / principal) * 100, 2);
    const netProfit = round(balance - principal, 2);
    const avgMonthlyProfit = monthlyData.length > 0 ? 
        round(monthlyData.reduce((sum, m) => sum + m.earnings, 0) / monthlyData.length, 2) : 0;
    const avgMonthlyGrowth = monthlyData.length > 1 ? 
        round(((monthlyData[monthlyData.length - 1].balance / monthlyData[0].balance - 1) / monthlyData.length) * 100, 2) : 0;
    
    return {
        summary: {
            initialBalance: round(principal, 2),
            finalBalance: round(balance, 2),
            netProfit: netProfit,
            totalEarnings: round(totalEarnings, 2),
            totalCashOut: round(totalCashOut, 2),
            totalReinvested: round(totalReinvested, 2),
            totalExpenses: round(totalExpenses, 2),
            roi: roi,
            avgMonthlyProfit: avgMonthlyProfit,
            avgMonthlyGrowth: avgMonthlyGrowth,
            totalDays: days,
            totalMonths: monthlyData.length
        },
        monthlyData: monthlyData,
        dailyData: dailyData
    };
}

function round(num, decimals) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

app.get('/', (req, res) => {
    res.render('index', { 
        results: null,
        input: {
            principal: 1000,
            profitPerTrade: 10,
            tradesPerDay: 5,
            reinvestPercent: 50,
            days: 365,
            workDaysPerWeek: 5,
            monthlyExpenses: 0
        }
    });
});

app.post('/api/calculate', (req, res) => {
    try {
        const results = calculateProfits(req.body);
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: 'حدث خطأ في الحسابات: ' + error.message 
        });
    }
});

app.post('/calculate', (req, res) => {
    try {
        const results = calculateProfits(req.body);
        res.render('index', { 
            results: results,
            input: req.body
        });
    } catch (error) {
        res.render('index', { 
            results: null,
            input: req.body,
            error: 'حدث خطأ في الحسابات'
        });
    }
});

app.post('/api/export', (req, res) => {
    try {
        const results = calculateProfits(req.body);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=trading-results.json');
        res.json(results);
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: 'فشل التصدير' 
        });
    }
});

app.post('/api/export/csv', (req, res) => {
    try {
        const results = calculateProfits(req.body);
        let csv = 'الشهر,الأرباح,إعادة الاستثمار,السحب النقدي,المصاريف,الرصيد,نسبة العائد\n';
        
        results.monthlyData.forEach(row => {
            csv += `${row.month},${row.earnings},${row.reinvest},${row.cashOut},${row.expenses},${row.balance},${row.roi}%\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=trading-results.csv');
        res.send('\ufeff' + csv);
    } catch (error) {
        res.status(400).send('فشل التصدير');
    }
});

app.use((req, res) => {
    res.status(404).render('404');
});

module.exports = app;
module.exports.handler = serverless(app);

