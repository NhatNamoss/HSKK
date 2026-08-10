export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Thống kê Tổng quan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Tổng số học viên</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">1,248</p>
          <p className="text-green-500 text-sm mt-2">↑ 12% so với tháng trước</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Khóa học đang hoạt động</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">15</p>
          <p className="text-gray-400 text-sm mt-2">Đang có 2 khóa chờ duyệt</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Tài liệu thư viện</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">342</p>
          <p className="text-brand-teal text-sm mt-2">+ 24 tài liệu mới trong tuần</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Doanh thu tháng này</h3>
          <p className="text-3xl font-bold text-brand-coral mt-2">24.5M</p>
          <p className="text-green-500 text-sm mt-2">↑ 8% so với tháng trước</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
          <ul className="space-y-4">
            <li className="flex justify-between items-center pb-4 border-b border-gray-50">
              <div>
                <p className="font-medium text-gray-800">Nguyễn Văn A <span className="text-gray-500 font-normal">đã mua khóa</span> HSK 3 Toàn diện</p>
                <p className="text-xs text-gray-400 mt-1">10 phút trước</p>
              </div>
              <span className="text-brand-coral font-bold">+499.000đ</span>
            </li>
            <li className="flex justify-between items-center pb-4 border-b border-gray-50">
              <div>
                <p className="font-medium text-gray-800">Trần Thị B <span className="text-gray-500 font-normal">vừa đăng ký tài khoản</span></p>
                <p className="text-xs text-gray-400 mt-1">1 giờ trước</p>
              </div>
            </li>
            <li className="flex justify-between items-center pb-4 border-b border-gray-50">
              <div>
                <p className="font-medium text-gray-800">Admin <span className="text-gray-500 font-normal">đã tải lên tài liệu</span> Bộ đề HSK 4 (2024)</p>
                <p className="text-xs text-gray-400 mt-1">Hôm qua</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Khóa học bán chạy nhất</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-lg flex items-center justify-center text-brand-teal font-bold">1</div>
              <div className="ml-4 flex-1">
                <h4 className="font-bold text-gray-800">HSK 3 Toàn diện</h4>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-brand-teal h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <span className="ml-4 font-bold text-gray-600">124 học viên</span>
            </div>
            
            <div className="flex items-center mt-4">
              <div className="w-12 h-12 bg-brand-earth/10 rounded-lg flex items-center justify-center text-brand-earth font-bold">2</div>
              <div className="ml-4 flex-1">
                <h4 className="font-bold text-gray-800">Giao tiếp phản xạ</h4>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-brand-earth h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <span className="ml-4 font-bold text-gray-600">86 học viên</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
