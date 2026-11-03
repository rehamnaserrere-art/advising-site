// 1. إعدادات Supabase
const SUPABASE_URL = 'https://xylmdahldlkwvkjjjfdj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3WIU1Le_QMyRZk-Wj9rx9g_LQz524Y3';

// 2. رابط دالة جلب الملفات
const GET_FILES_URL = 'https://xylmdahldlkwvkjjjfdj.supabase.co/functions/v1/get-files';

// جلب روابط الملفات ووضعها في الأزرار
async function fetchFileLinks() {
    try {
        const res = await fetch(GET_FILES_URL, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const links = await res.json();
        
        // إعداد صورة الخلفية
        if (links.background) {
            document.body.style.backgroundImage = `url('${links.background}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        }

        // تحويل روابط المعاينة إلى روابط مباشرة تفتح بدون تسجيل دخول جوجل
        document.getElementById('btn-form1').href = links.add_drop.replace('/preview', '/view') || '#';
        document.getElementById('btn-form2').href = links.withdrawal.replace('/preview', '/view') || '#';
        
    } catch (e) {
        console.log("خطأ في جلب الملفات", e);
    }
}

// دوال التنقل بين الشاشات
function showLoginScreen() {
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('error-msg').style.display = 'none';
    document.getElementById('national-id').value = '';
}

function goBack() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
}

// البحث عن الطالب
async function login() {
    const nationalId = document.getElementById('national-id').value;
    const errorMsg = document.getElementById('error-msg');

    if (nationalId.length !== 14) {
        errorMsg.innerText = "يرجى إدخال الرقم القومي كاملاً (14 رقماً)";
        errorMsg.style.display = 'block';
        return;
    }

    errorMsg.innerText = "جاري البحث...";
    errorMsg.style.color = "blue";
    errorMsg.style.display = 'block';

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/students?national_id=eq.${nationalId}`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });

        const data = await response.json();

        if (data.length === 0) {
            errorMsg.innerText = "هذا الرقم القومي غير مسجل.";
            errorMsg.style.color = "red";
            return;
        }

        const student = data[0];
        document.getElementById('student-name').innerText = student.student_name;
        
        const advisorInfo = document.getElementById('advisor-info');
        if (student.advisor_name) {
            advisorInfo.innerHTML = `
                <strong>اسم المرشد:</strong> ${student.advisor_name} <br>
                <strong>القسم العلمي:</strong> ${student.advisor_department || 'غير محدد'} <br>
                <strong>رقم الهاتف:</strong> ${student.advisor_phone || 'غير متوفر'}
            `;
        } else {
            advisorInfo.innerText = "لم يتم تعيين مرشد لهذا الطالب في قاعدة البيانات.";
        }

        // الانتقال لشاشة النتيجة
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('result-screen').classList.add('active');

    } catch (error) {
        errorMsg.innerText = "حدث خطأ في الاتصال.";
        errorMsg.style.color = "red";
    }
}

// عند تحميل الصفحة
window.onload = () => {
    fetchFileLinks();
};
