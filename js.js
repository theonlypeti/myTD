const size = 12
const anchor = document.getElementById("anchor")
const grid = document.getElementById("grid")
const w = window.innerWidth
const h = window.innerHeight
const tiles = [];
const enemies = [];
const towers = [];
document.getElementById("coords").style.color = "white"

const buildmodes = ["DIG","BUILD","SPAWN"]
let buildmode = buildmodes[0]

const tilesize = Math.min(w / size, h / size)
grid.style.gridTemplateColumns = "repeat(" + size + ", auto)"
for (let i = 0; i < size; i++) {
    // tiles.push([])
    for (let j = 0; j < size; j++) {
        const num = (i*size)+j
        const random = Math.random()
        if (random < 0.1){
            const newElem = new Stone() //TODO make sure doesnt spawn on edges
            tiles.push(newElem)
        }
        else{
            const newElem = new Buildable()
            tiles.push(newElem)
        }
        // tiles[tiles.length-1].push(newElem)
    }
}


const chosen = choice(tiles);
chosen.tower = new Gatling(chosen)
towers.push(chosen.tower)

// const divmod = (x, y) => [Math.floor(x / y), x % y];

function main(){
    for (const enemy of enemies) {
        enemy.update()
    }

    for (const tower of towers) {
        tower.update()
    }


    // requestAnimationFrame(main)
}

document.getElementById("digbutton").addEventListener("mouseup",event=>{
    buildmode = buildmodes[0]
    for (const tower of towers) {
        tower.drawRadius(false);
    }
})

document.getElementById("buildbutton").addEventListener("mouseup",event=>{
    buildmode = buildmodes[1]
    for (const tower of towers) {
        tower.drawRadius(true);
    }
})

document.getElementById("spawnbutton").addEventListener("mouseup",event=>{
    buildmode = buildmodes[2]
    for (const tower of towers) {
        tower.drawRadius(false);
    }
})

window.onmousemove = function(event){
    document.getElementById("coords").innerText = "x: " + event.clientX + ",y: " + event.clientY
}

setInterval(main,1000/60)