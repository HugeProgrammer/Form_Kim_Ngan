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
    title: '🛵 Vé Mời Đi Chơi',
    fields: [
      { name: 'nguoiMoi', label: 'Tên tài xế', type: 'text', placeholder: 'Huy dắt đi chơi' },
      { name: 'diaDiem', label: 'Địa điểm', type: 'text', placeholder: 'Vạn Hạnh Mall, Phố đi bộ...' },
      { name: 'thoiGian', label: 'Giờ đón', type: 'text', placeholder: '7h tối nay nhé' }
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
        subject: `Ting ting! Có một [${title}] mới vừa được gửi tới nè! 🥰`,
        html: `
          <div style="font-family: sans-serif; background-color: #fdf2f8; padding: 20px; border-radius: 15px;">
            <h2 style="color: #db2777;">Chào công chúa,</h2>
            <p>Anh vừa đệ trình một đơn mới lên hệ thống:</p>
            <h3 style="color: #2563eb;">📋 ${title}</h3>
            <p>Bé mau mở web lên để ký duyệt nha! ❤️</p>
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