// 1. إعدادات Supabase
const SUPABASE_URL = 'https://xylmdahldlkwvkjjjfdj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3WIU1Le_QMyRZk-Wj9rx9g_LQz524Y3';

// 2. رابط دالة جلب الملفات من جوجل درايف
const GET_FILES_URL = 'https://xylmdahldlkwvkjjjfdj.supabase.co/functions/v1/get-files';

// 3. متغيرات لحفظ الروابط
let driveLinks = { add_drop: '', withdrawal: '', background: '' };

// دالة لجلب الروابط عند فتح الصفحة (تعمل بالاسم وليس بالمعرف)
async function fetchFileLinks() {
    try {
        const res = await fetch(GET_FILES_URL, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        driveLinks = await res.json();
        
        // تعيين صورة الخلفية تلقائياً
        if (driveLinks.background) {
            document.body.style.backgroundImage = `url('${driveLinks.background}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        }

        // تعيين روابط ملفات الـ PDF
        document.getElementById('btn-form1').href = driveLinks.add_drop || '#';
        document.getElementById('btn-form2').href = driveLinks.withdrawal || '#';
        
    } catch (e) {
        console.log("خطأ في جلب الملفات", e);
    }
}

// دالة تسجيل الدخول
async function login() {
    const nationalId = document.getElementById('national-id').value;
    const errorMsg = document.getElementById('error-msg');

    if (nationalId.length < 14) {
        errorMsg.innerText = "يرجى إدخال الرقم القومي كاملاً (14 رقماً)";
        errorMsg.style.display = 'block';
        return;
    }

    errorMsg.innerText = "جاري التحقق...";
    errorMsg.style.color = "blue";
    errorMsg.style.display = 'block';

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/students?national_id=eq.${nationalId}`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        const data = await response.json();

        if (data.length === 0) {
            errorMsg.innerText = "هذا الرقم القومي غير مسجل.";
            errorMsg.style.color = "red";
            return;
        }

        const student = data[0];
        document.getElementById('student-name').innerText = student.student_name;
        
        // يمكنك لاحقاً جلب اسم المرشد من جدول آخر، حالياً سنضع نصاً مؤقتاً
        document.getElementById('advisor-name').innerText = "يرجى مراجعة شؤون الطلاب";

        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('services-screen').classList.add('active');
        localStorage.setItem('loggedInStudent', nationalId);

    } catch (error) {
        errorMsg.innerText = "حدث خطأ في الاتصال.";
        errorMsg.style.color = "red";
    }
}

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('loggedInStudent');
    document.getElementById('services-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('national-id').value = '';
    document.getElementById('error-msg').style.display = 'none';
}

// عند تحميل الصفحة لأول مرة
window.onload = () => {
    fetchFileLinks(); // اجلب روابط الملفات من درايف
    
    const savedId = localStorage.getItem('loggedInStudent');
    if (savedId) {
        document.getElementById('national-id').value = savedId;
        login();
    }
}