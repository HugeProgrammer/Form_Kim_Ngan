const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

const formTemplates = [
  { id: 'don-xin-loi', title: '🙇 Đơn Xin Lỗi', fields: [] },
  { id: 'phieu-cam-on', title: '💖 Phiếu Cảm Ơn', fields: [] }
];

app.get('/api/templates', (req, res) => res.json(formTemplates));

app.get('/api/forms', async (req, res) => {
  const { data, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/submit', async (req, res) => {
  try {
    const { templateId, title, data } = req.body;
    const { error } = await supabase
      .from('forms')
      .insert([{ templateId, title, data, status: 'Đang chờ em bé... ⏳', rejectClicks: 0 }]);
    if (error) throw error;

    try {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'huytp2023@gmail.com',
        subject: `Ting ting! Có đơn [${title}] mới!`,
        html: `<p>Có đơn mới chờ bé duyệt nè!</p>`
      });
    } catch (e) { console.error('Lỗi Resend:', e); }

    res.status(200).json({ message: 'Thành công!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server chạy tại port ${PORT}`));