// 1. إعدادات Supabase
const SUPABASE_URL = 'https://xylmdahldlkwvkjjjfdj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3WIU1Le_QMyRZk-Wj9rx9g_LQz524Y3';
const GET_FILES_URL = 'https://xylmdahldlkwvkjjjfdj.supabase.co/functions/v1/get-files';

async function fetchFileLinks() {
    try {
        const res = await fetch(GET_FILES_URL, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        });
        const links = await res.json();
        
        if (links.background) {
            document.body.style.backgroundImage = `url('${links.background}')`;
        }

        if(links.add_drop) document.getElementById('btn-form1').href = links.add_drop.replace('/preview', '/view');
        if(links.withdrawal) document.getElementById('btn-form2').href = links.withdrawal.replace('/preview', '/view');
        
    } catch (e) {
        console.log("خطأ في جلب الملفات", e);
    }
}

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

async function login() {
    const nationalId = document.getElementById('national-id').value;
    const errorMsg = document.getElementById('error-msg');

    if (nationalId.length !== 14) {
        errorMsg.innerText = "يرجى إدخال الرقم القومي كاملاً (14 رقماً)";
        errorMsg.style.color = "red";
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
            errorMsg.innerText = "هذا الرقم القومي غير مسجل بقاعدة البيانات.";
            errorMsg.style.color = "red";
            return;
        }

        const student = data[0];
        document.getElementById('student-name').innerText = student.student_name;
        
        const advisorInfo = document.getElementById('advisor-info');
        if (student.advisor_name) {
            // هنا يتم وضع المتغيرات في أماكنها الصحيحة
            advisorInfo.innerHTML = `
                <strong>اسم المرشد:</strong> ${student.advisor_name} <br>
                <strong>القسم العلمي:</strong> ${student.advisor_department || 'غير محدد'} <br>
                <strong>رقم الهاتف:</strong> ${student.advisor_phone || 'غير متوفر'}
            `;
        } else {
            advisorInfo.innerText = "لم يتم تعيين مرشد لهذا الطالب بقاعدة البيانات.";
        }

        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('result-screen').classList.add('active');

    } catch (error) {
        errorMsg.innerText = "حدث خطأ في الاتصال بالسيرفر.";
        errorMsg.style.color = "red";
    }
}

window.onload = () => {
    fetchFileLinks();
};
