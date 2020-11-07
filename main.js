const canvas = document.querySelector('canvas'); 
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');



class Player {   //задаю свойства игроку
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {  //рисую игрока
        c.beginPath();
        c.arc(this.x, this.y, this.radius,0, Math.PI * 2, false);
        c.fillStyle = this.color; 
        c.fill();
    }
}

class Projectitle { //рисую снаряды
    constructor (x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {  //рисую снаряды
        c.beginPath();
        c.arc(this.x, this.y, this.radius,0, Math.PI * 2, false);
        c.fillStyle = this.color; 
        c.fill();
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}

class Enemy { //рисую врагов
    constructor (x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {  //рисую врага
        c.beginPath();
        c.arc(this.x, this.y, this.radius,0, Math.PI * 2, false);
        c.fillStyle = this.color; 
        c.fill();
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;

    }
}


const friction = 0.99
class Particle { //рисую частицы
    constructor (x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1
    }
    draw() {  //рисую частицы
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius,0, Math.PI * 2, false);
        c.fillStyle = this.color; 
        c.fill();
        c.restore();
    }

    update(){
        this.draw()
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;

    }
}

const x = canvas.width/2;  //располагаю игрока в центре
const y = canvas.height/2;

let player = new Player(x, y, 10, 'white');  //создаю игрока
let projectitles = [];   
let enemies = [];
let particles = [];


function init() {
    player = new Player(x, y, 10, 'white');  //создаю игрока
    projectitles = [];   
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;

};

function spawnEnemies(){ //спавним врагов
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;

        let x;
        let y;

        if (Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random()*360}, 50%, 50%)`;
        const angle = Math.atan2(
        canvas.height / 2 - y,
        canvas.width / 2 - x) 

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000 );
}

let animationId;
let score = 0;
function animate(){
    animationId = requestAnimationFrame(animate); //зацикливание анимации
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0,0,canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0 ){
            particles.splice(index, 1)
        } else{
            particle.update();
        }
    })
    projectitles.forEach((projectitle, index) => {
        projectitle.update();

        //убрать с краёв экрана
        if(projectitle.x + projectitle.radius < 0 || projectitle.x - projectitle.radius > canvas.width || projectitle.y + projectitle.radius < 0 || projectitle.y - projectitle.radius > canvas.height) {
            setTimeout(() => {
                projectitles.splice(index, 1);
            }, 0) 
        }
        })
    enemies.forEach((enemy, index) => {
        enemy.update();
        //конец игры    
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y );
        if (dist - enemy.radius - player.radius < 1) {            
            const audio = new Audio('./sound/gameOver.mp3');
            audio.play();
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScoreEl.innerHTML = score;
            lockGet(randPass);
        }
        projectitles.forEach((projectitle, projectitleIndex) => {
            const dist = Math.hypot(projectitle.x - enemy.x, projectitle.y - enemy.y );
        if (dist - enemy.radius - projectitle.radius < 1) {
            //создаю взрыв
            for (let i = 0; i < enemy.radius * 2; i++){
                particles.push(
                    new Particle(
                        projectitle.x,
                        projectitle.y, 
                        Math.random()*2,
                        enemy.color, 
                        {
                            x: (Math.random() - 0.5) * (Math.random() *6), 
                            y: (Math.random() - 0.5) * (Math.random() *6)
                        }
                    ))
            }

            const audio = new Audio('./sound/hittarget.mp3');
            audio.play();
            if (enemy.radius - 10 > 10) {
                //счёт
                score += 100;
                scoreEl.innerHTML = score;

                gsap.to(enemy, {
                    radius: enemy.radius - 10
                })
                enemy.radius -= 10;
                setTimeout(() => {
                    projectitles.splice(projectitleIndex, 1);
            }, 0) 
            } else{
            //счёт ближе к центру
            score += 250;
            scoreEl.innerHTML = score;

            setTimeout(() => {
                enemies.splice(index, 1);
                projectitles.splice(projectitleIndex, 1);
            }, 0)  
           }
        }
        })
    })
}

function nick(){
    nickname = document.querySelector(".nickname").value;
    if (nickname == "") nickname = "user";
};

document.addEventListener('click', (event) => { //создаю снаряд
    const audio = new Audio('./sound/shoot.mp3');
    audio.play();
    const angle = Math.atan2(//находим угол клика мыши от центра холста
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2) 

    const velocity = {
        x: Math.cos(angle) * 4,
        y: Math.sin(angle) * 4
    }

    projectitles.push(new Projectitle( // каждый клик вставляет новый снаряд в массиве
        canvas.width / 2, canvas.height / 2, 5, 'white', velocity
    ))
});

if (tableNone) {

    scoreTable.style.display = "none";
    scoreTableHeight = scoreTable.offsetHeight;
    scoreTableWidth = scoreTable.offsetWidth;
    
    tableNone = false;
    tableScore();
}
    
else {
    tableNone = true;
    tableScore();
 }
startGameBtn.addEventListener('click', () => {        
        nick();
        init();
        animate();
        spawnEnemies();
        modalEl.style.display = 'none';
    })

