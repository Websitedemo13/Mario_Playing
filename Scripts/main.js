/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */

/*
 * -------------------------------------------
 * BASE CLASS
 * -------------------------------------------
 */
var Base = Class.extend({
    init: function(x, y) {
        this.setPosition(x || 0, y || 0);
        this.clearFrames();
        this.frameCount = 0;
    },
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    },
    getPosition: function() {
        return { x : this.x, y : this.y };
    },
    setImage: function(img, x, y) {
        this.image = {
            path : img,
            x : x,
            y : y
        };
    },
    setSize: function(width, height) {
        this.width = width;
        this.height = height;
    },
    getSize: function() {
        return { width: this.width, height: this.height };
    },
    setupFrames: function(fps, frames, rewind, id) {
        if(id) {
            if(this.frameID === id)
                return true;
            
            this.frameID = id;
        }
        
        this.currentFrame = 0;
        this.frameTick = frames ? (1000 / fps / constants.interval) : 0;
        this.frames = frames;
        this.rewindFrames = rewind;
        return false;
    },
    clearFrames: function() {
        this.frameID = undefined;
        this.frames = 0;
        this.currentFrame = 0;
        this.frameTick = 0;
    },
    playFrame: function() {
        if(this.frameTick && this.view) {
            this.frameCount++;
            
            if(this.frameCount >= this.frameTick) {       
                this.frameCount = 0;
                
                if(this.currentFrame === this.frames)
                    this.currentFrame = 0;
                    
                var $el = this.view;
                // Simplified background position update
                 var bgX = -(this.image.x + this.width * (this.rewindFrames ? (this.frames - 1 - this.currentFrame) : this.currentFrame));
                 var bgY = -this.image.y;
                $el.css('background-position', bgX + 'px ' + bgY + 'px');
                this.currentFrame++;
            }
        }
    },
});

/*
 * -------------------------------------------
 * GAUGE CLASS
 * -------------------------------------------
 */
var Gauge = Base.extend({
    init: function(id, startImgX, startImgY, fps, frames, rewind) {
        this._super(0, 0);
        this.view = $('#' + id);
        if(!this.view.length) { console.error("Gauge element not found:", id); return; } // Error check
        this.setSize(this.view.width(), this.view.height());
         // Handle case where background image might not be set initially
        var bgImage = this.view.css('background-image');
        if (bgImage && bgImage !== 'none') {
             // Extract URL from 'url("...")' format
             var imgUrlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
             if (imgUrlMatch && imgUrlMatch[1]) {
                  this.setImage(imgUrlMatch[1], startImgX, startImgY);
             } else {
                 console.warn("Could not parse background image URL for gauge:", id);
                 // Fallback or default image?
             }
        } else {
            console.warn("No background image set for gauge:", id);
            // Assign a default or handle error
        }
        this.setupFrames(fps, frames, rewind);
    },
});


/*
 * -------------------------------------------
 * LEVEL CLASS
 * -------------------------------------------
 */
var Level = Base.extend({
    init: function(id) {
        this.world = $('#' + id);
        this.nextCycles = 0;
        this._super(0, 0);
        this.active = false;
        this.figures = [];
        this.obstacles = [];
        this.decorations = [];
        this.items = [];
        this.coinGauge = new Gauge('coin', 0, 0, 10, 4, true);
        this.liveGauge = new Gauge('live', 0, 430, 6, 6, true);
    },
    reload: function() {
        var settings = {};
        this.pause();
        
        for(var i = this.figures.length; i--; ) {
            if(this.figures[i] instanceof Mario) {
                settings.lifes = this.figures[i].lifes - 1;
                settings.coins = this.figures[i].coins;
                break;
            }
        }
        
        this.reset();
        
        if(settings.lifes < 0) {
            // --- XỬ LÝ GAME OVER ---
            if(typeof window.handleGameOver === 'function') {
                 window.handleGameOver(); // Gọi hàm game over đã tạo trong index.html
            } else {
                 alert("Game Over! Hết mạng."); // Fallback
                 window.location.reload();
            }
            return; // Dừng reload
            // this.load(definedLevels[0]); // Bỏ dòng load lại màn 1
        } else {        
            this.load(this.raw); // Tải lại màn hiện tại
            
            for(var i = this.figures.length; i--; ) {
                if(this.figures[i] instanceof Mario) {
                    this.figures[i].setLifes(settings.lifes || 0);
                    this.figures[i].setCoins(settings.coins || 0);
                    break;
                }
            }
        }
        
        this.start();
    },
    load: function(level) {
        if (this.active) {
            if (this.loop)
                this.pause();
            this.reset();
        }

        this.setPosition(0, 0);
        this.setSize(level.width * 32, level.height * 32);
        this.setImage(level.background);
        this.raw = level;
        this.id = level.id;
        this.active = true;
        var data = level.data;

        // --- Vòng lặp 1: Khởi tạo lưới obstacles ---
        for (var i = 0; i < level.width; i++) {
            var t = [];
            for (var j = 0; j < level.height; j++) {
                t.push('');
            }
            this.obstacles.push(t);
        }

        // --- Vòng lặp 2: Tạo đối tượng từ data ---
        let questionCounter = 0; // Đặt biến đếm ở đây

        for (var i = 0, width = data.length; i < width; i++) {
            var col = data[i];
            for (var j = 0, height = col.length; j < height; j++) {
                if (reflection[col[j]]) {
                    // --- Tạo đối tượng (instance) ---
                    var instance = new (reflection[col[j]])(i * 32, (height - j - 1) * 32, this);

                    // === GÁN INDEX CÂU HỎI CHO QUESTIONBOX ===
                    if (instance instanceof QuestionBox) {
                        // Tính index câu hỏi: (ID màn * số câu/màn) + số thứ tự hộp
                        let qIndex = (this.id * 3) + questionCounter; 

                        if (qIndex >= 0 && qIndex < gameQuestions.length) {
                            instance.assignQuestion(qIndex); 
                            questionCounter++; // Chỉ tăng nếu gán thành công
                        } else {
                            console.warn(`Level ${this.id}, Box ${questionCounter}: Question index ${qIndex} is out of bounds! Using question 0.`);
                            instance.assignQuestion(0); 
                        }
                    }
                    // === KẾT THÚC GÁN INDEX ===
                } 
            } 
        } 
    }, 
    next: function() {
        this.nextCycles = Math.floor(7000 / constants.interval);
    },
    nextLoad: function() {
        if (this.nextCycles) 
            return;

        // --- XỬ LÝ KẾT THÚC GAME ---
        const nextLevelId = this.id + 1;
        // Chỉ có 3 màn (id 0, 1, 2). Nếu id hiện tại là 2, thì nextLevelId sẽ là 3.
        if (nextLevelId >= 3) { 
            this.pause();
            keys.reset();
            keys.unbind();
            if(this.sounds) this.sounds.stopMusic(); // Tắt nhạc nếu có thư viện âm thanh
            
            // Tạm dùng alert, bạn có thể thay bằng màn hình chiến thắng đẹp hơn
            alert("Chúc mừng! Bạn đã hoàn thành game và vượt qua các cạm bẫy lừa đảo!");
            window.location.reload(); // Tải lại trang để chơi lại
            return; // Dừng hàm
        }
        // --- KẾT THÚC XỬ LÝ ---

        // Code cũ để lưu trạng thái Mario và tải màn tiếp theo
        var settings = {};
        this.pause();
        for(var i = this.figures.length; i--; ) {
            if(this.figures[i] instanceof Mario) {
                settings.lifes = this.figures[i].lifes;
                settings.coins = this.figures[i].coins;
                settings.state = this.figures[i].state;
                settings.marioState = this.figures[i].marioState;
                break;
            }
        }
        this.reset();
        this.load(definedLevels[nextLevelId]); // Tải màn tiếp theo
        for(var i = this.figures.length; i--; ) {
            if(this.figures[i] instanceof Mario) {
                this.figures[i].setLifes(settings.lifes || 0);
                this.figures[i].setCoins(settings.coins || 0);
                this.figures[i].setState(settings.state || size_states.small);
                this.figures[i].setMarioState(settings.marioState || mario_states.normal);
                break;
            }
        }
        this.start();
    },
    getGridWidth: function() {
        return this.raw.width;
    },
    getGridHeight: function() {
        return this.raw.height;
    },
    setSounds: function(manager) {
        this.sounds = manager;
    },
    playSound: function(label) {
        if(this.sounds)
            this.sounds.play(label);
    },
    playMusic: function(label) {
        if(this.sounds)
            this.sounds.sideMusic(label);
    },
    reset: function() {
        this.active = false;
        this.world.empty();
        this.figures = [];
        this.obstacles = [];
        this.items = [];
        this.decorations = [];
    },
    tick: function() {
        if(this.nextCycles) {
            this.nextCycles--;
            this.nextLoad();            
            return;
        }
        
        var i = 0, j = 0, figure, opponent;
        
        for(i = this.figures.length; i--; ) {
            figure = this.figures[i];
            
            if(figure.dead) {
                if(!figure.death()) {
                    if(figure instanceof Mario)
                        return this.reload(); // Gọi hàm reload đã sửa
                        
                    figure.view.remove();
                    this.figures.splice(i, 1);
                } else
                    figure.playFrame();
            } else {
                // Kiểm tra va chạm giữa các Figure
                if(i > 0) { // Chỉ kiểm tra nếu có ít nhất 2 figure
                    for(j = i - 1; j >= 0; j--) { // Sửa: j=i-1 và j>=0
                        if(figure.dead) break; // Thoát nếu figure đã chết trong vòng lặp con
                        opponent = this.figures[j];
                        
                        if(!opponent.dead && q2q(figure, opponent)) { // q2q là hàm kiểm tra va chạm
                            figure.hit(opponent);
                            // Kiểm tra lại opponent.dead trước khi gọi hit lần nữa
                            if (!opponent.dead) { 
                                opponent.hit(figure);
                            }
                        }
                    }
                }
            }
            
            if(!figure.dead) {
                figure.move();
                figure.playFrame();
            }
        }
        
        for(i = this.items.length; i--; )
            this.items[i].playFrame();
        
        this.coinGauge.playFrame();
        this.liveGauge.playFrame();
    },
    start: function() {
        var me = this;
        // Đảm bảo không có loop cũ đang chạy
        if (this.loop) { clearInterval(this.loop); } 
        me.loop = setInterval(function() {
            me.tick.apply(me);
        }, constants.interval);
    },
    pause: function() {
        clearInterval(this.loop);
        this.loop = undefined;
    },
    setPosition: function(x, y) {
        this._super(x, y);
        this.world.css('left', -x);
    },
    setImage: function(index) {
         var img = BASEPATH + 'backgrounds/' + ((index < 10 ? '0' : '') + index) + '.png';
         var parent = this.world.parent(); // Cache the parent
         if (parent.length) { // Check if parent exists
              parent.css({
                   backgroundImage : c2u(img),
                   backgroundPosition : '0 -380px' // Đảm bảo vị trí đúng
              });
         } else {
              console.error("World parent not found!");
         }
        // Gọi _super để lưu đường dẫn ảnh nếu cần
         this._super(img, 0, 0); 
    },
    setSize: function(width, height) {
        this._super(width, height);
         // Thêm cập nhật CSS width/height cho #world nếu cần
         this.world.css({ width: width, height: height }); 
    },
    setParallax: function(x) {
        this.setPosition(x, this.y);
         var parent = this.world.parent();
         if (parent.length) {
              parent.css('background-position', '-' + Math.floor(x / 3) + 'px -380px');
         }
    },
});

// ... (Các Class Figure, Matter, Ground, Decoration, Item giữ nguyên như file gốc) ...

/*
 * -------------------------------------------
 * FIGURE CLASS
 * -------------------------------------------
 */
var Figure = Base.extend({
    init: function(x, y, level) {
        this.view = $(DIV).addClass(CLS_FIGURE).appendTo(level.world);
        this.dx = 0;
        this.dy = 0;
        this.dead = false;
        this.onground = true;
        this.setState(size_states.small);
        this.setVelocity(0, 0);
        this.direction = directions.none; // Mặc định không có hướng
        this.level = level;
        this._super(x, y);
        level.figures.push(this);
    },
    setState: function(state) {
        this.state = state;
    },
    setImage: function(img, x, y) {
        // Cập nhật background cho view
        this.view.css({
            backgroundImage : img ? c2u(img) : 'none',
            backgroundPosition : '-' + (x || 0) + 'px -' + (y || 0) + 'px',
        });
        // Gọi hàm của lớp cha để lưu thông tin ảnh
        this._super(img, x, y);
    },
    setOffset: function(dx, dy) {
        this.dx = dx;
        this.dy = dy;
        this.setPosition(this.x, this.y); // Cập nhật lại CSS position
    },
    setPosition: function(x, y) {
        // Cập nhật CSS position
        this.view.css({
            left: x,
            bottom: y,
            marginLeft: this.dx,
            marginBottom: this.dy,
        });
        // Gọi hàm của lớp cha để lưu tọa độ logic
        this._super(x, y);
        // Cập nhật vị trí trên lưới
        this.setGridPosition(x, y);
    },
    setSize: function(width, height) {
        // Cập nhật CSS size
        this.view.css({
            width: width,
            height: height
        });
        // Gọi hàm của lớp cha để lưu kích thước logic
        this._super(width, height);
    },
    setGridPosition: function(x, y) {
        // Tính toán vị trí i, j trên lưới
        this.i = Math.floor((x + 16) / 32); // +16 để lấy tâm ngang
        this.j = Math.ceil(this.level.getGridHeight() - 1 - y / 32);
        
        // Nếu rơi xuống dưới màn hình -> chết
        if(this.j > this.level.getGridHeight()) // Sửa: dùng > thay vì >=
            this.die();
    },
    getGridPosition: function() { // Xóa x, y thừa
        return { i : this.i, j : this.j };
    },
    setVelocity: function(vx, vy) {
        this.vx = vx;
        this.vy = vy;
        
        // Cập nhật hướng dựa trên vx
        if(vx > 0)
            this.direction = directions.right;
        else if(vx < 0)
            this.direction = directions.left;
        // Giữ nguyên hướng nếu vx = 0
    },
    getVelocity: function() {
        return { vx : this.vx, vy : this.vy };
    },
    hit: function(opponent) {
        // Hàm này sẽ được ghi đè (override) ở lớp con
    },
    collides: function(is, ie, js, je, blocking) {
        var isHero = this instanceof Mario; // Sửa: Dùng Mario thay vì Hero
        
        // Kiểm tra biên màn chơi
        if(is < 0 || ie >= this.level.obstacles.length)
            return true; // Va chạm với biên ngang
            
        // Kiểm tra biên trên/dưới (nhưng không chặn hoàn toàn)
        if(js < 0) js = 0; // Không kiểm tra ô trên trời cao nhất
        if(je >= this.level.getGridHeight()) je = this.level.getGridHeight() - 1; // Chỉ kiểm tra đến ô cuối cùng
        if (je < js) return false; // Trường hợp không có ô nào để kiểm tra theo chiều dọc

        // Duyệt qua các ô trong vùng kiểm tra
        for(var i = is; i <= ie; i++) {
            for(var j = je; j >= js; j--) { // Duyệt từ trên xuống dưới trong cột
                var obj = this.level.obstacles[i][j];
                
                if(obj) { // Nếu ô đó có vật cản
                    // Nếu là Mario va chạm với Item và không phải va chạm từ dưới lên (hoặc item không chặn)
                    if(obj instanceof Item && isHero && (blocking === ground_blocking.bottom || obj.blocking === ground_blocking.none)) {
                         if (!obj.activated) { // Chỉ activate nếu chưa được kích hoạt
                              obj.activate(this);
                         }
                    }
                    
                    // Kiểm tra xem vật cản có chặn đúng hướng va chạm không
                    if((obj.blocking & blocking) === blocking)
                        return true; // Có va chạm chặn
                }
            }
        }
        
        return false; // Không có va chạm chặn
    },
    move: function() {
        var vx = this.vx;
        var vy = this.vy - constants.gravity; // Áp dụng trọng lực
        
        var s = this.state; // Kích thước (1 hoặc 2)
        
        var x = this.x;
        var y = this.y;
        
        var dx = Math.sign(vx); // Hướng di chuyển ngang (-1, 0, 1)
        var dy = Math.sign(vy); // Hướng di chuyển dọc (-1, 0, 1)
        
        // Tọa độ lưới hiện tại
        var is_current = Math.floor((x + 16) / 32); 
        var js_current = Math.ceil(this.level.getGridHeight() - 1 - y / 32); 

        var onground = false; // Reset trạng thái chạm đất

        // --- Xử lý va chạm ngang ---
        if (dx !== 0) {
             var x_new = x + vx;
             var is_new = Math.floor((x_new + 16 + (dx > 0 ? 0 : -1)) / 32); // Tính ô i mới
             var b = (dx > 0) ? ground_blocking.left : ground_blocking.right; // Hướng chặn cần kiểm tra
             var js_check = Math.ceil(this.level.getGridHeight() - s - (y + 31) / 32); // Ô j dưới cùng
             var je_check = js_current; // Ô j trên cùng
             
             // Kiểm tra va chạm trong khoảng từ is_current đến is_new
             var collision_occurred = false;
             for (var i_check = is_current; dx > 0 ? i_check <= is_new : i_check >= is_new; i_check += dx) {
                  if (this.collides(i_check, i_check, js_check, je_check, b)) {
                       vx = 0; // Dừng di chuyển ngang
                       // Dịch chuyển đến sát tường
                       x = i_check * 32 + (dx > 0 ? -16 : 16) - (dx > 0 ? 0.1 : -0.1); // Thêm 0.1 để tránh kẹt
                       collision_occurred = true;
                       break; // Thoát vòng lặp khi gặp va chạm
                  }
             }
             if (!collision_occurred) {
                  x = x_new; // Nếu không va chạm, cập nhật tọa độ x
             }
        }

        // --- Xử lý va chạm dọc ---
        var y_new = y + vy;
        var je_new = Math.ceil(this.level.getGridHeight() - 1 - y_new / 32); // Tính ô j mới (đáy)
        var js_new = Math.ceil(this.level.getGridHeight() - s - (y_new + 31) / 32); // Tính ô j mới (đỉnh)

        var is_check = Math.floor((x + 1) / 32); // Ô i bên trái để kiểm tra
        var ie_check = Math.floor((x + 31) / 32); // Ô i bên phải để kiểm tra

        if (dy < 0) { // Đang rơi xuống
             var b_bottom = ground_blocking.top;
             if (this.collides(is_check, ie_check, je_new, je_new, b_bottom)) {
                  vy = 0;
                  y = this.level.height - (je_new + 1) * 32; // Đặt vị trí ngay trên mặt đất
                  onground = true;
             } else {
                  y = y_new; // Cập nhật y nếu không chạm đất
             }
        } else if (dy > 0) { // Đang nhảy lên
             var b_top = ground_blocking.bottom;
             if (this.collides(is_check, ie_check, js_new, js_new, b_top)) {
                  vy = 0;
                  y = this.level.height - (js_new + s) * 32 - 1; // Đặt vị trí ngay dưới vật cản (-1 để tránh kẹt)
             } else {
                  y = y_new; // Cập nhật y nếu không chạm trần
             }
        } else { // vy = 0 (đứng yên hoặc trượt ngang)
             // Kiểm tra xem có đang đứng trên mặt đất không
             var b_check_ground = ground_blocking.top;
              if (!this.collides(is_check, ie_check, js_current + 1, js_current + 1, b_check_ground)) {
                 // Nếu không có gì bên dưới, bắt đầu rơi
                 onground = false; 
             } else {
                 onground = true; // Đang đứng trên mặt đất
             }
             y = y_new; // Cập nhật y (dù vy=0, nhưng có thể có sai số nhỏ)
        }


        this.onground = onground;
        this.setVelocity(vx, vy); // Cập nhật lại vận tốc (có thể đã bị đổi thành 0)
        this.setPosition(x, y);    // Cập nhật vị trí cuối cùng
    },
    death: function() {
        // Mặc định, chết là biến mất ngay
        return false;
    },
    die: function() {
        this.dead = true;
        // Thêm logic xóa view hoặc thay đổi hình ảnh nếu cần
    },
});

// ... (Các Class Matter, Ground, Decoration, Item, QuestionBox) ...
/*
 * -------------------------------------------
 * QUESTIONBOX CLASS (Đã thêm ở trên)
 * -------------------------------------------
 */
var QuestionBox = Item.extend({
    init: function(x, y, level) {
        this._super(x, y, true, level); 
        this.setImage(images.objects, 96, 33); 
        this.setupFrames(8, 4, false); 
        this.questionIndex = -1; 
        this.isUsed = false;     
    },
    assignQuestion: function(index) {
        this.questionIndex = index;
    },
    activate: function(from) {
        if (!this.isUsed && !this.isBouncing && from instanceof Mario) {
            this.bounce(); 
            this.clearFrames(); 
            this.setImage(images.objects, 514, 194); 
            this.isUsed = true; 
            this.level.playSound('mushroom'); 

            if (typeof window.showQuiz === 'function') {
                window.showQuiz(this.questionIndex, this); 
            } else {
                console.error("showQuiz function not found!"); 
            }
        }
        this._super(from); 
    },
}, 'questionbox');

// ... (Các Class ItemFigure, StarBox, MushroomBox, Bullet, Hero, Mario, Enemy, và các kẻ thù cụ thể giữ nguyên) ...

// --- DOCUMENT READY ---
$(document).ready(function() {
    // Khởi tạo Level (đối tượng chính quản lý game)
    var level = new Level('world'); 
    // Tải màn chơi đầu tiên từ dữ liệu trong testlevels.js
    level.load(definedLevels[0]); 
    // Bắt đầu vòng lặp game
    level.start(); 
    // Kích hoạt lắng nghe bàn phím
    keys.bind(); 
});

// --- HÀM SCALE GAME (Thêm vào cuối file nếu chưa có) ---
// Kích thước gốc của game (lấy từ CSS: #game)
const GAME_WIDTH = 640; 
const GAME_HEIGHT = 480;

function scaleGame() {
    const gameContainer = document.getElementById('game');
    if (!gameContainer) return; // Thoát nếu không tìm thấy #game
    
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    const scaleX = winWidth / GAME_WIDTH;
    const scaleY = winHeight / GAME_HEIGHT;
    
    const scale = Math.min(scaleX, scaleY); 

    gameContainer.style.transform = `scale(${scale})`;
    
    // Căn giữa sau khi scale (có thể cần nếu flexbox không hoạt động như ý)
    // gameContainer.style.marginLeft = `${(winWidth - (GAME_WIDTH * scale)) / 2}px`;
    // gameContainer.style.marginTop = `${(winHeight - (GAME_HEIGHT * scale)) / 2}px`;
}

// Gọi scaleGame khi tải xong và khi resize
window.addEventListener('load', scaleGame);
window.addEventListener('resize', scaleGame);
