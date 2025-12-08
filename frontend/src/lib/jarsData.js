// src/lib/jarsData.js

// 1. ĐỊNH NGHĨA CÁC HŨ (JARS)
// Bạn có thể thay đổi icon bằng đường dẫn ảnh Mochi của bạn
export const JARS_INFO = {
    necessity: { 
        id: 'necessity', 
        label: 'Thiết yếu', 
        desc: 'Ăn uống, đi lại, hóa đơn',
        color: '#ef4444', // Đỏ
        bgColor: 'bg-red-500',
        mochiColor: 'hue-rotate-[0deg]' // Chỉnh màu ảnh Mochi bằng CSS filter
    },
    education: { 
        id: 'education', 
        label: 'Giáo dục', 
        desc: 'Sách, khóa học',
        color: '#3b82f6', // Xanh dương
        bgColor: 'bg-blue-500',
        mochiColor: 'hue-rotate-[180deg]'
    },
    play: { 
        id: 'play', 
        label: 'Hưởng thụ', 
        desc: 'Du lịch, game, cà phê',
        color: '#eab308', // Vàng
        bgColor: 'bg-yellow-500',
        mochiColor: 'hue-rotate-[45deg]'
    },
    investment: { 
        id: 'investment', 
        label: 'Đầu tư', 
        desc: 'Chứng khoán, vốn kinh doanh',
        color: '#10b981', // Xanh lá
        bgColor: 'bg-emerald-500',
        mochiColor: 'hue-rotate-[120deg]'
    },
    saving: { 
        id: 'saving', 
        label: 'Tiết kiệm', 
        desc: 'Mua nhà, xe, khẩn cấp',
        color: '#8b5cf6', // Tím
        bgColor: 'bg-violet-500',
        mochiColor: 'hue-rotate-[260deg]'
    },
    charity: { 
        id: 'charity', 
        label: 'Cho đi', 
        desc: 'Từ thiện, quà tặng',
        color: '#ec4899', // Hồng
        bgColor: 'bg-pink-500',
        mochiColor: 'hue-rotate-[300deg]'
    },
};

// 2. CÁC MÔ HÌNH PHÂN BỔ (MODELS)
export const ALLOCATION_MODELS = [
    {
        id: '6jars',
        name: 'Quy tắc 6 Chiếc lọ (JARS)',
        desc: 'Cân bằng hoàn hảo giữa sống và tích lũy',
        rules: {
            necessity: 55,
            play: 10,
            education: 10,
            investment: 10,
            saving: 10,
            charity: 5
        }
    },
    {
        id: '503020',
        name: 'Quy tắc 50/30/20',
        desc: 'Đơn giản, dễ áp dụng',
        rules: {
            necessity: 50,
            play: 30, // Gom "Mong muốn" vào Hưởng thụ
            saving: 20 // Gom "Tích lũy" vào Tiết kiệm
        }
    },
    {
        id: 'saver',
        name: 'Tiết kiệm trước',
        desc: 'Dành cho người muốn tích lũy nhanh',
        rules: {
            saving: 20,
            necessity: 80 // Còn lại xài tẹt ga
        }
    }
];