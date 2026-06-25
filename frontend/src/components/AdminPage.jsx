import { useState, useEffect } from 'react';

export default function AdminPage() {
  // ==========================================
  // STATE BẢO MẬT (MÀN HÌNH KHÓA)
  // ==========================================
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState('');
  const SECRET_PIN = "0912"; 

  // ==========================================
  // STATE QUẢN LÝ FORM & LIVE LOGS
  // ==========================================
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [liveForms, setLiveForms] = useState([]); // Chứa danh sách đơn live từ database

  // ==========================================
  // HÀM FETCH DATA
  // ==========================================
  const fetchLiveForms = () => {
    fetch('https://form-kim-ngan.onrender.com/api/forms')
      .then((res) => res.json())
      .then((data) => setLiveForms(data))
      .catch((err) => console.error('Lỗi lấy nhật ký đơn:', err));
  };

  // Fetch dữ liệu ban đầu khi load trang
  useEffect(() => {
    // Lấy danh sách mẫu đơn
    fetch('https://form-kim-ngan.onrender.com/api/templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data))
      .catch((err) => console.error('Lỗi fetch templates:', err));

    // Lấy danh sách đơn live từ database
    fetchLiveForms();
  }, []);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template || null);
    setFormData({});
    setMessage('');
  };

  const handleInputChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      const response = await fetch('https://form-kim-ngan.onrender.com/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          title: selectedTemplate.title,
          data: formData
        })
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('🎉 ' + result.message);
        setFormData({});
        fetchLiveForms(); // Tự động reload lại bảng theo dõi
      } else {
        setMessage('❌ Có lỗi xảy ra: ' + result.error);
      }
    } catch (error) {
      console.error('Lỗi submit đơn:', error);
      setMessage('❌ Không thể kết nối tới server.');
    }
  };

  // ĐÃ BỔ SUNG LẠI: HÀM XÓA ĐƠN VĨNH VIỄN ĐỂ SỬA LỖI GẠCH CHÂN TRONG VS CODE
  const handleDeleteForm = async (formId) => {
    if (!window.confirm('Xóa vĩnh viễn đơn này khỏi hệ thống chỉ huy chứ sếp Huy? 💥')) return;
    try {
      const response = await fetch(`https://form-kim-ngan.onrender.com/api/forms/${formId}`, { method: 'DELETE' });
      if (response.ok) {
        setLiveForms((prev) => prev.filter((f) => f.id !== formId));
      }
    } catch (error) {
      console.error('Lỗi xóa đơn:', error);
    }
  };

  // HÀM HỒI SINH ĐƠN VÀ GỬI LẠI LÊN FRONTEND
  const handleResendForm = async (formId) => {
    if (!window.confirm('Sếp muốn gửi lại đơn này lên màn hình cho công chúa duyệt lại? 💌')) return;
    try {
      const response = await fetch(`https://form-kim-ngan.onrender.com/api/forms/${formId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Đang chờ em bé... ⏳', // Đặt lại trạng thái mặc định
          babyCondition: '', // Xóa điều kiện cũ bé đã nhập
          rejectClicks: 0 // Reset số lần bấm từ chối về 0
        })
      });
      if (response.ok) {
        setMessage('✅ Đã hồi sinh và gửi lại đơn thành công!');
        fetchLiveForms(); // Làm mới lại bảng để thấy kết quả ngay
      }
    } catch (error) {
      console.error('Lỗi gửi lại đơn:', error);
    }
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (passcode === SECRET_PIN) {
      setIsLocked(false);
    } else {
      alert('Sai mật khẩu rồi nha! Giao diện này chỉ dành cho anh Huy thôi 😤');
      setPasscode('');
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-sm w-full text-center">
          <span className="text-5xl block mb-4">🔐</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Khu Vực Tuyệt Mật</h2>
          <p className="text-gray-500 text-sm mb-6">Vui lòng nhập mã PIN để vào trung tâm chỉ huy.</p>
          
          <form onSubmit={handleUnlock}>
            <input
              type="password"
              placeholder="Nhập mã PIN..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-center text-xl tracking-widest focus:outline-none focus:border-blue-500 mb-4"
              autoFocus
            />
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all"
            >
              Mở Khóa
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-5xl mx-auto space-y-10">
      
      {/* HEADER BẢO MẬT */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Admin</h2>
        </div>
        <button 
          onClick={() => setIsLocked(true)} 
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-all"
        >
          🔒 Khóa lại
        </button>
      </div>

      {/* BƯỚC TẠO FORM */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bước 1: Chọn mẫu đơn công việc</label>
          <select
            onChange={handleTemplateChange}
            defaultValue=""
            className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>-- Vui lòng chọn một mẫu đơn --</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        {selectedTemplate && (
          <form onSubmit={handleSubmit} className="border-t border-gray-100 pt-6 space-y-5">
            <h3 className="text-lg font-bold text-blue-600 mb-4">Bước 2: Nhập thông tin cho [{selectedTemplate.title}]</h3>
            
            {selectedTemplate.fields.map((field) => (
              <div key={field.name} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required === false ? false : true}
                    rows={4}
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required === false ? false : true}
                    className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white font-semibold p-3 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Đăng tải lên Frontend
            </button>
          </form>
        )}

        {message && (
          <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium">
            {message}
          </div>
        )}
      </div>

      {/* BẢNG THEO DÕI LIVE */}
      <div className="border-t-2 border-dashed border-gray-200 pt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              📊 Nhật Ký Thao Tác Của cục dàng
            </h3>
            <p className="text-xs text-gray-400 mt-1">Dữ liệu được cập nhật trực tiếp từ Supabase Cloud.</p>
          </div>
          <button 
            onClick={fetchLiveForms}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold px-4 py-2 rounded-xl text-sm transition-all flex items-center gap-1 shadow-sm"
          >
            🔄 Bấm để làm mới
          </button>
        </div>

        {liveForms.length === 0 ? (
          <div className="text-center py-8 text-gray-400 italic border rounded-xl bg-gray-50">
            Hệ thống trống! Chưa có đơn nào được phát hành.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-bold border-b">
                <tr>
                  <th className="px-4 py-3">Nội Dung Đơn Từ</th>
                  <th className="px-4 py-3">Trạng Thái Thao Tác</th>
                  <th className="px-4 py-3">Giao Kèo Của Bé</th>
                  <th className="px-4 py-3 text-center">Số Lần Click Từ Chối</th>
                  <th className="px-4 py-3 text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {liveForms.map((form) => {
                  let statusStyle = "text-gray-800 font-medium";
                  const statusText = form.status || 'Đang chờ em bé... ⏳';
                  
                  if (statusText.includes('Đã ký')) statusStyle = "text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full";
                  else if (statusText.includes('Từ Chối (')) statusStyle = "text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full";
                  else if (statusText.includes('phũ phàng')) statusStyle = "text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-full";

return (
                    <tr key={form.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* CỘT 1: HIỂN THỊ TÊN ĐƠN VÀ CHI TIẾT CÁC TRƯỜNG THÔNG TIN SẾP ĐÃ NHẬP */}
                      <td className="px-4 py-4 align-top">
                        <p className="font-bold text-gray-900 text-base">{form.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 mb-2">Ngày tạo: {form.submittedAt || 'Không rõ'}</p>
                        
                        {/* Box bóc tách dữ liệu sếp đã điền */}
                        {form.data && Object.keys(form.data).length > 0 && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm w-max min-w-[250px] max-w-md mt-2">
                            <ul className="space-y-1.5">
                              {Object.entries(form.data).map(([key, value]) => (
                                <li key={key} className="text-sm flex flex-col sm:flex-row sm:gap-2">
                                  <span className="font-semibold text-slate-600 shrink-0 capitalize">
                                    • {key}:
                                  </span>
                                  <span className="text-slate-800 whitespace-pre-wrap break-words font-medium">
                                    {value}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </td>

                      {/* CÁC CỘT CÒN LẠI (Trạng thái, Yêu cầu của bé...) */}
                      <td className="px-4 py-4 align-top">
                        <span className={statusStyle}>{statusText}</span>
                      </td>
                      <td className="px-4 py-4 align-top max-w-xs truncate font-medium text-gray-700 italic">
                        {form.babyCondition || 'Chưa có yêu cầu'}
                      </td>
                      <td className="px-4 py-4 align-top text-center font-black text-red-500 text-lg">
                        {form.rejectClicks || 0}
                      </td>
                      <td className="px-4 py-4 align-top text-center flex justify-center gap-3">
                        <button
                          onClick={() => handleResendForm(form.id)}
                          className="text-gray-400 hover:text-blue-500 p-2 bg-white rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md text-base"
                          title="Hồi sinh & Gửi lại đơn này"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => handleDeleteForm(form.id)}
                          className="text-gray-400 hover:text-red-500 p-2 bg-white rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md text-base"
                          title="Hủy đơn vĩnh viễn"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}