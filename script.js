// 1. إعدادات Supabase
const SUPABASE_URL = 'https://xylmdahldlkwvkjjjfdj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3WIU1Le_QMyRZk-Wj9rx9g_LQz524Y3';

// 2. رابط دالة جلب الملفات
const GET_FILES_URL = 'https://xylmdahldlkwvkjjjfdj.supabase.co/functions/v1/get-files';

let driveLinks = { add_drop: '', withdrawal: '', background: '' };

// جلب الروابط عند التحميل
async function fetchFileLinks() {
    try {
        const res = await fetch(GET_FILES_URL, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        driveLinks = await res.json();
        
        if (driveLinks.background) {
            document.body.style.backgroundImage = `url('${driveLinks.background}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        }

        // تحويل روابط المعاينة إلى روابط مباشرة (View) لتفتح بدون حساب جوجل
        document.getElementById('btn-form1').href = driveLinks.add_drop.replace('/preview', '/view') || '#';
        document.getElementById('btn-form2').href = driveLinks.withdrawal.replace('/preview', '/view') || '#';
        
    } catch (e) {
        console.log("خطأ في جلب الملفات", e);
    }
}

// تسجيل الدخول
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
        
        // إظهار بيانات المرشد
        const advisorInfo = document.getElementById('advisor-info');
        if (student.advisor_name) {
            advisorInfo.innerHTML = `
                <strong>اسم المرشد:</strong> ${student.advisor_name} <br>
                <strong>القسم العلمي:</strong> ${student.advisor_department || 'غير محدد'} <br>
                <strong>رقم الهاتف:</strong> ${student.advisor_phone || 'غير متوفر'}
            `;
        } else {
            advisorInfo.innerText = "يرجى مراجعة شؤون الطلاب لمعرفة المرشد";
        }

        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('services-screen').classList.add('active');
        localStorage.setItem('loggedInStudent', nationalId);

    } catch (error) {
        errorMsg.innerText = "حدث خطأ في الاتصال.";
        errorMsg.style.color = "red";
    }
}

function logout() {
    localStorage.removeItem('loggedInStudent');
    document.getElementById('services-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('national-id').value = '';
    document.getElementById('error-msg').style.display = 'none';
}

window.onload = () => {
    fetchFileLinks();
    const savedId = localStorage.getItem('loggedInStudent');
    if (savedId) {
        document.getElementById('national-id').value = savedId;
        login();
    }
}
