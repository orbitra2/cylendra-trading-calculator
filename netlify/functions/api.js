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

    // حساب نسبة الخطورة (Risk Ratio)
    // المعادلة: (الربح لكل صفقة / رأس المال) × عدد الصفقات اليومية × 100
    const riskRatio = round(
        (parseFloat(profitPerTrade) / parseFloat(principal)) * parseInt(tradesPerDay) * 100,
        2
    );

    // تصنيف مستوى الخطورة
    let riskLevel = 'منخفضة جداً';
    if (riskRatio > 50) riskLevel = 'عالية جداً';
    else if (riskRatio > 20) riskLevel = 'عالية';
    else if (riskRatio > 10) riskLevel = 'متوسطة';
    else if (riskRatio > 5) riskLevel = 'منخفضة';

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
            totalMonths: monthlyData.length,
            riskRatio: riskRatio,
            riskLevel: riskLevel
        },
        monthlyData: monthlyData,
        dailyData: dailyData
    };
}

function round(num, decimals) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// معالجة جميع الطلبات - POST و GET
app.all('*', (req, res) => {
    // إذا كان POST - حساب الأرباح
    if (req.method === 'POST') {
        try {
            const results = calculateProfits(req.body);
            res.json({ success: true, data: results });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: 'حدث خطأ في الحسابات: ' + error.message
            });
        }
    } else {
        // إذا كان GET - إرجاع رسالة ترحيب
        res.json({
            success: true,
            message: 'Trading Calculator API is running',
            version: '2.0.0'
        });
    }
});

module.exports = app;
module.exports.handler = serverless(app);

