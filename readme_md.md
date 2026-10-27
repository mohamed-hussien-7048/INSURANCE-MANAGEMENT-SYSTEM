# 🛡️ نظام إدارة التأمين (Insurance Management System)

---

سيستم متكامل (Full-Stack) لإدارة التأمين والعملاء، مبني بأحدث التقنيات وبأداء قوي عشان ينجز معاك في العمليات اليومية.

---

## 💡 التقنيات المستخدمة

* **React & TypeScript** (عشان الواجهة تكون سريعة ومظبوطة بدون أخطاء Type)

* **Node.js & Express** (عشان الـ Backend والـ APIs تكون خفيفة ومستقرة)

* **Microsoft SQL Server** (عشان قواعد البيانات وتخزين البيانات الضخمة بأمان)

---

## 🛠️ المتطلبات قبل التشغيل (Requirements)

عشان تشغل السيستم عندك على الجهاز محتاج تجهز الحاجات دي:

* **Node.js & npm** مثبتين عندك.

* **Microsoft SQL Server** شغال ومضبوط.

* تعريف **ODBC Driver 18 for SQL Server**.

* تظبيط **Windows Authentication** للاتصال بقاعدة البيانات.

---

## 📂 تقسيم أجزاء المشروع (Project Structure)

* `backend/` 👈 الـ API، الصلاحيات (Auth/Authorization)، والربط مع قاعدة البيانات.

* `frontend/` 👈 واجهة المستخدم الفرونت إند بـ React.

* `database/` 👈 السكريبتات والـ Migrations الخاصة بقاعدة البيانات.

---

## ⚙️ التجهيز وإعدادات البيئة (Configuration)

هتعمل ملفات الـ Environment المحلية من النسخ النموذجية:

1. خد نسخة من `backend/.env.example` وسميها `backend/.env`

2. خد نسخة من `frontend/.env.example` وسميها `frontend/.env`


في ملف `backend/.env` اكتب اسم الـ SQL Server Instance واسم قاعدة البيانات، وتأكد إن البورت مضبوط على `3001`.

في ملف الفرونت إند اضبط رابط الـ API كالتالي:

`VITE_API_URL=http://localhost:3001/api`

> ⚠️ **تنبيه هام:** أوعى ترفع ملفات الـ `.env` أو بيانات الدخول الحقيقية على Git!

---

## 🚀 طريقة التشغيل على جهازك (Run Locally)

افتح نافذتين **PowerShell** منفصلين ونفذ الخطوات دي:

### 1️⃣ الـ Backend

```powershell
Set-Location "H:\S-Software Engineer\Test_Project\FAHD_1\backend"

npm install

npm run dev
```

<br>

### 2️⃣ الـ Frontend

```powershell
Set-Location "H:\S-Software Engineer\Test_Project\FAHD_1\frontend"

npm install

npm run dev
```

<br>

افتح اللينك اللي هيطلعلك من Vite في المتصفح، وعادة بيكون:  
`http://localhost:5173`

---

## 🧪 الاختبارات والتأكد من الكود (Verification)

عشان تتأكد إن كل حاجة شغال تمام ومن غير أخطاء:

### من فولدر الـ `backend` تشغل:

```powershell
npm test

npm run typecheck

npm run build
```

<br>

### من فولدر الـ `frontend` تشغل:

```powershell
npm test

npm run lint

npm run build
```

---

## 🩺 فحص حالة الـ API (Health Check)

والـ Backend شغال، تقدر تفتح اللينك ده من المتصفح لتأكيد إن الـ API شغال وبخير:  
`http://localhost:3001/api/health`

---

## 🔒 الأمان وحماية البيانات (Security)

* الصلاحيات والتحقق (Authorization) بتم بالكامل من ناحية الـ Backend.

* السيستم بيعتمد على الـ Session Cookies والحماية من هجمات CSRF.

* راجع الـ Database Migrations كويس قبل ما تطبقها على داتا حقيقية.

* خد دايماً **Backup (نسخة احتياطية)** للبيانات المهمة قبل أي تعديل على الداتابيز.

---

## 🔌 المنافذ المستخدمة (Service Ports)

* **Insurance API:** Port `3001`

* **Frontend Dev Server:** Port `5173`

* **Attendance Service:** Port `3000` *(خدمة منفصلة ملهاش دعوة بالمشروع ده ومبتتعدلش)*

---

❤️ **تم التطوير بواسطة Techno Science**