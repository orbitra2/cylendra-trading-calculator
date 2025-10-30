# دليل نشر الموقع على Netlify

## 📋 متطلبات النشر

1. حساب Netlify (مجاني)
2. Git repository (GitHub, GitLab, أو Bitbucket)

## 🚀 خطوات النشر

### الطريقة 1: النشر عبر Git (موصى بها)

1. **ادفع الكود إلى Git repository:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **اتصل بحساب Netlify:**
   - اذهب إلى [netlify.com](https://netlify.com)
   - اضغط على "New site from Git"
   - اختر Git provider الخاص بك (GitHub, GitLab, أو Bitbucket)
   - اختر repository الخاص بك

3. **إعدادات Build:**
   - **Build command:** `npm install` (أو اتركه فارغًا - Netlify يقوم به تلقائيًا)
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`

4. **اضغط على "Deploy site"**

### الطريقة 2: النشر عبر Netlify CLI

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تسجيل الدخول
netlify login

# النشر
netlify deploy --prod
```

## ⚙️ إعدادات Netlify

الموقع جاهز للنشر! جميع الإعدادات موجودة في `netlify.toml`:

- ✅ Build command: `npm install`
- ✅ Publish directory: `public`
- ✅ Functions directory: `netlify/functions`
- ✅ Redirects للـ API routes
- ✅ Redirects للـ language routes
- ✅ Server-side rendering (SSR) للصفحة الرئيسية

## 🔧 Functions المتاحة

### 1. Server Function (`/.netlify/functions/server`)
- يعرض الصفحة الرئيسية مع دعم اللغات
- يدعم SSR مع EJS templates

### 2. API Function (`/.netlify/functions/api`)
- `/api/calculate` - حساب الأرباح
- `/api/export` - تصدير JSON
- `/api/export/csv` - تصدير CSV

## 🌍 دعم اللغات

الموقع يدعم اللغات التالية:
- 🇸🇦 العربية (`/ar`)
- 🇺🇸 الإنجليزية (`/en`)
- 🇷🇺 الروسية (`/ru`)
- 🇫🇷 الفرنسية (`/fr`)
- 🇹🇷 التركية (`/tr`)

## 📁 هيكل المشروع

```
trading-calculator-nodejs/
├── netlify/
│   ├── functions/
│   │   ├── api.js        # API endpoints
│   │   └── server.js     # SSR server
├── public/               # Static files
│   ├── css/
│   ├── js/
│   ├── images/
│   └── locales/          # Translation files
├── views/                # EJS templates
├── netlify.toml          # Netlify configuration
└── package.json
```

## 🧪 اختبار محلي

قبل النشر، يمكنك اختبار الموقع محليًاynthesis:

```bash
# تثبيت Netlify CLI
npm install -g netlify-cli

# تشغيل Netlify Dev
npm run netlify:dev
# أو
netlify dev
```

## ⚠️ ملاحظات مهمة

1. **Static Files:** الملفات في `public/` يتم تقديمها تلقائيًا من Netlify
2. **Environment Variables:** إذا كنت تستخدم متغيرات بيئة، أضفها في Netlify Dashboard → Site settings → Environment variables
3. **Functions Timeout:** الافتراضي هو 10 ثوانٍ. يمكن زيادة المدة في `netlify.toml`

## 🔗 روابط مفيدة

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects/)

## ✅ التحقق من النشر

بعد النشر، تحقق من:

1. ✅ الصفحة الرئيسية تعمل
2. ✅ تغيير اللغة يعمل
3. ✅ API endpoints تعمل
4. ✅ الرسوم البيانية تعمل
5. ✅ التصدير (JSON/CSV) يعمل

---

**جاهز للنشر! 🎉**

