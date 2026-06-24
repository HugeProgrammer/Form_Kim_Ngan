const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 5000;
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
app.use(cors());
app.use(express.json());

// ==========================================
// 1. KẾT NỐI SUPABASE (Thay key của bạn vào 2 dòng dưới)
// ==========================================
const supabaseUrl = 'https://cetmkybsibkspqhtouca.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldG1reWJzaWJrc3BxaHRvdWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxOTA4NTgsImV4cCI6MjA5Nzc2Njg1OH0.J5npUXcpVVdwkS7TyLewKgbUWchZLaF_wls1TjluIDo';
const supabase = createClient(supabaseUrl, supabaseKey);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'huytp2020@gmail.com', // Thay bằng email của sếp
    pass: 'vxgqzsavvsfavvwm' // Nhập mã vừa copy ở Bước 2 (viết liền không dấu cách)
  }
});
// ==========================================
// 2. DANH SÁCH FORM MẪU (Dành cho Admin)
// ==========================================
// ==========================================
// 2. DANH SÁCH FORM MẪU (Dành cho Admin)
// ==========================================
const formTemplates = [
  {
    id: 'don-xin-loi',
    title: '🙇 Đơn Xin Lỗi (Thành Khẩn)',
    fields: [
      { name: 'hovaten', label: 'Họ và tên', type: 'textarea', placeholder: 'Thằng bồ tồi tệ', required: true },
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

// Endpoint lấy danh sách form mẫu
app.get('/api/templates', (req, res) => {
  res.json(formTemplates);
});

// ==========================================
// 3. LẤY DỮ LIỆU TỪ SUPABASE (Cho trang Client)
// ==========================================
app.get('/api/forms', async (req, res) => {
  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .order('created_at', { ascending: false }); // Mới nhất lên đầu

  if (error) {
    console.error('Lỗi lấy data:', error);
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// ==========================================
// 4. LƯU ĐƠN MỚI LÊN SUPABASE (Từ trang Admin)
// ==========================================
app.post('/api/submit', async (req, res) => {
  try {
    const { templateId, title, data } = req.body;

    // 1. GỌI LỆNH LƯU VÀO SUPABASE TRƯỚC
    const { data: insertedData, error } = await supabase
      .from('forms')
      .insert([{ templateId, title, data, status: 'Đang chờ em bé... ⏳', rejectClicks: 0 }]);

    if (error) throw error; // Nếu lưu lỗi, nó sẽ nhảy xuống phần catch

    // 2. NẾU LƯU THÀNH CÔNG, BẮT ĐẦU GỬI MAIL
    const mailOptions = {
      from: '"Hộp thư Kim Ngân 💌" <huytp2020@gmail.com>',
      to: 'huytp2023@gmail.com',
      subject: `Ting ting! Có một [${title}] mới vừa được gửi tới nè! 🥰`,
      html: `
        <div style="font-family: sans-serif; background-color: #fdf2f8; padding: 20px; border-radius: 15px;">
          <h2 style="color: #db2777;">Chào công chúa,</h2>
          <p>Anh vừa đệ trình một đơn mới lên hệ thống:</p>
          <h3 style="color: #2563eb;">📋 ${title}</h3>
          <p>Bé mau mở web lên để ký duyệt nha! ❤️</p>
        </div>
      `
    };

console.log('Đang chuẩn bị gọi lệnh gửi mail...'); // Dòng này quan trọng

// XÓA ĐOẠN transporter.sendMail(...) CŨ ĐI, THAY BẰNG:

try {
  await resend.emails.send({
    from: 'onboarding@resend.dev', // Sếp dùng mail này gửi đi
    to: 'huytp2023@gmail.com',     // Mail nhận
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
  console.log('Đã gửi thông báo qua Resend thành công!');
} catch (resendError) {
  console.error('Lỗi khi gửi qua Resend:', resendError);
}

    res.status(200).json({ message: 'Tạo đơn và gửi thông báo thành công!' });
  } catch (error) {
    console.error('Lỗi server:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server đang chạy tại: http://localhost:${PORT}`);
});
// ==========================================
// 5. XÓA ĐƠN KHỎI SUPABASE
// ==========================================
app.delete('/api/forms/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('forms')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Lỗi khi xóa data:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Đã xé đơn thành công!' });
});

// ==========================================
// 6. CẬP NHẬT PHẢN HỒI CỦA EM BÉ (Từ Client)
// ==========================================
app.put('/api/forms/:id/respond', async (req, res) => {
  const { id } = req.params;
  const { status, babyCondition, rejectClicks } = req.body;

  const { data, error } = await supabase
    .from('forms')
    .update({ status, babyCondition, rejectClicks })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Lỗi cập nhật phản hồi:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json({ message: 'Đã báo cáo về cho anh Huy! 🫡', data: data[0] });
});