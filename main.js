const cvs = document.querySelector("canvas");
const ctx = cvs.getContext("2d");

document.addEventListener("mousedown", e => {
  game.mousedown(e);
});

document.addEventListener("keydown", e => {
  game.keydown(e);
});

class Game {
  static FRAME = 100;

  constructor() {
    this.index = 0;
    this.score = 0;
    this.field = new Field(this);

    this.main();
  }

  draw() {
    this.field.draw();
  }

  update() {
    this.field.update();
  }

  main() {
    this.draw();
    this.update();

    setTimeout(() => {
      this.main();
    }, Game.FRAME);
  }

  mousedown(e) {
    switch (this.index) {
      case 0:
        if (e.target.tagName === "CANVAS") {
          this.index = 1;
          this.field.init();
        }

        break;
      case 1:
        game.field.create_item(e);

        break;
    }
  }

  keydown(e) {
    switch (this.index) {
      case 1:
        if (e.key === "Escape") {
          this.index = 0;
          this.field.init();
        }

        break;
    }
  }
}

class Field {
  constructor(game) {
    this.game = game;
    this.width = cvs.width;
    this.height = cvs.height;
    this.border = 100;
    this.colors = ["red", "orange", "purple", "pink", "yellow", "yellowgreen", "green"];
    this.next_size = Math.floor(Math.random() * 3) + 1;
    this.items = [];
  }

  init() {
    this.game.score = 0;
    this.items = [];
  }

  draw() {
    ctx.fillStyle = "rgb(237, 235, 204)";
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(0, this.border);
    ctx.lineTo(this.width, this.border);
    ctx.stroke();

    for (let i = 0; i < this.items.length; i++) {
      this.items[i].draw();
    }

    switch (this.game.index) {
      case 0:
        ctx.save();
        
        ctx.translate(this.width / 2, this.height / 2);
        
        ctx.font = "32px serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText("タップしてスタート", 0, 0);

        ctx.restore();

        break;
      case 1:
        // スコア
        ctx.save();

        ctx.translate(30, 50);

        ctx.font = "24px serif";
        ctx.fillStyle = "black";
        ctx.fillText(this.game.score, 0, 0);

        ctx.restore();

        // 次のアイテム
        ctx.save();
    
        ctx.translate(this.width - 40, 50);
        ctx.globalAlpha = 0.8;
    
        // 輪郭
        ctx.fillStyle = this.colors[this.next_size - 1];
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, 2 * Math.PI);
        ctx.fill();
    
        // 目
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(- 30  / 2, 0, 30 / 4, 0, 2 * Math.PI);
        ctx.fill();
    
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(30 / 2, 0, 30 / 4, 0, 2 * Math.PI);
        ctx.fill();
    
        // ハイライト
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(-30 / 2 + 30 / 12, -30 / 12, 30 / 8, 0, 2 * Math.PI);
        ctx.fill();
    
        ctx.beginPath();
        ctx.arc(30 / 2 + 30 / 12, -30 / 12, 30 / 8, 0, 2 * Math.PI);
        ctx.fill();
    
        ctx.beginPath();
        ctx.arc(-30 / 2 - 30 / 8, 30 / 8, 30 / 16, 0, 2 * Math.PI);
        ctx.fill();
    
        ctx.beginPath();
        ctx.arc(30 / 2 - 30 / 8, 30 / 8, 30 / 16, 0, 2 * Math.PI);
        ctx.fill();
    
        // 口
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(0, 30 / 4, 30 / 6, 0, Math.PI);
        ctx.stroke();
    
        // へた
        ctx.fillStyle = "yellowgreen";
        ctx.beginPath();
        ctx.arc(0, -30, 30 / 6, 0, 2 * Math.PI);
        ctx.fill();
    
        ctx.restore();

        break;
    }
  }

  update() {
    // アイテムをソート
    this.items.sort((a, b) => a.y - b.y);
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].index = i;
    }

    for (let i = 0; i < this.items.length; i++) {
      this.items[i].update();
    }
  }

  // アイテム生成
  create_item(e) {
    if (this.game.index !== 1) {
      return;
    }

    if (e.target.tagName === "CANVAS" && e.offsetY < this.border) {
      this.items.push(new Item(e.offsetX, e.offsetY, this.width, this.height, this.items, this.items.length, this.next_size, this));
      this.next_size = Math.floor(Math.random() * 3) + 1;
    }
  }

  create_item2(x, y, size) {
    this.game.score += size * 10;
    this.items.push(new Item(x, y, this.width, this.height, this.items, this.items.length, size, this));
  }
}

class Item {
  constructor(x, y, w, h, items, index, size, field) {
    this.x = x;
    this.y = y;
    this.old_x = x;
    this.old_y = y;
    this.sin = 0;
    this.cos = 0;
    this.x0 = x;
    this.y0 = y;
    this.ux = 0;
    this.uy = 0;
    this.av = 0;
    this.ang = 0;
    this.ux0 = 0;
    this.uy0 = 0;
    this.e = 0.2;
    this.g = 15;
    this.t = 0;
    this.size = size;
    this.r = size * 20;
    this.field = field;
    this.index = index;
    this.field_width = w;
    this.field_height = h;
    this.items = items;
    this.stop_flag = false;
    this.vibration_flag = false;
    this.delete_flag = false;
    this.colors = ["red", "orange", "purple", "pink", "yellow", "yellowgreen", "green"];

    if (this.x - this.r < 0) {
      this.x = this.r;
      this.old_x = this.x;
    } else if (this.x + this.r > this.field_width) {
      this.x = this.field_width - this.r;
      this.old_x = this.x;
    }
  }

  draw() {
    if (this.delete_flag) {
      return;
    }

    ctx.save();

    ctx.translate(this.x, this.y);
    ctx.rotate(this.ang);
    
    // 輪郭
    ctx.fillStyle = this.colors[this.size - 1];
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, 2 * Math.PI);
    ctx.fill();

    // 目
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(-this.r  / 2, 0, this.r / 4, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.r / 2, 0, this.r / 4, 0, 2 * Math.PI);
    ctx.fill();

    // ハイライト
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(-this.r / 2 + this.r / 12, -this.r / 12, this.r / 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.r / 2 + this.r / 12, -this.r / 12, this.r / 8, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-this.r / 2 - this.r / 8, this.r / 8, this.r / 16, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.r / 2 - this.r / 8, this.r / 8, this.r / 16, 0, 2 * Math.PI);
    ctx.fill();

    // 口
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.arc(0, this.r / 4, this.r / 6, 0, Math.PI);
    ctx.stroke();

    // へた
    ctx.fillStyle = "yellowgreen";
    ctx.beginPath();
    ctx.arc(0, -this.r, this.r / 6, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }

  update() {
    if (this.delete_flag) {
      return;
    }

    this.move();
    this.check_colision();
  }

  // 移動
  move() {
    this.t++;
    if (this.vibration_flag) {
      this.old_x = this.x;
      this.old_y = this.y;
      this.old_ux = this.ux;
      this.ux = this.ux0;
      this.uy = this.uy0 + this.g * this.t;
      this.ang += this.av / this.r;
      this.x = this.x0 + (this.ux0 + this.ux) * this.t / 2;
      this.y = this.y0 + (this.uy0 + this.uy) * this.t / 2;

      // 連続で振動したら止まる
      if (this.old_ux * this.ux < 0) {
        this.stop_flag = true;
      } else {
        this.vibration_flag = false;
      }
    } else {
      this.old_x = this.x;
      this.old_y = this.y;
      this.old_ux = this.ux;
      this.ux = this.ux0;
      this.uy = this.uy0 + this.g * this.t;
      this.ang += this.av / this.r;
      this.x = this.x0 + (this.ux0 + this.ux) * this.t / 2;
      this.y = this.y0 + (this.uy0 + this.uy) * this.t / 2;

      if (this.old_ux * this.ux < 0) {
        this.vibration_flag = true;
      } else {
        this.vibration_flag = false;
      }
    }
  }

  // 衝突判定(改善する)
  check_colision() {
    // 下壁
    if (this.y + this.r >= this.field_height) {
      this.t = 0;
      this.y = this.field_height - this.r;
      this.x0 = this.x;
      this.y0 = this.y;
      this.uy0 = - this.e * this.uy;
      this.ux0 = this.e * this.ux;
      this.av *= this.e;
      

      if (Math.abs(this.uy0) < this.g) {
        this.uy0 = 0;
      }
      
      if (Math.abs(this.ux0) < 1) {
        this.ux0 = 0;
      }
    }

    // 左壁
    if (this.x - this.r < 0) {
      this.x = this.r;
      this.t = 0;
      this.x0 = this.x;
      this.y0 = this.y;
      this.ux0 = - this.e * this.ux;
      this.av *= -this.e;

      if (Math.abs(this.ux0) < 1) {
        this.ux0 = 0;
      }
    }

    // 右壁
    if (this.x + this.r > this.field_width) {
      this.x = this.field_width - this.r;
      this.t = 0;
      this.x0 = this.x;
      this.y0 = this.y;
      this.ux0 = - this.e * this.ux;
      this.av *= -this.e;
      
      if (Math.abs(this.ux0) < 1) {
        this.ux0 = 0;
      }
    }

    for (let i = 0; i < this.items.length; i++) {
      if (i !== this.index && !this.items[i].delete_flag) {
        // 貫通したとき
        if (this.y > this.items[i].y && this.old_y < this.items[i].y && Math.abs(this.x - this.items[i].x) < this.r + this.items[i].r) {
          if (this.size === this.items[i].size) {
            this.delete_flag = true;
            this.items[i].delete_flag = true;
            if (this.size !== 7) {
              this.field.create_item2((this.x + this.items[i].x) / 2, (this.y + this.items[i].y) / 2, this.size + 1);
            }
          }
          // ｙ座標を衝突位置に移動
          this.y = this.items[i].y;
          
          do {
            this.y--;
          } while ((this.x - this.items[i].x) ** 2 + (this.y - this.items[i].y) ** 2 <= (this.r + this.items[i].r) ** 2);

          let dis = ((this.x - this.items[i].x) ** 2 + (this.y - this.items[i].y) ** 2) ** 0.5;
          // 自身の変更
          this.sin = (this.y - this.items[i].y) / dis;
          this.cos = (this.x - this.items[i].x) / dis;

          this.t = 0;
          this.ux0 = - this.e * (this.uy * this.sin) * this.cos;
          this.uy0 = - this.e * (this.uy * this.sin) * this.sin;
          if (this.x - this.r !== 0 && this.x + this.r !== this.field_width) {
            this.av = this.e * (this.uy * this.cos);
          }
          this.y0 = this.y;
          this.x0 = this.x;
        }

        // 重なったとき(改善)
        if ((this.x - this.items[i].x) ** 2 + (this.y - this.items[i].y) ** 2 < (this.r + this.items[i].r) ** 2) {
          if (this.size === this.items[i].size) {
            this.delete_flag = true;
            this.items[i].delete_flag = true;
            if (this.size !== 7) {
              this.field.create_item2((this.x + this.items[i].x) / 2, (this.y + this.items[i].y) / 2, this.size + 1);
            }
          }

          // y座標を衝突位置に移動
          // 上から衝突
          do {
            this.y--;
          } while ((this.x - this.items[i].x) ** 2 + (this.y - this.items[i].y) ** 2 <= (this.r + this.items[i].r) ** 2);

          let dis = ((this.x - this.items[i].x) ** 2 + (this.y - this.items[i].y) ** 2) ** 0.5;

          this.sin = (this.y - this.items[i].y) / dis;
          this.cos = (this.x - this.items[i].x) / dis;

          this.t = 0;
          this.ux0 = - this.e * (this.uy * this.sin) * this.cos;
          this.uy0 = - this.e * (this.uy * this.sin) * this.sin;
          if (this.x - this.r !== 0 && this.x + this.r !== this.field_width) {
            this.av = this.e * (this.uy * this.cos);
          }
          this.y0 = this.y;
          this.x0 = this.x;
        }
      }
    }
  }
}

const game = new Game();