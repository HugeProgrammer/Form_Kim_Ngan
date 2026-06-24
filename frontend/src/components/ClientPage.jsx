import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './ClientPage.css';

export default function ClientPage() {
  const [submittedForms, setSubmittedForms] = useState([]);
  const [conditions, setConditions] = useState({});
  const [rejectClicks, setRejectClicks] = useState({});

  useEffect(() => {
    fetch('http://localhost:5000/api/forms')
      .then((res) => res.json())
      .then((data) => {
        // LỌC THÔNG MINH: Chỉ hiển thị những đơn chưa xử lý xong
        const donChuaXuLy = data.filter((form) => {
          const status = form.status || '';
          // Ẩn đi nếu trạng thái chứa chữ "Đã ký" hoặc "phũ phàng" (từ chối 3 lần)
          return !status.includes('Đã ký') && !status.includes('phũ phàng');
        });
        
        setSubmittedForms(donChuaXuLy);
      })
      .catch((err) => console.error('Lỗi tải dữ liệu:', err));
  }, []);

  const handleConditionChange = (formId, value) => {
    setConditions((prev) => ({ ...prev, [formId]: value }));
  };

  const handleSign = async (formId, successMessage) => {
    confetti({ particleCount: 150, spread: 75, origin: { y: 0.6 } });
    const dieuKienEmBeNhap = conditions[formId] || "";
    
    try {
      await fetch(`http://localhost:5000/api/forms/${formId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Đã ký duyệt! ✨❤️',
          babyCondition: dieuKienEmBeNhap.trim() !== "" ? dieuKienEmBeNhap : 'Chấp nhận hoàn toàn, không đòi hỏi gì thêm'
        })
      });
    } catch (err) { console.error('Lỗi đồng bộ:', err); }

    if (dieuKienEmBeNhap && dieuKienEmBeNhap.trim() !== "") {
      alert(`${successMessage}\n\nAnh Huy đã nhận lệnh:\n👉 "${dieuKienEmBeNhap}"\nvà hứa sẽ thực hiện đầy đủ không xót chữ nào! 🫡`);
    } else {
      alert(`${successMessage}`);
    }

    setSubmittedForms((prev) => prev.filter((form) => form.id !== formId));
  };

  const handleReject = async (formId) => {
    const currentClicks = rejectClicks[formId] || 0;
    const newClicks = currentClicks + 1;
    setRejectClicks((prev) => ({ ...prev, [formId]: newClicks }));

    try {
      await fetch(`http://localhost:5000/api/forms/${formId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newClicks >= 3 ? 'Bị từ chối phũ phàng 😭💔' : `Đang bấm nút Từ Chối (${newClicks} lần)`,
          rejectClicks: newClicks
        })
      });
    } catch (err) { console.error('Lỗi đồng bộ từ chối:', err); }

    if (newClicks === 1) {
      alert('Lần 1: Web đang chạy chính thức rồi á bé, em bấm thêm 2 lần nữa form sẽ tự động xóa luôn á 😭');
    } else if (newClicks === 2) {
      alert('Lần 2: Em bé bấm thêm 1 lần nữa là nó xóa luôn đơn thiệt á🥺💥');
    } else if (newClicks === 3) {
      alert('Lần 3: Dạ anh hiểu ròi ạ 🥺💔');
      setSubmittedForms((prev) => prev.filter((form) => form.id !== formId));
    } else {
      alert('Đơn bị từ chối rùi mà, tha cho anh đi đừng bấm nữa 🥺');
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <button 
        onClick={() => window.location.href = '/admin'} 
        className="fixed top-4 right-4 z-50 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white/50 hover:text-white px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg"
      >
        ⚙️ Admin
      </button>
      {/* KHU VỰC GIẢI CỨU GIAO DIỆN: Ép ảnh nền full-width độc lập */}
      <div className="fixed inset-0 bg-neon-layout z-0 w-screen h-screen"></div>

      {/* 1. ĐÃ SỬA CHỖ NÀY: Đổi max-w-xl thành max-w-5xl */}
      <div className="relative z-10 p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
        
        {/* Tiêu đề kính mờ */}
        <div className="p-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 text-center animate-float max-w-2xl mx-auto">
          <h1 className="text-3xl font-black text-pink-600 animate-sway">💌 Hộp Thư công chúa</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium">Em bé duyệt các đơn này giúp anh với ạ</p>
        </div>

        {submittedForms.length === 0 ? (
          <div className="bg-white/85 backdrop-blur-md p-8 rounded-[2rem] text-center text-pink-500 font-bold shadow-2xl animate-pulse max-w-2xl mx-auto">
            Chưa có thư nào gửi cho bé cả 🥺... Đợi anh Huy xíu nha!
          </div>
        ) : (
          /* 2. ĐÃ SỬA CHỖ NÀY: Dùng grid-cols-2 để chia 2 cột */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 auto-rows-fr">
            {submittedForms.map((form, index) => {
              
              // 1. ĐƠN GIỮ ĐỒ
              if (form.templateId === 'don-giu-do') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-pattern-grid bg-amber-50/95 backdrop-blur-sm rounded-[2rem] shadow-xl border-4 border-amber-200 p-5 sm:p-6 w-full mx-auto relative overflow-hidden group flex flex-col h-full">
                    <div className="text-center mb-4">
                      <span className="text-6xl animate-sway">📦</span>
                      <h2 className="text-2xl font-black mt-2 text-amber-600">PHIẾU KÝ GỬI ĐỒ VẬT</h2>
                    </div>
                    <div className="bg-white/90 p-4 rounded-xl mb-4 space-y-2 text-sm border border-amber-100 shadow-inner">
                      <p><span className="font-bold text-amber-700">🧸 Người gửi:</span> {form.data.nguoiGui}</p>
                      <p><span className="font-bold text-amber-700">🎁 Món đồ:</span> <span className="font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">{form.data.tenMonDo}</span></p>
                      <p className="italic text-gray-600 border-t pt-2 mt-2">"{form.data.loiNhan}"</p>
                    </div>

                    <textarea rows={2} placeholder="Anh phải làm gì cho em bé để em đồng ý?" className="w-full border-2 border-amber-200 rounded-xl p-3 focus:outline-none text-base bg-white mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-200 text-gray-600 font-bold py-3 rounded-xl">❌ Khum Giữ</button>
                      <button onClick={() => handleSign(form.id, 'Cảm mơn em bé đã đồng ý ạ 🥰')} className="flex-[2] bg-amber-500 text-white font-bold py-3 rounded-xl shadow-md animate-glow-pulse">✍️ Tui đồng ý</button>
                    </div>
                  </div>
                );
              }

              // 2. MỜI ĐI CHƠI
              if (form.templateId === 'moi-di-choi') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-sky-50/95 backdrop-blur-sm bg-pattern-grid rounded-[2rem] shadow-xl border-4 border-sky-200 p-5 sm:p-6 w-full mx-auto relative overflow-hidden flex flex-col h-full">
                    <div className="text-center mb-4">
                      <span className="text-6xl animate-sway">🛵</span>
                      <h2 className="text-2xl font-black mt-2 text-sky-600">ĐƠN MỜI EM BÉ ĐI CHƠI</h2>
                    </div>
                    <div className="bg-white/90 p-4 rounded-xl mb-4 space-y-2 text-sm border border-sky-100 shadow-inner">
                      <p><span className="font-bold text-sky-700">👨‍✈️ Tài xế:</span> {form.data.nguoiMoi}</p>
                      <p><span className="font-bold text-sky-700">📍 Điểm đến:</span> {form.data.diaDiem}</p>
                      <p><span className="font-bold text-sky-700">⏰ Giờ đón:</span> {form.data.thoiGian}</p>
                    </div>
                    <textarea rows={2} placeholder="Anh phải làm gì cho em bé để em đồng ý?" className="w-full border-2 border-sky-200 rounded-xl p-3 focus:outline-none text-base bg-white mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Ở nhà</button>
                      <button onClick={() => handleSign(form.id, 'Chốt kèo! Em bé cứ việc leo lên xe nhé! 🛵💨')} className="flex-[2] bg-sky-500 text-white font-bold py-3 rounded-xl shadow-md animate-glow-pulse">🎀 Chốt kèo lên xe</button>
                    </div>
                  </div>
                );
              }

              // 3. MỜI ĐI KHÁCH SẠN
              if (form.templateId === 'moi-di-ks') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-indigo-950/95 backdrop-blur-sm rounded-[2rem] shadow-2xl border-4 border-indigo-800 p-5 sm:p-6 w-full mx-auto relative overflow-hidden text-center flex flex-col h-full">
                    <span className="text-6xl animate-float inline-block mb-2">🌙</span>
                    <h2 className="text-2xl font-extrabold text-indigo-200 mb-4 font-serif italic">Thẻ Nghỉ Dưỡng Đặc Biệt</h2>
                    <div className="bg-indigo-900/60 p-4 rounded-xl mb-4 text-left space-y-2 text-sm text-indigo-100 border border-indigo-800 shadow-inner">
                      <p><span className="font-bold text-indigo-300">🤵 Người rủ:</span> {form.data.nguoiMoi}</p>
                      <p><span className="font-bold text-indigo-300">🏰 Địa chỉ:</span> <span className="text-white font-bold">{form.data.diaDiem}</span></p>
                      <p className="bg-indigo-950/40 p-2 rounded-lg text-indigo-200 italic mt-2">"{form.data.hoatDong}"</p>
                    </div>
                    <textarea rows={2} placeholder="Bé muốn anh phục vụ thêm gì..." className="w-full border border-indigo-700 bg-indigo-900/30 text-white placeholder-indigo-400 rounded-xl p-3 focus:outline-none text-base mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleReject(form.id)} className="flex-1 bg-indigo-900 text-indigo-300 font-bold py-3 rounded-xl">❌ Ngủ nhà</button>
                      <button onClick={() => handleSign(form.id, 'Cảm mơn em bé đã ban phước ạ! 🌙')} className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">👑 Tui sẽ ban phước cho anh</button>
                    </div>
                  </div>
                );
              }

              // 4. MỜI ĐI ĂN / NHẬU
              if (form.templateId === 'moi-di-an') {
                const isNhau = form.data.loaiHinh?.toLowerCase().includes('nhậu');
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className={`card-enter flex flex-col h-full ${isNhau ? 'bg-orange-50/95' : 'bg-red-50/95'} backdrop-blur-sm bg-pattern-waves rounded-[2rem] shadow-xl border-4 ${isNhau ? 'border-orange-200' : 'border-red-200'} p-5 sm:p-6 w-full mx-auto relative text-center overflow-hidden`}>
                    <span className="text-6xl animate-sway inline-block mb-2">{isNhau ? '🍻' : '🍣'}</span>
                    <h2 className={`text-2xl font-black uppercase tracking-wider ${isNhau ? 'text-orange-600' : 'text-red-600'}`}>{isNhau ? 'ĐƠN XIN ĐI NHẬU CÙNG EM BÉ' : 'ĐƠN XIN ĐI ĂN CÙNG EM BÉ'}</h2>
                    <div className="bg-white/90 p-4 rounded-xl my-4 text-left space-y-2 text-sm shadow-inner border border-gray-100">
                      <p><span className="font-bold text-gray-500">Món chính:</span> <span className="font-bold text-orange-600 text-lg"> {form.data.monAn}</span></p>
                      <p>📍 <b>Quán:</b> {form.data.diaChi}</p>
                      {form.data.clipReview && <p>🎬 <a href={form.data.clipReview} target="_blank" rel="noreferrer" className="text-blue-500 underline font-bold">Xem trước clip quán ăn</a></p>}
                      <p className="text-gray-500 border-t pt-2 mt-2 font-medium">✋ <b>Lời thề:</b> <i>"{form.data.loiHua}"</i></p>
                    </div>
                    <textarea rows={2} placeholder="Điều kiện để em bé chịu đi..." className="w-full border-2 rounded-xl p-3 focus:outline-none text-base bg-white mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Thôi khỏe</button>
                      <button onClick={() => handleSign(form.id, isNhau ? 'Chốt kèo đi nhậu! Say anh cõng, ói anh dọn! 🍻' : 'Chốt kèo! Anh sẽ qua rước em bé đúng giờ 🤤')} className={`flex-[2] text-white font-bold py-3 rounded-xl shadow-md animate-glow-pulse ${isNhau ? 'bg-orange-500' : 'bg-red-500'}`}>{isNhau ? '🍻 Tui đồng ý' : '🤤 Tui đồng ý'}</button>
                    </div>
                  </div>
                );
              }

              // 5. XIN HUN ÔM
              if (form.templateId === 'xin-hun-om') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-pink-50/95 backdrop-blur-sm bg-pattern-dots rounded-[2rem] shadow-xl border-4 border-pink-300 p-5 sm:p-6 w-full mx-auto relative text-center overflow-hidden flex flex-col h-full">
                    <span className="text-6xl animate-float inline-block mb-2">😘</span>
                    <h2 className="text-2xl font-black text-pink-500">PHIẾU XIN HUN & ÔM</h2>
                    <div className="bg-white/90 p-4 rounded-xl my-4 text-left space-y-2 text-sm shadow-inner border border-gray-50">
                      <p><b>🙋‍♂️ Kẻ xin xỏ:</b> {form.data.nguoiXin}</p>
                      <p><b>🎯 Chỉ tiêu:</b> <span className="bg-pink-100 text-pink-600 font-bold px-3 py-0.5 rounded-full">{form.data.soLuong}</span></p>
                      <p className="text-gray-600 italic border-l-4 border-pink-400 pl-2 mt-2">"{form.data.lyDo}"</p>
                    </div>
                    <textarea rows={2} placeholder="Ghi điều kiện trao đổi để em bé đồng ý..." className="w-full border-2 border-pink-200 rounded-xl p-3 text-base bg-white mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => handleReject(form.id)} className="flex-1 bg-white border-2 border-pink-200 text-pink-500 font-bold py-3 rounded-xl">Từ chối ❌</button>
                      <button onClick={() => handleSign(form.id, 'Toẹt vời! cảm mơn cục dàng đã ban phước ạ 🥰💖')} className="flex-[2] bg-pink-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">Tui ban phước cho anh 🥰</button>
                    </div>
                  </div>
                );
              }

              // 6. ĐƠN XIN LỖI
              if (form.templateId === 'don-xin-loi') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-red-50/95 backdrop-blur-sm bg-pattern-dots rounded-[2rem] shadow-xl border-4 border-red-200 p-5 sm:p-6 w-full mx-auto relative text-center flex flex-col h-full">
                    <span className="text-6xl animate-float inline-block mb-2">🙇</span>
                    <h2 className="text-2xl font-black text-red-600">ĐƠN XIN LỖI THÀNH KHẨN</h2>
                    <div className="bg-white/90 p-4 rounded-xl my-4 text-left space-y-2 text-sm shadow-inner border border-gray-50">
                      <p><b>Thằng bồ tội lỗi:</b> {form.data.hovaten || 'Huy bồ tội nghiệp'}</p>
                      <p>❌ <b>Tội trạng:</b> {form.data.loiXinLoi}</p>
                      <p>📝 <b>Lời hứa:</b> {form.data.loiHua}</p>
                    </div>
                    <textarea className="w-full p-3 border-2 border-red-200 rounded-xl mb-2 text-base bg-white mt-auto" placeholder="Bé muốn anh làm gì để nguôi giận hong..." onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Không tha</button>
                      <button onClick={() => handleSign(form.id, 'Cảm mơn em bé siêu rộng lượng đã tha lỗi cho anh! ✨❤️')} className="flex-[2] bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">Tôi tha lỗi cho anh ✨</button>
                    </div>
                  </div>
                );
              }

              // 7. PHIẾU CẢM ƠN
              if (form.templateId === 'phieu-cam-on') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-purple-50/95 backdrop-blur-sm bg-pattern-dots rounded-[2rem] shadow-xl border-4 border-purple-300 p-5 sm:p-6 w-full mx-auto relative text-center flex flex-col h-full">
                    <span className="text-6xl animate-sway inline-block mb-2">💖</span>
                    <h2 className="text-2xl font-black text-purple-600">PHIẾU CẢM ƠN NGỌT NGÀO</h2>
                    <div className="bg-white/90 p-4 rounded-xl my-4 text-left space-y-2 text-sm shadow-inner border border-gray-50">
                      <p>✨ <b>Lý do:</b> {form.data.lyDo}</p>
                      <p>💌 <b>Mong muốn</b> <i>"{form.data.loiYeuThuong}"</i></p>
                    </div>
                    <div className="flex gap-3 mt-auto pt-2">
                      <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Khỏi cảm ơn</button>
                      <button onClick={() => handleSign(form.id, 'Anh biết rồi nè, yêu bé nhiều lắm nha! 🥰❤️')} className="flex-[2] bg-purple-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">Tui biết ròi! ✨</button>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
    
  );
}