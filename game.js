const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let level = 1;
let speed = 2;
let distance = 0;
let targetDistance = 1000; // Quãng đường để hoàn thành cấp độ (m)
let carX = canvas.width / 2 - 25;
let carY = canvas.height - 100;
const carWidth = 50;
const carHeight = 100;
const lanes = 4;
const laneWidth = canvas.width / lanes;
let otherCars = []; // Mảng chứa các xe khác trên đường
let gameOver = false; // Biến để kiểm tra trạng thái trò chơi

// Tải hình ảnh xe và âm thanh
const carImage = new Image();
carImage.src = 'car.png'; // Thay đổi đường dẫn đến hình ảnh xe của bạn

const otherCarImage = new Image();
otherCarImage.src = 'other_car.png'; // Thay đổi đường dẫn đến hình ảnh xe khác của bạn

const crashSound = new Audio('crash.mp3');
const victorySound = new Audio('victory.mp3');

carImage.onload = startGame;
otherCarImage.onload = startGame;

function startGame() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    updateGame();
}

function handleKeyDown(e) {
    if (gameOver) {
        if (e.key === 'Enter') {
            resetGame();
        }
        return;
    }

    switch (e.key) {
        case 'ArrowLeft':
            carX -= 10;
            if (carX < 0) carX = 0;
            break;
        case 'ArrowRight':
            carX += 10;
            if (carX > canvas.width - carWidth) carX = canvas.width - carWidth;
            break;
        case 'ArrowUp':
            carY -= 10;
            if (carY < 0) carY = 0;
            break;
        case 'ArrowDown':
            carY += 10;
            if (carY > canvas.height - carHeight) carY = canvas.height - carHeight;
            break;
    }
}

let initialTouchX = null;
let initialTouchY = null;

function handleTouchStart(e) {
    if (gameOver) return;

    const touch = e.touches[0];
    initialTouchX = touch.clientX;
    initialTouchY = touch.clientY;
}

function handleTouchMove(e) {
    if (gameOver) return;

    if (!initialTouchX || !initialTouchY) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - initialTouchX;
    const deltaY = touch.clientY - initialTouchY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30) {
            carX += 10;
            if (carX > canvas.width - carWidth) carX = canvas.width - carWidth;
        } else if (deltaX < -30) {
            carX -= 10;
            if (carX < 0) carX = 0;
        }
    } else {
        if (deltaY > 30) {
            carY += 10;
            if (carY > canvas.height - carHeight) carY = canvas.height - carHeight;
        } else if (deltaY < -30) {
            carY -= 10;
            if (carY < 0) carY = 0;
        }
    }

    initialTouchX = touch.clientX;
    initialTouchY = touch.clientY;
}

function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Di chuyển xe
    distance += speed;

    // Kiểm tra hoàn thành cấp độ
    if (distance >= targetDistance) {
        victorySound.play();
        level++;
        speed++;
        targetDistance += 1000; // Tăng quãng đường cho cấp độ tiếp theo
        distance = 0;
    }

    // Vẽ đường
    for (let i = 1; i < lanes; i++) {
        ctx.beginPath();
        ctx.setLineDash([20, 20]);
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, canvas.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    // Vẽ xe của người chơi
    ctx.drawImage(carImage, carX, carY, carWidth, carHeight);

    // Hiển thị quãng đường đã đi và tốc độ
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.textAlign = 'left';

    ctx.strokeText(`Quãng đường: ${Math.floor(distance)} m`, 10, 30);
    ctx.fillText(`Quãng đường: ${Math.floor(distance)} m`, 10, 30);
    
    ctx.strokeText(`Tốc độ: ${speed} m/s`, 10, 60);
    ctx.fillText(`Tốc độ: ${speed} m/s`, 10, 60);
    
    ctx.strokeText(`Cấp độ: ${level}`, 10, 90);
    ctx.fillText(`Cấp độ: ${level}`, 10, 90);

    // Xử lý các xe khác và va chạm
    handleTraffic();

    // Yêu cầu khung hình tiếp theo
    requestAnimationFrame(updateGame);
}

function handleTraffic() {
    otherCars.forEach((car, index) => {
        car.y += speed;

        // Vẽ các xe khác
        ctx.drawImage(otherCarImage, car.x, car.y, carWidth, carHeight);

        // Kiểm tra va chạm
        if (
            carX < car.x + carWidth &&
            carX + carWidth > car.x &&
            carY < car.y + carHeight &&
            carY + carHeight > car.y
        ) {
            crashSound.play();
            gameOver = true; // Kích hoạt trạng thái trò chơi kết thúc
            ctx.font = '30px Arial';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over! Press Enter to Restart', canvas.width / 2, canvas.height / 2);
        }

        // Xóa xe ra khỏi mảng nếu nó đi qua màn hình
        if (car.y > canvas.height) {
            otherCars.splice(index, 1);
        }
    });

    // Xác suất tạo xe mới (tăng dần theo cấp độ)
    let spawnRate = 0.02 + (level - 1) * 0.001;
    if (Math.random() < spawnRate) {
        const lane = Math.floor(Math.random() * lanes);
        const x = lane * laneWidth + Math.random() * (laneWidth - carWidth);
        const y = -carHeight;
        otherCars.push({ x, y });
    }
}

function resetGame() {
    level = 1;
    speed = 2;
    distance = 0;
    targetDistance = 1000; // Quãng đường để hoàn thành cấp độ (m)
    carX = canvas.width / 2 - 25;
    carY = canvas.height - 100;
    otherCars = [];
    gameOver = false; // Đặt trạng thái trò chơi lại thành không kết thúc

    // Bắt đầu trò chơi lại
    updateGame();
}
