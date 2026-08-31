import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t-[3px] border-brand-teal mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-brand-coral mb-4">Học tiếng cùng cô Mỹ - Hán ngữ Natra</h3>
            <p className="text-gray-600 mb-4 max-w-md">
              Nền tảng học tiếng Trung trực tuyến cùng cô Mỹ. Cung cấp hệ thống tài liệu và khóa học chất lượng cao, giúp bạn chinh phục HSK và HSKK dễ dàng hơn.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Khám phá</h4>
            <ul className="space-y-3 text-gray-600">
              <li><Link href="/thu-vien" className="hover:text-brand-teal transition-colors">Thư viện tài liệu</Link></li>
              <li><Link href="/khoa-hoc" className="hover:text-brand-teal transition-colors">Hệ thống khóa học</Link></li>
              <li><Link href="/bai-viet" className="hover:text-brand-teal transition-colors">Kiến thức tiếng Trung</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Liên hệ</h4>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center">
                <span className="font-medium mr-2">Zalo/Hotline:</span> 0816 500 976
              </li>
              <li className="flex items-center">
                <span className="font-medium mr-2">Email:</span> thienmy9087@gmail.com
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Học tiếng cùng cô Mỹ - Hán ngữ Natra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
