/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */

// --- Paths ---
// QUAN TRỌNG: Đảm bảo các đường dẫn này đúng với cấu trúc thư mục của bạn
const AUDIOPATH = 'Content/audio/'; // Thư mục âm thanh
const BASEPATH  = 'Content/';      // Thư mục gốc cho ảnh, css...

// --- HTML/CSS ---
const DIV       = '<div />';
const CLS_FIGURE = 'figure';
const CLS_MATTER = 'matter';

// --- Enums for states and directions ---
const directions = {
    none  : 0,
    left  : 1,
    up    : 2,
    right : 3,
    down  : 4,
};
const mario_states = { // Trạng thái đặc biệt (thường / bắn lửa)
    normal : 0,
    fire  : 1,
};
const size_states = { // Kích thước (nhỏ / lớn)
    small : 1,
    big   : 2,
};
const ground_blocking = { // Hướng va chạm bị chặn
    none   : 0,
    left   : 1,
    top    : 2,
    right  : 4,
    bottom : 8,
    all    : 15,
};
const collision_type = { // Loại va chạm
    none       : 0,
    horizontal : 1,
    vertical   : 2,
};
const death_modes = { // Kiểu chết
    normal : 0, // Dẫm / Rơi
    shell  : 1, // Bị mai rùa đụng
};

// --- Image Paths ---
// QUAN TRỌNG: Đảm bảo tên file và đường dẫn đúng
const images = {
    enemies : BASEPATH + 'mario-enemies.png', // Ảnh kẻ thù
    sprites : BASEPATH + 'mario-sprites.png', // Ảnh Mario, hiệu ứng
    objects : BASEPATH + 'mario-objects.png', // Ảnh gạch, nấm, tiền...
    // peach   : BASEPATH + 'mario-peach.png', // Ảnh Peach (có thể không dùng)
};

// --- Gameplay Constants ---
// Điều chỉnh các giá trị này để thay đổi cảm giác game
const constants = {
    interval        : 20,    // ms per frame (~50 FPS)
    bounce          : 15,    // Lực nảy khi đạp kẻ thù
    cooldown        : 20,    // Số frame chờ giữa các lần bắn
    gravity         : 1.8,   // Gia tốc trọng trường (giảm nhẹ so với 2)
    start_lives     : 3,     // Số mạng ban đầu
    max_width       : 400,   // ?? Có thể không dùng
    max_height      : 15,    // Chiều cao màn chơi (ô gạch)
    jumping_v       : 25,    // Vận tốc nhảy ban đầu (giảm nhẹ)
    walking_v       : 4.5,   // Vận tốc đi bộ (chậm hơn chút)
    mushroom_v      : 2.5,   // Vận tốc nấm
    ballmonster_v   : 1.8,   // Vận tốc Goomba
    spiked_turtle_v : 1.2,   // Vận tốc Rùa Gai
    small_turtle_v  : 2.8,   // Vận tốc Rùa Xanh (không mai)
    big_turtle_v    : 1.8,   // Vận tốc Rùa Xanh (có mai)
    shell_v         : 8,     // Vận tốc mai rùa bị đá (chậm hơn)
    shell_wait      : 30,    // Số frame mai rùa đứng yên
    star_vx         : 3.5,   // Vận tốc ngang của Sao
    star_vy         : 14,    // Vận tốc nhảy của Sao
    bullet_v        : 10,    // Vận tốc đạn lửa
    max_coins       : 100,   // Số xu tối đa để được mạng
    pipeplant_count : 120,   // Số frame cây chờ trong ống
    pipeplant_v     : 0.8,   // Vận tốc cây trồi lên/xuống
    invincible      : 10000, // Thời gian bất tử Sao (ms)
    invulnerable    : 1200,  // Thời gian miễn nhiễm sau khi bị thương (ms)
    blinkfactor     : 6,     // Tốc độ nhấp nháy khi miễn nhiễm
};

// Loại vật phẩm trong hộp ?
const mushroom_mode = {
    mushroom : 0, // Nấm hoặc Hoa Lửa
    plant    : 1, // Cây leo (Vine)
};

// --- Utility Functions ---
// Chuyển đổi path thành CSS url()
const c2u = function(s) {
    // Basic check to avoid url(url(...))
    if (s && s.startsWith('url(')) {
        return s;
    }
    return 'url("' + s + '")'; // Thêm dấu ngoặc kép cho an toàn
};

// Hàm kiểm tra va chạm hình chữ nhật đơn giản (AABB Collision)
// Cần xem lại logic kích thước (state * 32) có thể không đúng với mọi figure
const q2q = function(figure, opponent) {
    // Kích thước của figure và opponent (cần lấy chính xác từ đối tượng)
    const fw = figure.width || 32; // Giả sử mặc định 32 nếu chưa set
    const fh = (figure.state === size_states.big ? 64 : 32) || 32; // Chiều cao dựa vào state
    const ow = opponent.width || 32;
    const oh = (opponent.state === size_states.big ? 64 : 32) || 32;
    
    // Tọa độ bounding box (x, y là góc dưới trái)
    const fL = figure.x;
    const fR = figure.x + fw;
    const fB = figure.y;
    const fT = figure.y + fh;
    
    const oL = opponent.x;
    const oR = opponent.x + ow;
    const oB = opponent.y;
    const oT = opponent.y + oh;

    // Kiểm tra không va chạm (nếu 1 box nằm hoàn toàn bên ngoài box kia)
    if (fR <= oL || fL >= oR || fT <= oB || fB >= oT) {
        return false; // Không va chạm
    }
    
    return true; // Có va chạm
};

// Polyfill for Math.sign (nếu trình duyệt cũ không hỗ trợ)
if (!Math.sign) {
    Math.sign = function(x) {
        x = +x; // Convert to number
        if (x === 0 || isNaN(x)) {
            return x;
        }
        return x > 0 ? 1 : -1;
    };
}
