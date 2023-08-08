const size = 10
const anchor = document.getElementById("anchor")
const grid = document.getElementById("grid")
const w = window.innerWidth
const h = window.innerHeight
const tiles = [];
const enemies = [];
const towers = [];

const tilesize = Math.min(w / size, h / size)
grid.style.gridTemplateColumns = "repeat(" + size + ", auto)"
for (let i = 0; i < size; i++) {
    // tiles.push([])
    for (let j = 0; j < size; j++) {
        const num = (i*size)+j
        const newElem = new Buildable(num)
        // tiles[tiles.length-1].push(newElem)
        tiles.push(newElem)
    }
}


const chosen = choice(tiles);
chosen.tower = new Tower(chosen)
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

setInterval(main,1000/60)