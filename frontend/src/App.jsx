import ClientPage from './components/ClientPage';
import AdminPage from './components/AdminPage';

function App() {
  // Lấy đường dẫn hiện tại trên trình duyệt
  const path = window.location.pathname;

  // Nếu đường dẫn có chữ /admin -> Hiển thị trang của Sếp
  if (path === '/admin') {
    return <AdminPage />;
  }

  // Mặc định cho mọi đường dẫn khác -> Hiển thị trang của Công chúa
  return <ClientPage />;
}

export default App;