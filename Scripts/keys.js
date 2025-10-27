/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */
var keys = {
    bind : function() {
        // Lắng nghe sự kiện khi phím được nhấn xuống
        $(document).on('keydown', function(event) { 
            return keys.handler(event, true); // true = đang nhấn
        });
        // Lắng nghe sự kiện khi phím được nhả ra
        $(document).on('keyup', function(event) {   
            return keys.handler(event, false); // false = đã nhả
        });
    },
    // Đặt lại tất cả trạng thái phím về 'false' (không được nhấn)
    reset : function() {
        keys.left = false;
        keys.right = false;
        keys.accelerate = false;
        keys.up = false;
        keys.down = false;
    },
    // Gỡ bỏ tất cả lắng nghe sự kiện phím
    unbind : function() {
        $(document).off('keydown');
        $(document).off('keyup');
    },
    // Hàm xử lý chính khi có sự kiện phím
    handler : function(event, status) {
        // Kiểm tra mã phím (keyCode)
        switch(event.keyCode) {
            case 57392://CTRL trên MAC (dùng để chạy nhanh/bắn)
            case 17://CTRL
            case 65://A (dùng để chạy nhanh/bắn)
                keys.accelerate = status;
                break;
            case 40://Mũi tên xuống (ngồi)
                keys.down = status;
                break;
            case 39://Mũi tên phải (đi phải)
                keys.right = status;
                break;
            case 37://Mũi tên trái (đi trái)
                keys.left = status;         
                break;
            case 38://Mũi tên lên (nhảy)
                keys.up = status;
                break;
            default:
                return true; // Nếu là phím khác (vd: F5, F12) thì cho phép hành động mặc định
        }
            
        event.preventDefault(); // Ngăn hành động mặc định (vd: cuộn trang bằng mũi tên)
        return false;
    },
    // Các biến trạng thái, sẽ được file main.js đọc liên tục
    accelerate : false, // Phím chạy nhanh/bắn
    left : false,       // Phím trái
    up : false,         // Phím lên/nhảy
    right : false,      // Phím phải
    down : false,       // Phím xuống/ngồi
};
