const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const serverless = require('serverless-http');

const app = express();

// إعداد محرك القوالب
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../../public')));

// دعم اللغات
const supportedLanguages = ['ar', 'en', 'ru', 'fr', 'tr'];
const defaultLanguage = 'ar';

// Middleware لتحديد اللغة
app.use((req, res, next) => {
    // تحديد اللغة من query parameter أولاً
    let language = req.query.lang;
    
    // إذا لم تكن موجودة، احصل على لغة المتصفح
    if (!language) {
        const acceptLanguage = req.headers['accept-language'];
        if (acceptLanguage) {
            // احصل على أول لغة مدعومة من Accept-Language header
            const browserLanguages = acceptLanguage.split(',').map(lang => {
                const [langCode] = lang.trim().split(';');
                return langCode.split('-')[0]; // احصل على كود اللغة فقط (مثل 'en' من 'en-US')
            });
            
            // ابحث عن أول لغة مدعومة
            language = browserLanguages.find(lang => supportedLanguages.includes(lang));
        }
    }
    
    // إذا لم تكن موجودة، استخدم اللغة الافتراضية
    if (!language) {
        language = defaultLanguage;
    }
    
    // التأكد من أن اللغة مدعومة
    if (!supportedLanguages.includes(language)) {
        language = defaultLanguage;
    }
    
    req.language = language;
    res.locals.language = language;
    next();
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.render('index', { 
        results: null,
        language: req.language || 'ar',
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

// مسارات اللغات المختلفة
supportedLanguages.forEach(lang => {
    app.get(`/${lang}`, (req, res) => {
        req.language = lang;
        res.locals.language = lang;
        res.render('index', { 
            results: null,
            language: lang,
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
});

// معالجة النموذج
app.post('/calculate', (req, res) => {
    // إعادة التوجيه إلى API
    res.redirect('/.netlify/functions/api');
});

// معالجة الأخطاء 404
app.use((req, res) => {
    res.status(404).render('404');
});

module.exports = app;
module.exports.handler = serverless(app);

