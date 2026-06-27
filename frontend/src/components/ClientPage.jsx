import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './ClientPage.css';

export default function ClientPage() {
  const [submittedForms, setSubmittedForms] = useState([]);
  const [conditions, setConditions] = useState({});
  const [rejectClicks, setRejectClicks] = useState({});

  useEffect(() => {
    fetch('https://form-kim-ngan.onrender.com/api/forms') 
      .then((res) => res.json())
      .then((data) => {
        // ĐÃ SỬA: Không lọc nữa, lấy toàn bộ dữ liệu form hiển thị lên màn hình
        setSubmittedForms(data);
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
      await fetch(`https://form-kim-ngan.onrender.com/api/forms/${formId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Đã ký duyệt! ✨❤️',
          babyCondition: dieuKienEmBeNhap.trim() !== "" ? dieuKienEmBeNhap : 'Chấp nhận hoàn toàn, không đòi hỏi gì thêm'
        })
      });

      // ĐÃ SỬA: Cập nhật lại status của đơn ngay trên màn hình thay vì xóa nó đi
      setSubmittedForms(prev => prev.map(form => 
        form.id === formId ? { ...form, status: 'Đã ký duyệt! ✨❤️' } : form
      ));

    } catch (err) { console.error('Lỗi đồng bộ:', err); }

    if (dieuKienEmBeNhap && dieuKienEmBeNhap.trim() !== "") {
      alert(`${successMessage}\n\nAnh Huy đã nhận lệnh:\n👉 "${dieuKienEmBeNhap}"\nvà hứa sẽ thực hiện đầy đủ không xót chữ nào! 🫡`);
    } else {
      alert(`${successMessage}`);
    }
  };

  const handleReject = async (formId) => {
    const form = submittedForms.find(f => f.id === formId);
    const currentClicks = rejectClicks[formId] || form.rejectClicks || 0;
    const newClicks = currentClicks + 1;
    setRejectClicks((prev) => ({ ...prev, [formId]: newClicks }));

    const newStatus = newClicks >= 3 ? 'Bị từ chối phũ phàng 😭💔' : `Đang bấm nút Từ Chối (${newClicks} lần)`;

    try {
      await fetch(`https://form-kim-ngan.onrender.com/api/forms/${formId}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          rejectClicks: newClicks
        })
      });

      // ĐÃ SỬA: Cập nhật lại status và số lần click của đơn ngay trên màn hình thay vì xóa
      setSubmittedForms(prev => prev.map(f => 
        f.id === formId ? { ...f, status: newStatus, rejectClicks: newClicks } : f
      ));

    } catch (err) { console.error('Lỗi đồng bộ từ chối:', err); }

    if (newClicks === 1) {
      alert('Lần 1: Web đang chạy chính thức rồi á bé, em bấm thêm 2 lần nữa form sẽ bị khóa luôn á 😭');
    } else if (newClicks === 2) {
      alert('Lần 2: Em bé bấm thêm 1 lần nữa là nó khóa đơn thiệt á🥺💥');
    } else if (newClicks === 3) {
      alert('Lần 3: Dạ anh hiểu ròi ạ 🥺💔 Đơn đã được lưu vào lãnh cung!');
    } else {
      alert('Đơn bị khóa rùi mà, tha cho anh đi đừng bấm nữa 🥺');
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
      
      <div className="fixed inset-0 bg-neon-layout z-0 w-screen h-screen"></div>

      <div className="relative z-10 p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
        
        <div className="p-6 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 text-center animate-float max-w-2xl mx-auto">
          <h1 className="text-3xl font-black text-pink-600 animate-sway">💌 Hộp Thư công chúa</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium">Nhật ký tình yêu của hai đứa mình</p>
        </div>

        {submittedForms.length === 0 ? (
          <div className="bg-white/85 backdrop-blur-md p-8 rounded-[2rem] text-center text-pink-500 font-bold shadow-2xl animate-pulse max-w-2xl mx-auto">
            Chưa có thư nào gửi cho bé cả 🥺... Đợi anh Huy xíu nha!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 auto-rows-fr">
            {submittedForms.map((form, index) => {
              
              // ĐÃ SỬA: Biến kiểm tra xem đơn đã giải quyết xong chưa
              const isResolved = 
                form.status?.includes('Đã ký') || 
                form.status?.includes('phũ phàng') || 
                (rejectClicks[form.id] || form.rejectClicks || 0) >= 3;

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

                    {!isResolved ? (
                      <>
                        <textarea rows={2} placeholder="Anh phải làm gì cho em bé để em đồng ý?" className="w-full border-2 border-amber-200 rounded-xl p-3 focus:outline-none text-base bg-white mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-3">
                          <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-200 text-gray-600 font-bold py-3 rounded-xl">❌ Khum Giữ</button>
                          <button onClick={() => handleSign(form.id, 'Cảm mơn em bé đã đồng ý ạ 🥰')} className="flex-[2] bg-amber-500 text-white font-bold py-3 rounded-xl shadow-md animate-glow-pulse">✍️ Tui đồng ý</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
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
                      {/* Đã đổi chữ Giờ đón thành Thời điểm */}
                      <p><span className="font-bold text-sky-700">⏰ Thời điểm:</span> {form.data.thoiGian}</p>
                      
                      {/* Tự động hiển thị Ghi chú nếu sếp có nhập */}
                      {form.data.ghiChu && (
                        <p className="border-t border-sky-100 pt-2 mt-2 text-gray-600 italic">
                          <span className="font-bold text-sky-700 not-italic">📝 Ghi chú:</span> {form.data.ghiChu}
                        </p>
                      )}
                    </div>

                    {!isResolved ? (
                      <>
                        <textarea rows={2} placeholder="Em bé muốn đi tới đây hong ạ, nếu hong thì em muốn đi đâu nè" className="w-full border-2 border-sky-200 rounded-xl p-3 focus:outline-none text-base bg-white mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-3">
                          <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Ở nhà</button>
                          <button onClick={() => handleSign(form.id, 'Chốt kèo! Em bé cứ việc leo lên xe nhé! 🛵💨')} className="flex-[2] bg-sky-500 text-white font-bold py-3 rounded-xl shadow-md animate-glow-pulse">🎀 Chốt kèo lên xe</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
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

                    {!isResolved ? (
                      <>
                        <textarea rows={2} placeholder="Bé muốn anh phục vụ thêm gì..." className="w-full border border-indigo-700 bg-indigo-900/30 text-white placeholder-indigo-400 rounded-xl p-3 focus:outline-none text-base mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-3">
                          <button onClick={() => handleReject(form.id)} className="flex-1 bg-indigo-900 text-indigo-300 font-bold py-3 rounded-xl">❌ Ngủ nhà</button>
                          <button onClick={() => handleSign(form.id, 'Cảm mơn em bé đã ban phước ạ! 🌙')} className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">👑 Tui sẽ ban phước cho anh</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-indigo-900/50 text-indigo-300 border border-indigo-800">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-indigo-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
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

                    {!isResolved ? (
                      <>
                        <textarea rows={2} placeholder="Em bé thấy món nào sao nè, nếu hong thì em cho anh 1 vài option nha" className="w-full border-2 rounded-xl p-3 focus:outline-none text-base bg-white mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-3">
                          <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Thôi khỏe</button>
                          <button onClick={() => handleSign(form.id, isNhau ? 'Chốt kèo đi nhậu! Say anh cõng, ói anh dọn! 🍻' : 'Chốt kèo! Anh sẽ qua rước em bé đúng giờ 🤤')} className={`flex-[2] text-white font-bold py-3 rounded-xl shadow-md animate-glow-pulse ${isNhau ? 'bg-orange-500' : 'bg-red-500'}`}>{isNhau ? '🍻 Tui đồng ý' : '🤤 Tui đồng ý'}</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
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

                    {!isResolved ? (
                      <>
                        <textarea rows={2} placeholder="Ghi điều kiện trao đổi để em bé đồng ý..." className="w-full border-2 border-pink-200 rounded-xl p-3 text-base bg-white mt-auto" value={conditions[form.id] || ''} onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-3">
                          <button onClick={() => handleReject(form.id)} className="flex-1 bg-white border-2 border-pink-200 text-pink-500 font-bold py-3 rounded-xl">Từ chối ❌</button>
                          <button onClick={() => handleSign(form.id, 'Toẹt vời! cảm mơn cục dàng đã ban phước ạ 🥰💖')} className="flex-[2] bg-pink-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">Tui ban phước cho anh 🥰</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
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
                      <p><b>Người gửi:</b> {form.data.hovaten || 'Huy bồ tội nghiệp'}</p>
                      <p>❌ <b>Tội trạng:</b> {form.data.loiXinLoi}</p>
                      <p>📝 <b>Lời hứa:</b> {form.data.loiHua}</p>
                    </div>

                    {!isResolved ? (
                      <>
                        <textarea className="w-full p-3 border-2 border-red-200 rounded-xl mb-2 text-base bg-white mt-auto" placeholder="Bé muốn anh làm gì để nguôi giận hong..." onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-2">
                          <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Không tha</button>
                          <button onClick={() => handleSign(form.id, 'Cảm mơn em bé siêu rộng lượng đã tha lỗi cho anh! ✨❤️')} className="flex-[2] bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">Tôi tha lỗi cho anh ✨</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // 7. PHIẾU CẢM ƠN
              if (form.templateId === 'phieu-cam-on') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-purple-50/95 backdrop-blur-sm bg-pattern-dots rounded-[2rem] shadow-xl border-4 border-purple-300 p-5 sm:p-6 w-full mx-auto relative text-center flex flex-col h-full">
                    <span className="text-6xl animate-sway inline-block mb-2">💖</span>
                    <h2 className="text-2xl font-black text-purple-600">ĐƠN CẢM ƠN EM BÉ</h2>
                    <div className="bg-white/90 p-4 rounded-xl my-4 text-left space-y-2 text-sm shadow-inner border border-gray-50">
                      <p>✨ <b>Lý do:</b> {form.data.lyDo}</p>
                      <p>💌 <b>Mong muốn</b> <i>"{form.data.loiYeuThuong}"</i></p>
                    </div>

                    {!isResolved ? (
                      <>
                        <textarea className="w-full p-3 border-2 border-blue-200 rounded-xl mb-2 text-base bg-white mt-auto" placeholder="Bé có gì muốn nói với anh hong, hong có thì để trống cũng được ạ" onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-auto pt-2">
                          <button onClick={() => handleSign(form.id, 'Anh biết rồi nè, yêu bé nhiều lắm nha! 🥰❤️')} className="flex-[2] bg-purple-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">Tui biết ròi! ✨</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // 8. ĐƠN XIN CẤP PHÉP HOẠT ĐỘNG RIÊNG
              if (form.templateId === 'xin-phep-hoat-dong') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-blue-50/95 backdrop-blur-sm bg-pattern-dots rounded-[2rem] shadow-xl border-4 border-blue-300 p-5 sm:p-6 w-full mx-auto relative text-center flex flex-col h-full">
                    <span className="text-6xl animate-bounce inline-block mb-2">🎮</span>
                    <h2 className="text-2xl font-black text-blue-600">ĐƠN XIN HOẠT ĐỘNG RIÊNG</h2>
                    <div className="bg-white/90 p-4 rounded-xl my-4 text-left space-y-2 text-sm shadow-inner border border-gray-50">
                      <p>🎯 <b>Mục tiêu:</b> {form.data.hoatDong}</p>
                      <p>⏰ <b>Khung giờ:</b> {form.data.thoiGian}</p>
                      <p>✋ <b>Lời thề:</b> <i>"{form.data.loiHua}"</i></p>
                    </div>

                    {!isResolved ? (
                      <>
                        <textarea className="w-full p-3 border-2 border-blue-200 rounded-xl mb-2 text-base bg-white mt-auto" placeholder="Em bé có muốn ra điều kiện gì hong ạ" onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-2">
                          <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Ở nhà!</button>
                          <button onClick={() => handleSign(form.id, 'Cảm ơn em bé! Anh hứa sẽ đúng giờ! 🫡❤️')} className="flex-[2] bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">Duyệt cho đi ✨</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // 9. ĐƠN XIN GIA HẠN THỜI GIAN ĐI CHƠI
              if (form.templateId === 'xin-them-gio-hen-ho') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-orange-50/95 backdrop-blur-sm bg-pattern-dots rounded-[2rem] shadow-xl border-4 border-orange-300 p-5 sm:p-6 w-full mx-auto relative text-center flex flex-col h-full">
                    <span className="text-6xl animate-sway inline-block mb-2">⏳</span>
                    <h2 className="text-2xl font-black text-orange-600">ĐƠN XIN GIA HẠN ĐI CHƠI</h2>
                    <div className="bg-white/90 p-4 rounded-xl my-4 text-left space-y-2 text-sm shadow-inner border border-gray-50">
                      <p>🥺 <b>Lý do níu kéo:</b> {form.data.lyDo}</p>
                      <p>⏱️ <b>Xin thêm:</b> {form.data.thoiGianXinThem}</p>
                    </div>

                    {!isResolved ? (
                      <>
                        <textarea className="w-full p-3 border-2 border-orange-200 rounded-xl mb-2 text-base bg-white mt-auto" placeholder="Em bé muốn anh làm gì để em đồng ý ạ, hong thì để trống cũng được ạ" onChange={(e) => handleConditionChange(form.id, e.target.value)} />
                        <div className="flex gap-3 mt-2">
                          <button onClick={() => handleReject(form.id)} className="flex-1 bg-gray-100 text-gray-500 font-bold py-3 rounded-xl">❌ Đi về!</button>
                          <button onClick={() => handleSign(form.id, 'Yêu em bé nhấttt! Hai đứa mình đi quẩy tiếp thuiii 🛵💨')} className="flex-[2] bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse">Tui duyệt✨</button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              // 10. ĐƠN ĐỀ NGHỊ CỨU TRỢ TÌNH CẢM
              if (form.templateId === 'yeu-cau-cuu-tro') {
                return (
                  <div key={form.id} style={{animationDelay: `${index * 0.1}s`}} className="card-enter bg-rose-50/95 backdrop-blur-sm bg-pattern-dots rounded-[2rem] shadow-xl border-4 border-rose-400 p-5 sm:p-6 w-full mx-auto relative text-center flex flex-col h-full">
                    <span className="text-6xl animate-pulse inline-block mb-2">🚨</span>
                    <h2 className="text-2xl font-black text-rose-600">CẤP CỨU TÌNH CẢM</h2>
                    <div className="bg-white/90 p-4 rounded-xl my-4 text-left space-y-2 text-sm shadow-inner border border-gray-50">
                      <p>🤒 <b>Tình trạng:</b> {form.data.tinhTrang}</p>
                      <p>💉 <b>Biện pháp cần:</b> {form.data.bienPhap}</p>
                    </div>
                    
                    {!isResolved ? (
                      <div className="flex gap-3 mt-auto pt-4">
                          <button 
                            onClick={() => {
                              handleSign(form.id, 'Đã nhận được cứu trợ từ công chúa! Năng lượng anh hồi phục 1000% rồi 🚀❤️');
                              window.open('https://m.me/gia.huy.730863', '_blank');
                            }} 
                            className="flex-[2] bg-rose-500 text-white font-bold py-3 rounded-xl shadow-lg animate-glow-pulse"
                          >
                            🚑 Cứu giá ngay!
                          </button>
                      </div>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="p-3 rounded-xl text-center font-bold text-sm bg-gray-100 text-gray-500 border border-gray-200">
                          🔒 Đơn này đã lưu hồ sơ! 
                          <span className="block text-xs font-normal mt-0.5 text-gray-400">
                            ({form.status?.includes('Đã ký') ? 'Đã được duyệt ✨' : 'Đã bị từ chối 💔'})
                          </span>
                        </div>
                      </div>
                    )}
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