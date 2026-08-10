"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enrollFreeCourse, createOrder } from "@/app/actions/order";
import { useSession } from "next-auth/react";

export default function CourseActionButtons({ 
  courseId, 
  price, 
  slug,
  hasEnrolled
}: { 
  courseId: string;
  price: number;
  slug: string;
  hasEnrolled: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleEnrollFree = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/khoa-hoc/${slug}`);
      return;
    }
    
    setLoading(true);
    const res = await enrollFreeCourse(courseId);
    setLoading(false);
    
    if (res?.error) {
      alert(res.error);
    } else {
      router.push(`/hoc/${slug}`);
    }
  };

  const handleBuyCourse = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/khoa-hoc/${slug}`);
      return;
    }
    
    setLoading(true);
    const res = await createOrder(courseId);
    setLoading(false);
    
    if (res?.error) {
      alert(res.error);
    } else if (res?.orderId) {
      router.push(`/checkout/${res.orderId}`);
    }
  };

  if (hasEnrolled) {
    return (
      <button 
        onClick={() => router.push(`/hoc/${slug}`)}
        className="block w-full bg-brand-teal text-white text-center font-bold py-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all hover:-translate-y-1"
      >
        TIẾP TỤC HỌC
      </button>
    );
  }

  return (
    <button 
      onClick={price === 0 ? handleEnrollFree : handleBuyCourse}
      disabled={loading}
      className={`block w-full bg-brand-coral text-white text-center font-bold py-4 rounded-xl hover:bg-opacity-90 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {loading ? "ĐANG XỬ LÝ..." : (price === 0 ? "VÀO HỌC NGAY MIỄN PHÍ" : "MUA KHÓA HỌC")}
    </button>
  );
}
