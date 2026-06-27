const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. KẾT NỐI SUPABASE & RESEND
// ==========================================
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// 2. DANH SÁCH FORM MẪU CỦA SẾP
// ==========================================
const formTemplates = [
  {
    id: 'don-xin-loi',
    title: '🙇 Đơn Xin Lỗi (Thành Khẩn)',
    fields: [
      { name: 'hovaten', label: 'Họ và tên', type: 'textarea', placeholder: 'Người gửi', required: true },
      { name: 'loiXinLoi', label: 'Tội trạng của anh', type: 'textarea', placeholder: 'Anh đã làm gì sai...', required: true },
      { name: 'loiHua', label: 'Lời hứa sửa đổi', type: 'textarea', placeholder: 'Anh hứa sẽ không tái phạm...', required: true },
    ]
  },
  {
    id: 'phieu-cam-on',
    title: '💖 Phiếu Cảm Ơn (Ngọt Ngào)',
    fields: [
      { name: 'lyDo', label: 'Lý do cảm ơn', type: 'textarea', placeholder: 'Vì em đã...', required: true },
      { name: 'loiYeuThuong', label: 'Mong muốn ở các lần đi chơi tiếp theo', type: 'textarea', placeholder: 'Yêu bé nhất trên đời...', required: true }
    ]
  },
  {
    id: 'don-giu-do',
    title: '📦 Đơn Đăng Ký Giữ Đồ',
    fields: [
      { name: 'nguoiGui', label: 'Tên người gửi', type: 'text', placeholder: 'Ví dụ: Huy,' },
      { name: 'tenMonDo', label: 'Món đồ muốn gửi gắm', type: 'text', placeholder: 'Áo quần' },
      { name: 'loiNhan', label: 'Lời nhắn gửi', type: 'textarea', placeholder: 'Nhớ giữ kĩ nha...' }
    ]
  },
{
    id: 'moi-di-choi',
    name: '🛵 Vé Mời Đi Chơi',
    fields: [
      { id: 'nguoiMoi', label: 'Tên tài xế', placeholder: 'Huy dắt đi chơi...' },
      { id: 'diaDiem', label: 'Địa điểm', placeholder: 'Vạn Hạnh Mall, Phố đi bộ...' },
      { id: 'thoiGian', label: 'Thời điểm', placeholder: '7h tối nay, hoặc cuối tuần này nhé...' }, 
      { id: 'ghiChu', label: 'Ghi chú (Note)', placeholder: 'Viết thêm lời dặn dò, ví dụ: Nhớ mặc áo khoác nha...' } 
    ]
  },
  {
    id: 'moi-di-ks',
    title: '🌙 Vé Nghỉ Dưỡng',
    fields: [
      { name: 'nguoiMoi', label: 'Người rủ rê', type: 'text', placeholder: 'Chồng iu' },
      { name: 'diaDiem', label: 'Tên địa điểm', type: 'text', placeholder: 'Khách sạn ngàn sao...' },
      { name: 'hoatDong', label: 'Kế hoạch', type: 'textarea', placeholder: 'Cùng xem phim, ôm nhau ngủ...' }
    ]
  },
  {
    id: 'moi-di-an',
    title: '🍣🍻 Thư Mời Ăn / Nhậu',
    fields: [
      { name: 'loaiHinh', label: 'Thể loại ("Đi ăn" / "Đi nhậu")', type: 'text', placeholder: 'Đi ăn ngoan/Đi nhậu bét nhè', required: true },
      { name: 'monAn', label: 'Món chính / Mồi', type: 'text', placeholder: 'Sushi, Lẩu, Ốc...', required: true },
      { name: 'diaChi', label: 'Địa chỉ', type: 'text', placeholder: 'Địa chỉ quán...', required: true },
      { name: 'clipReview', label: 'Link clip review (Để trống nếu hông có)', type: 'text', placeholder: 'Dán link Tóp Tóp...', required: false },
      { name: 'loiHua', label: 'Lời thề', type: 'text', placeholder: 'Nhậu say anh cõng, ăn no anh lăn!', required: true }
    ]
  },
  {
    id: 'xin-hun-om',
    title: '💋 Phiếu Xin Hun, Ôm',
    fields: [
      { name: 'nguoiXin', label: 'Kẻ thèm khát', type: 'text', placeholder: 'Anh nhà...' },
      { name: 'soLuong', label: 'Số lượng', type: 'text', placeholder: '100 cái hun, ôm chặt 30 phút' },
      { name: 'lyDo', label: 'Lý do', type: 'textarea', placeholder: 'Vì nhớ em bé quá...' }
    ]
  },
  {
    id: 'xin-phep-hoat-dong',
    title: '🎮🍻 Đơn Xin Cấp Phép Hoạt Động Riêng',
    fields: [
      { name: 'hoatDong', label: 'Hoạt động xin tham gia', type: 'text', placeholder: 'Chơi game với bạn, đi nhậu', required: true },
      { name: 'thoiGian', label: 'Thời gian xin phép (Từ mấy giờ đến mấy giờ)', type: 'text', placeholder: 'Từ 8h đến 10h tối nay...', required: true },
      { name: 'loiHua', label: 'Lời hứa', type: 'textarea', placeholder: 'Hứa sẽ rep tin nhắn đầy đủ, không để điện thoại im lặng, về đúng giờ...', required: true }
    ]
  },
  {
    id: 'xin-them-gio-hen-ho',
    title: '⏳ Đơn Xin Gia Hạn Thời Gian Đi Chơi',
    fields: [
      { name: 'lyDo', label: 'Lý do chưa muốn đưa em về', type: 'textarea', placeholder: 'Vì ôm chưa đã, nhìn em bé chưa chán, phố xá còn vui...', required: true },
      { name: 'thoiGianXinThem', label: 'Thời gian xin ở lại thêm', type: 'text', placeholder: 'Xin gia hạn thêm 30 phút/1 tiếng nữa...', required: true }
    ]
  },
  {
    id: 'yeu-cau-cuu-tro',
    title: '🚨 Đơn Đề Nghị Cứu Trợ Tình Cảm Khẩn Cấp',
    fields: [
      { name: 'tinhTrang', label: 'Tình trạng sức khỏe tâm lý của anh', type: 'textarea', placeholder: 'Nhớ em bé đến mức không tập trung code được, cạn kiệt năng lượng...', required: true },
      { name: 'bienPhap', label: 'Biện pháp cấp cứu mong muốn', type: 'text', placeholder: 'Cần một cuộc gọi video 5 phút hoặc một cái hẹn gặp gấp tối nay...', required: true }
    ]
  }
];

// ==========================================
// 3. CÁC API ENDPOINTS
// ==========================================
app.get('/api/templates', (req, res) => {
  res.json(formTemplates);
});

app.get('/api/forms', async (req, res) => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Lỗi lấy data:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// DỊCH VỤ GỬI MAIL KHI NHẤN NÚT HỒI SINH ĐƠN
app.post('/api/resend-email', async (req, res) => {
  const { title } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [process.env.RECEIVER_EMAIL || 'huytp2020@gmail.com'], // Vẫn gửi về mail sếp để hệ thống tự forward
      subject: `💌 Ting ting! Anh gửi lại đơn ${title} nè bé ơi!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdf2f8; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px 20px; border-radius: 20px; box-shadow: 0 10px 25px rgba(236, 72, 153, 0.15);">
            <div style="font-size: 40px; margin-bottom: 10px;">🥺</div>
            <h2 style="color: #db2777; margin-top: 0; font-size: 24px;">Ting ting! 💌</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Anh iu của bé vừa kiên trì <b>gửi lại 1 đơn cũ</b> nè. Chắc là muốn được duyệt lắm rồi đó!</p>
            
            <div style="background-color: #fce7f3; border-left: 5px solid #ec4899; padding: 15px; margin: 25px 0; border-radius: 0 10px 10px 0; text-align: left;">
              <h3 style="color: #be185d; margin: 0; font-size: 18px;">📋 ${title}</h3>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">Bé vào xem xét lại tình hình rồi giơ cao đánh khẽ, ký duyệt cho anh nha! ❤️</p>
            
            <p style="font-size: 16px; color: #4b5563; margin-bottom: 0; font-weight: bold;">Mở web tại đây: <a href="https://form-be-iu.vercel.app/" style="color: #2563eb; text-decoration: underline; font-weight: normal;">https://form-be-iu.vercel.app/</a></p>
          </div>
        </div>
      `
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Lỗi gửi mail hồi sinh:', error);
    res.status(500).json({ error: 'Lỗi không gửi được mail' });
  }
});
// DỊCH VỤ GỬI MAIL NHẮC NHỞ DUYỆT ĐƠN (PING)
app.post('/api/remind-email', async (req, res) => {
  const { title } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [process.env.RECEIVER_EMAIL || 'huytp2020@gmail.com'],
      subject: `🔔 Nhắc nhẹ: Có đơn "${title}" đang chờ bé duyệt nè!`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdf2f8; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px 20px; border-radius: 20px; box-shadow: 0 10px 25px rgba(236, 72, 153, 0.15);">
            <div style="font-size: 40px; margin-bottom: 10px;">⏰</div>
            <h2 style="color: #db2777; margin-top: 0; font-size: 24px;">Ting ting nhắc nhẹ! 🔔</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Cục dàng ơi có đơn em bé quên phản hồi ròi nè:</p>
            
            <div style="background-color: #fce7f3; border-left: 5px solid #ec4899; padding: 15px; margin: 25px 0; border-radius: 0 10px 10px 0; text-align: left;">
              <h3 style="color: #be185d; margin: 0; font-size: 18px;">📋 ${title}</h3>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">Nào bé rảnh vào phản hồi giúp anh với anh ❤️</p>
            
            <p style="font-size: 16px; color: #4b5563; margin-bottom: 0; font-weight: bold;">Mở web lẹ nè: <a href="https://form-be-iu.vercel.app/" style="color: #2563eb; text-decoration: underline; font-weight: normal;">https://form-be-iu.vercel.app/</a></p>
          </div>
        </div>
      `
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Lỗi gửi mail nhắc nhở:', error);
    res.status(500).json({ error: 'Lỗi không gửi được mail' });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    const { templateId, title, data } = req.body;

    // 1. Lưu vào Supabase
    const { error: insertError } = await supabase
      .from('forms')
      .insert([{ templateId, title, data, status: 'Đang chờ em bé... ⏳', rejectClicks: 0 }]);

    if (insertError) throw insertError;

    // 2. Gửi mail qua Resend
    try {
      const emailResponse = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'huytp2020@gmail.com',
        subject: `hé lô cục dàng! Có một [${title}] mới vừa được gửi tới nè! 🥰`,
html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffe4e6; padding: 40px 20px; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px 20px; border-radius: 20px; box-shadow: 0 10px 25px rgba(225, 29, 72, 0.1);">
              <h2 style="color: #e11d48; margin-top: 0; font-size: 24px;">Ting ting! 💌</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Chào công chúa, anh vừa làm một đơn mới lên web nè:</p>
              
              <div style="background-color: #fce7f3; border-left: 5px solid #db2777; padding: 15px; margin: 25px 0; border-radius: 0 10px 10px 0; text-align: left;">
                <h3 style="color: #db2777; margin: 0; font-size: 18px;">📋 ${title}</h3>
              </div>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">Em bé xem xét và ký duyệt cho anh với nha! ❤️</p>
              
<p style="font-size: 16px; color: #4b5563; font-weight: bold;">Link web: <a href="https://form-be-iu.vercel.app/" style="color: #2563eb; text-decoration: underline; font-weight: normal;">https://form-be-iu.vercel.app/</a></p>
            </div>
          </div>
        `
      });
      console.log('Thành công mỹ mãn, đã gửi qua Resend:', emailResponse);
    } catch (resendError) {
      console.error('Lỗi khi gửi qua Resend:', resendError);
    }

    res.status(200).json({ message: 'Tạo đơn và gửi thông báo thành công!' });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/forms/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('forms').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Đã xé đơn thành công!' });
});

app.put('/api/forms/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { status, babyCondition, rejectClicks } = req.body;
  const { data, error } = await supabase.from('forms').update({ status, babyCondition, rejectClicks }).eq('id', id).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Đã báo cáo về cho anh iu của em bé! 🫡', data: data[0] });
});

// ==========================================
// 4. KHỞI ĐỘNG SERVER
// ==========================================
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server đang chạy ổn định tại port ${PORT}`);
});