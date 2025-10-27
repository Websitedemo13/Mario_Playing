/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */

// === KHAI BÁO GAME_WIDTH/HEIGHT LÊN ĐẦU ===
// Kích thước gốc của game (lấy từ CSS: #game)
const GAME_WIDTH = 640; 
const GAME_HEIGHT = 480;

/*
 * -------------------------------------------
 * BASE CLASS (Lớp cơ sở)
 * -------------------------------------------
 */
var Base = Class.extend({
    init: function(x, y) { // Hàm khởi tạo
        this.setPosition(x || 0, y || 0); // Đặt vị trí ban đầu
        this.clearFrames(); // Xóa cài đặt hoạt ảnh
        this.frameCount = 0; // Bộ đếm frame cho hoạt ảnh
    },
    setPosition: function(x, y) { // Đặt vị trí logic
        this.x = x;
        this.y = y;
    },
    getPosition: function() { // Lấy vị trí logic
        return { x : this.x, y : this.y };
    },
    setImage: function(img, x, y) { // Lưu thông tin ảnh nền và tọa độ cắt ảnh
        this.image = {
            path : img, // Đường dẫn ảnh
            x : x,      // Tọa độ x bắt đầu cắt ảnh
            y : y       // Tọa độ y bắt đầu cắt ảnh
        };
    },
    setSize: function(width, height) { // Đặt kích thước logic
        this.width = width;
        this.height = height;
    },
    getSize: function() { // Lấy kích thước logic
        return { width: this.width, height: this.height };
    },
    // Cài đặt thông số cho hoạt ảnh
    setupFrames: function(fps, frames, rewind, id) { 
        if(id && this.frameID === id) return true; // Tránh cài đặt lại nếu animation đang chạy
        
        this.frameID = id; // ID định danh cho hoạt ảnh đang chạy
        this.currentFrame = 0; // Frame hiện tại
        // Tính số tick game cho mỗi frame hoạt ảnh
        this.frameTick = frames ? (1000 / fps / constants.interval) : 0; 
        this.frames = frames; // Tổng số frame trong hoạt ảnh
        this.rewindFrames = rewind; // Hoạt ảnh có chạy ngược không (vd: đi trái)
        return false;
    },
    // Xóa cài đặt hoạt ảnh
    clearFrames: function() {
        this.frameID = undefined;
        this.frames = 0;
        this.currentFrame = 0;
        this.frameTick = 0;
    },
    // Chạy frame hoạt ảnh tiếp theo
    playFrame: function() {
        if(this.frameTick && this.view) { // Chỉ chạy nếu có cài đặt frame và có đối tượng view
            this.frameCount++;
            
            if(this.frameCount >= this.frameTick) { // Đủ thời gian để chuyển frame      
                this.frameCount = 0;
                if(this.currentFrame === this.frames) this.currentFrame = 0; // Quay lại frame đầu nếu hết
                    
                var $el = this.view;
                // Tính toán và cập nhật background-position để hiển thị frame mới
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
 * GAUGE CLASS (Lớp hiển thị UI)
 * -------------------------------------------
 */
var Gauge = Base.extend({
    init: function(id, startImgX, startImgY, fps, frames, rewind) {
        this._super(0, 0); // Gọi init của Base
        this.view = $('#' + id); // Lấy phần tử HTML bằng ID
        if(!this.view.length) { console.error("Gauge element not found:", id); return; } 
        this.setSize(this.view.width(), this.view.height()); // Lấy kích thước từ CSS

        var bgImage = this.view.css('background-image'); // Lấy ảnh nền từ CSS
        if (bgImage && bgImage !== 'none') {
             // Trích xuất URL ảnh từ CSS
             var imgUrlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
             if (imgUrlMatch && imgUrlMatch[1]) {
                  this.setImage(imgUrlMatch[1], startImgX, startImgY); // Lưu thông tin ảnh
             } else {
                 console.warn("Could not parse background image URL for gauge:", id, bgImage);
             }
        } else {
            console.warn("No background image set for gauge:", id);
        }
        this.setupFrames(fps, frames, rewind); // Cài đặt hoạt ảnh (nếu có)
    },
});

/*
 * -------------------------------------------
 * LEVEL CLASS (Lớp quản lý màn chơi)
 * -------------------------------------------
 */
var Level = Base.extend({
    init: function(id) {
        this.world = $('#' + id); // Lấy div #world
        if (!this.world.length) { console.error("World element not found:", id); return; }
        this.nextCycles = 0; // Bộ đếm thời gian chờ chuyển màn
        this._super(0, 0);
        this.active = false; // Trạng thái màn chơi đang hoạt động?
        this.figures = []; // Mảng chứa các đối tượng di chuyển (Mario, Enemies)
        this.obstacles = []; // Mảng 2D chứa các vật cản tĩnh (gạch, ống nước)
        this.decorations = []; // Mảng chứa các vật trang trí
        this.items = []; // Mảng chứa các vật phẩm (hộp ?, xu...)
        // Tạo đối tượng Gauge cho Xu và Mạng
        this.coinGauge = new Gauge('coin', 0, 0, 10, 4, true); 
        this.liveGauge = new Gauge('live', 0, 430, 6, 6, true); 
    },
    // Tải lại màn chơi khi Mario chết
    reload: function() {
        console.log("Reloading level...");
        var settings = {};
        this.pause(); // Dừng game loop
        
        var mario = this.figures.find(fig => fig instanceof Mario); // Tìm Mario
        if (mario) {
            settings.lifes = mario.lifes - 1; // Giảm 1 mạng
            settings.coins = mario.coins; // Giữ nguyên số xu
        } else {
             settings.lifes = constants.start_lives -1; // Trường hợp không tìm thấy Mario
             settings.coins = 0;
        }
        
        this.reset(); // Xóa mọi thứ trên màn
        
        if(settings.lifes < 0) {
            // Hết mạng -> Gọi Game Over
            if(typeof window.handleGameOver === 'function') {
                 window.handleGameOver(); 
            } else {
                 alert("Game Over! Hết mạng."); 
                 window.location.reload();
            }
            return; // Dừng không tải lại màn
        } else {        
            // Tải lại dữ liệu màn hiện tại
            if (!this.raw) { 
                 console.error("Cannot reload level, raw level data not found!"); 
                 // Có thể tải lại màn đầu tiên như fallback
                 if(definedLevels && definedLevels[0]) this.load(definedLevels[0]); 
                 else return; // Không có dữ liệu để load
            } else {
                 this.load(this.raw); 
            }
            
            // Tìm lại Mario sau khi load và đặt lại mạng/xu
            mario = this.figures.find(fig => fig instanceof Mario); 
            if (mario) {
                 mario.setLifes(settings.lifes); // Đặt lại số mạng
                 mario.setCoins(settings.coins); // Đặt lại số xu
            }
        }
        
        this.start(); // Bắt đầu lại game loop
    },
    // Tải dữ liệu màn chơi
    load: function(levelData) {
        if (!levelData) { console.error("Invalid level data provided to load function!"); return;}
        console.log("Loading level:", levelData.id);

        if (this.active) { // Nếu đang có màn chơi cũ, dừng và reset
            if (this.loop) this.pause();
            this.reset();
        }

        this.setPosition(0, 0); // Đặt vị trí camera ban đầu
        this.setSize(levelData.width * 32, levelData.height * 32); // Đặt kích thước thế giới
        this.setImage(levelData.background); // Đặt ảnh nền
        this.raw = levelData; // Lưu dữ liệu gốc để reload
        this.id = levelData.id; // Lưu ID màn
        this.active = true;
        var data = levelData.data;

        // Khởi tạo lưới vật cản obstacles[][]
        this.obstacles = []; // Xóa lưới cũ
        for (var i = 0; i < levelData.width; i++) {
            var t = [];
            for (var j = 0; j < levelData.height; j++) {
                t.push(null); // Dùng null thay vì '' để rõ ràng hơn
            }
            this.obstacles.push(t);
        }

        // Đặt biến đếm câu hỏi trước vòng lặp
        let questionCounter = 0; 
        if (!data) { console.error("Level data array is missing!"); return; }

        // Duyệt qua dữ liệu màn chơi để tạo đối tượng
        for (var i = 0, width = data.length; i < width; i++) {
            var col = data[i];
            if (!col) { console.warn(`Column ${i} is undefined in level data!`); continue; } 
            for (var j = 0, height = col.length; j < height; j++) {
                var tileId = col[j];
                // Chỉ tạo nếu tileId không rỗng và có trong reflection
                if (tileId && reflection[tileId]) { 
                    try {
                        // Tạo đối tượng (instance)
                        var instance = new (reflection[tileId])(i * 32, (levelData.height - 1 - j) * 32, this); // Sửa lại tính toán Y

                        // Gán index câu hỏi cho QuestionBox
                        if (instance instanceof QuestionBox) {
                            let qIndex = (this.id * 3) + questionCounter; // (ID màn * 3) + thứ tự hộp
                            if (typeof gameQuestions !== 'undefined' && qIndex >= 0 && qIndex < gameQuestions.length) {
                                instance.assignQuestion(qIndex); 
                                questionCounter++; 
                            } else {
                                console.warn(`Level ${this.id}, Box ${questionCounter}: Question index ${qIndex} out of bounds! Using 0.`);
                                instance.assignQuestion(0); 
                            }
                        }
                    } catch (e) {
                         console.error(`Error creating instance for tileId '${tileId}' at [${i}, ${j}]:`, e);
                    }
                } 
            } 
        } 
        console.log("Level", this.id, "loaded with", this.figures.length, "figures,", this.items.length, "items.");
    }, 
    // Chuẩn bị chuyển màn tiếp theo
    next: function() {
        console.log("Level complete! Preparing for next level...");
        this.nextCycles = Math.floor(3000 / constants.interval); // Giảm thời gian chờ
    },
    // Tải màn tiếp theo hoặc kết thúc game
    nextLoad: function() {
        if (this.nextCycles > 0) return; // Vẫn đang chờ

        const nextLevelId = this.id + 1;
        // Kết thúc game nếu đã hoàn thành màn cuối (id=2)
        if (nextLevelId >= definedLevels.length || nextLevelId >= 3) { 
            this.pause(); keys.reset(); keys.unbind();
            if(this.sounds) this.sounds.stopMusic(); 
            // TODO: Thay alert bằng màn hình chiến thắng
            alert("Chúc mừng! Bạn đã hoàn thành xuất sắc!"); 
            window.location.reload(); 
            return; 
        }
        
        console.log("Loading next level:", nextLevelId);
        var settings = {};
        this.pause();
        var mario = this.figures.find(fig => fig instanceof Mario);
        if (mario) {
            settings.lifes = mario.lifes;
            settings.coins = mario.coins;
            settings.state = mario.state;
            settings.marioState = mario.marioState;
        }
        
        this.reset();
        this.load(definedLevels[nextLevelId]); // Tải màn tiếp theo
        
        mario = this.figures.find(fig => fig instanceof Mario);
        if (mario) {
            mario.setLifes(settings.lifes !== undefined ? settings.lifes : constants.start_lives);
            mario.setCoins(settings.coins || 0);
            mario.setState(settings.state || size_states.small);
            mario.setMarioState(settings.marioState || mario_states.normal);
        }
        this.start();
    },
    getGridWidth: function() { return this.raw ? this.raw.width : 0; },
    getGridHeight: function() { return this.raw ? this.raw.height : 0; },
    setSounds: function(manager) { this.sounds = manager; },
    playSound: function(label) { if(this.sounds) this.sounds.play(label); },
    playMusic: function(label) { if(this.sounds) this.sounds.sideMusic(label); },
    // Reset màn chơi
    reset: function() {
        console.log("Resetting level...");
        this.active = false;
        this.world.empty(); // Xóa các div con trong #world
        this.figures = [];
        this.obstacles = [];
        this.items = [];
        this.decorations = [];
        this.setPosition(0, 0); // Reset camera
         if (this.world.parent().length) { // Reset background
              this.world.parent().css('background-image', 'none');
         }
    },
    // Vòng lặp chính của game
    tick: function() {
        if(this.nextCycles > 0) { // Đang chờ chuyển màn
            this.nextCycles--;
            if (this.nextCycles === 0) this.nextLoad(); // Hết giờ chờ -> tải màn mới          
            return;
        }
        
        var i = 0, j = 0, figure, opponent;
        
        // Duyệt qua tất cả Figures (Mario, Enemies...) từ cuối lên đầu
        for(i = this.figures.length - 1; i >= 0; i-- ) {
            figure = this.figures[i];
            
            if (!figure) continue; // Bỏ qua nếu figure không tồn tại

            if(figure.dead) { // Nếu đối tượng đang chết
                if(!figure.death()) { // Gọi hàm death() để xử lý hoạt ảnh chết
                    // Nếu death() trả về false -> Hoạt ảnh chết đã xong
                    if(figure instanceof Mario) {
                        return this.reload(); // Mario chết xong -> reload màn
                    } else {
                        // Kẻ thù chết xong -> xóa khỏi game
                        if (figure.view) figure.view.remove();
                        this.figures.splice(i, 1); // Xóa khỏi mảng figures
                    }
                } else {
                     if (figure.playFrame) figure.playFrame(); // Tiếp tục chạy hoạt ảnh chết
                }
            } else { // Nếu đối tượng còn sống
                // Kiểm tra va chạm với các đối tượng khác đứng trước nó trong mảng
                 if(i > 0) { // Chỉ kiểm tra nếu không phải là đối tượng đầu tiên (thường là Mario)
                    for(j = i - 1; j >= 0; j--) { 
                        if (!this.figures[i]) break; // Figure có thể đã bị xóa bởi hit()
                         figure = this.figures[i]; // Lấy lại figure vì splice có thể thay đổi mảng
                         if(figure.dead) break; 

                        opponent = this.figures[j];
                        if (!opponent) continue; // Bỏ qua nếu opponent không tồn tại
                        
                        // Chỉ kiểm tra va chạm nếu cả 2 còn sống và đủ gần nhau (tối ưu hóa)
                        if(!opponent.dead && Math.abs(figure.x - opponent.x) < 64 && q2q(figure, opponent)) { 
                            figure.hit(opponent);
                            // Kiểm tra lại cả 2 sau va chạm đầu tiên
                             if (!opponent.dead && !figure.dead) { 
                                opponent.hit(figure);
                            }
                        }
                    }
                }
            }
            
            // Nếu vẫn còn sống sau các va chạm -> di chuyển và chạy hoạt ảnh
            // Cần kiểm tra lại figure tồn tại vì có thể đã bị xóa
            if (this.figures[i] && !this.figures[i].dead) { 
                this.figures[i].move();
                this.figures[i].playFrame();
            }
        }
        
        // Chạy hoạt ảnh cho Items (hộp ?, xu tĩnh...)
        for(i = this.items.length - 1; i >= 0; i-- ) {
            // Có thể thêm kiểm tra item có cần xóa không (vd: xu đã ăn)
            if (this.items[i] && this.items[i].playFrame) { // Check if item still exists
                 this.items[i].playFrame();
            }
        }
        
        // Chạy hoạt ảnh cho Gauges (UI)
        if (this.coinGauge && this.coinGauge.playFrame) this.coinGauge.playFrame();
        if (this.liveGauge && this.liveGauge.playFrame) this.liveGauge.playFrame();
    },
    // Bắt đầu game loop
    start: function() {
        if (this.loop) return; // Không bắt đầu nếu đang chạy
        var me = this;
        console.log("Starting game loop...");
        me.loop = setInterval(function() {
            try { // Thêm try...catch để bắt lỗi trong game loop
                 me.tick.apply(me);
            } catch(e) {
                 console.error("Error in game tick:", e);
                 me.pause(); // Dừng game nếu có lỗi nghiêm trọng
            }
        }, constants.interval);
    },
    // Dừng game loop
    pause: function() {
        if (this.loop) {
             console.log("Pausing game loop...");
             clearInterval(this.loop);
             this.loop = undefined;
        }
    },
    // Đặt vị trí camera (scroll world)
    setPosition: function(x, y) {
        this._super(x, y); // Lưu tọa độ logic
        // Di chuyển div#world ngược lại để tạo hiệu ứng camera
        if (this.world) {
            this.world.css('left', -x); 
            // Có thể thêm giới hạn để camera không ra ngoài màn chơi
        }
    },
    // Đặt ảnh nền cho màn chơi
    setImage: function(index) {
        // Tạo đường dẫn ảnh nền dựa vào index
         const img = `Content/backgrounds/${index < 10 ? '0' : ''}${index}.png`;
         const parent = this.world ? this.world.parent() : null; 
         if (parent && parent.length) { 
              parent.css({
                   backgroundImage : c2u(img),
                   // Điều chỉnh backgroundPosition nếu cần cho parallax hoặc vị trí nền
                   backgroundPosition : '0 -380px', 
                   backgroundRepeat: 'repeat-x' // Cho phép nền lặp lại theo chiều ngang
              });
         } else {
              console.warn("Could not set background image, world parent not found.");
         }
        // Gọi _super để lưu đường dẫn (không bắt buộc)
         // this._super(img, 0, 0); 
    },
    // Đặt kích thước logic và CSS cho world
    setSize: function(width, height) {
        this._super(width, height);
        if (this.world) {
             this.world.css({ width: width, height: height }); 
        }
    },
    // Điều chỉnh vị trí camera và background (parallax)
    setParallax: function(x) {
        this.setPosition(x, this.y); // Di chuyển camera (world)
        const parent = this.world ? this.world.parent() : null;
        if (parent && parent.length) {
             // Di chuyển background chậm hơn (1/3 tốc độ) để tạo chiều sâu
             parent.css('background-position', `-${Math.floor(x / 3)}px -380px`);
        }
    },
});

// --- FIGURE CLASS --- (Giữ nguyên)
var Figure = Base.extend({ /* ... code Figure ... */ });

// --- MATTER CLASS --- (Giữ nguyên)
var Matter = Base.extend({ /* ... code Matter ... */ });

// --- CÁC LỚP GROUND, DECORATION --- (Giữ nguyên)
var Ground = Matter.extend({ /* ... */ });
var TopGrass = Ground.extend({ /* ... */ }, 'grass_top');
// ... (các loại ground, grass, stone, pipe khác) ...
var Decoration = Matter.extend({ /* ... */ });
// ... (các loại decoration khác) ...

// --- ITEM CLASS --- (Giữ nguyên)
var Item = Matter.extend({ /* ... code Item ... */ });

// --- QUESTIONBOX CLASS ---
var QuestionBox = Item.extend({
    init: function(x, y, level) {
        this._super(x, y, true, level); 
        this.setImage(images.objects, 96, 33); // Ảnh hộp ? nhấp nháy
        this.setupFrames(8, 4, false, 'QuestionBoxBlink'); // Thêm ID cho animation
        this.questionIndex = -1; 
        this.isUsed = false;     
    },
    assignQuestion: function(index) { this.questionIndex = index; },
    activate: function(from) {
        if (!this.isUsed && !this.isBouncing && from instanceof Mario) {
            this.bounce(); 
            this.clearFrames(); 
            this.setImage(images.objects, 514, 194); // Ảnh hộp đã dùng
            this.isUsed = true; 
            this.level.playSound('mushroom'); // Âm thanh tạm

            if (typeof window.showQuiz === 'function') {
                window.showQuiz(this.questionIndex, this); 
            } else { console.error("showQuiz function not found!"); }
        }
        // Không gọi _super() ở đây vì Item không có activate
    },
     // Ghi đè playFrame để dừng nhấp nháy nếu isUsed=true
     playFrame: function() {
          if (!this.isUsed) {
               this._super(); // Chạy playFrame gốc (nhấp nháy)
          }
          // Xử lý hiệu ứng nảy (đã có trong Item)
          Item.prototype.playFrame.call(this); // Gọi playFrame của Item để xử lý bounce
     }
}, 'questionbox'); // Đăng ký reflection

// --- CÁC LỚP ITEM KHÁC (Coin, CoinBox, StarBox, MushroomBox...) --- (Giữ nguyên)
var Coin = Item.extend({ /* ... */ }, 'coin');
var CoinBoxCoin = Coin.extend({ /* ... */ });
var CoinBox = Item.extend({ /* ... */ }, 'coinbox');
var MultipleCoinBox = CoinBox.extend({ /* ... */ }, 'multiple_coinbox');
var ItemFigure = Figure.extend({ /* ... */ }); // Lớp cha cho Nấm, Sao...
var StarBox = Item.extend({ /* ... */ }, 'starbox');
var Star = ItemFigure.extend({ /* ... */ });
var MushroomBox = Item.extend({ /* ... */ }, 'mushroombox');
var Mushroom = ItemFigure.extend({ /* ... */ });

// --- BULLET CLASS --- (Giữ nguyên)
var Bullet = Figure.extend({ /* ... code Bullet ... */ });

// --- HERO CLASS --- (Giữ nguyên)
var Hero = Figure.extend({ /* ... code Hero ... */ });

// --- MARIO CLASS --- (Thêm kiểm tra Game Over)
var Mario = Hero.extend({
     // ... (init, setMarioState, setState, setPosition, input, victory, shoot... giữ nguyên) ...

     // Sửa hàm setLifes để kiểm tra Game Over
     setLifes : function(lifes) {
          this.lifes = lifes;
          if (this.level && this.level.world) { // Kiểm tra level tồn tại
              const liveNumberElement = $('#liveNumber'); // Lấy trực tiếp bằng ID
              if (liveNumberElement.length) {
                   liveNumberElement.text(this.lifes);
              }
          }
          // --- KIỂM TRA GAME OVER ---
          if (this.lifes < 0 && !this.dead) { // Chỉ gọi nếu chưa chết và hết mạng
               // Không gọi die() nữa mà gọi thẳng handleGameOver
               if (typeof window.handleGameOver === 'function') {
                    window.handleGameOver();
               } else {
                    console.error("handleGameOver function not found!");
               }
               // Không cần gọi this.die() ở đây nữa vì handleGameOver sẽ dừng game
          }
          // --- KẾT THÚC KIỂM TRA ---
     },

     // Hàm die() chỉ xử lý trạng thái chết và hoạt ảnh
     die: function() {
          if (this.dead) return; // Tránh gọi die nhiều lần
          console.log("Mario died!");
          this.setMarioState(mario_states.normal);
          this.deathStepDown = Math.ceil(240 / (this.deathFrames || 1)); // Tránh chia cho 0
          this.setupFrames(9, 2, false, 'MarioDeath'); // Thêm ID
          this.setImage(images.sprites, 81, 324); // Ảnh chết
          if (this.level) this.level.playMusic('die'); // Chơi nhạc chết
          this._super(); // Gọi Figure.die() để đặt this.dead = true
     },

     // Hàm hurt() gọi die() nếu cần, không gọi handleGameOver trực tiếp
     hurt: function(from) {
          if(this.deadly > 0) { // Đang bất tử Sao
               if (from && typeof from.die === 'function') { from.die(); }
               return; // Không bị thương
          } 
          if(this.invulnerable > 0) { return; } // Đang miễn nhiễm tạm thời

          if(this.state === size_states.small) {
               this.die(); // Gọi hàm die() để bắt đầu trạng thái chết
          } else {
               this.invulnerable = Math.floor(constants.invulnerable / constants.interval);
               this.blink(Math.ceil(this.invulnerable / (2 * constants.blinkfactor)));
               this.setState(size_states.small); // Thu nhỏ lại
               if (this.level) this.level.playSound('hurt');               
          }
     },
    
     // ... (Các hàm còn lại của Mario giữ nguyên) ...
}, 'mario'); // Đăng ký reflection cho Mario

// --- ENEMY CLASS --- (Giữ nguyên)
var Enemy = Figure.extend({ /* ... code Enemy ... */ });

// --- CÁC LỚP ENEMY CỤ THỂ --- (Giữ nguyên)
var Gumpa = Enemy.extend({ /* ... */ }, 'ballmonster');
var TurtleShell = Enemy.extend({ /* ... */ }, 'shell');
var GreenTurtle = Enemy.extend({ /* ... */ }, 'greenturtle');
var SpikedTurtle = Enemy.extend({ /* ... */ }, 'spikedturtle');
var Plant = Enemy.extend({ /* ... */ });
var StaticPlant = Plant.extend({ /* ... */ }, 'staticplant');
var PipePlant = Plant.extend({ /* ... */ }, 'pipeplant');

// --- DOCUMENT READY (KHỞI TẠO GAME) ---
// Bỏ phần khởi tạo game ở đây, chuyển vào trong index.html sau khi login
/*
$(document).ready(function() {
    // KHÔNG KHỞI TẠO GAME Ở ĐÂY NỮA
    // var level = new Level('world'); 
    // level.load(definedLevels[0]); 
    // level.start(); 
    // keys.bind(); 
});
*/

// --- HÀM SCALE GAME (Đã có ở trên, không cần khai báo lại) ---
// function scaleGame() { ... }
// window.addEventListener('load', scaleGame);
// window.addEventListener('resize', scaleGame);

