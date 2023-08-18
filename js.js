const size = 15
const turrettypes = [Gatling, Tesla, Cannon, Laser]
const anchor = document.getElementById("anchor")
const grid = document.getElementById("grid")
const w = window.innerWidth
const h = window.innerHeight
const tiles = [];
const enemies = [];
const towers = [];
let debug = false;
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
        let newElem;
        if (random < 0.15 && i !== 0 && j !== size-1 && i !== size-1 && j !== 0){
            newElem = new Stone()
            tiles.push(newElem)
        }
        else{
            newElem = new Buildable()
            tiles.push(newElem)
        }
        newElem.num = num
        // tiles[tiles.length-1].push(newElem)
    }
}


const chosen = choice(tiles.filter(tile=>tile instanceof Buildable));
chosen.tower = new Laser(chosen)
towers.push(chosen.tower)

// const spawn = new Spawn()
const edges = tiles.filter(tile=>tile.num < size || tile.num > size*(size-1) || tile.num % size === 0 || tile.num % size === size-1)
console.log(edges.map(tile=>tile.num))
let spawn = choice(edges)
spawn = new Spawn(spawn.elem)



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

document.getElementById("debugbutton").addEventListener("mouseup",event=>{
    debug = !debug
    for (const tower of towers) {
        tower.drawRadius(true);
    }
    for (const tile of tiles) {
        tile.elem.innerText = tile.num
    }
})


turretsel = document.getElementById("turrettype")
const turretmap =  new Map(turrettypes.map( item => [item.name, item])); //map of wall class names to wall classes
console.log(turretmap)
turretmap.forEach((v,k)=>{ //why are k,v flipped?
    const opt = document.createElement("option");
    opt.value = k;
    console.log(k, v.name)
    opt.innerHTML = v.name
    turretsel.appendChild(opt); //add each wall type to the wall type selector
})
let TURRETTYPE = turretsel.value;
console.log(typeof TURRETTYPE)
console.log(TURRETTYPE)

turretsel.addEventListener("change", function(event) {
    TURRETTYPE = event.target.value;
})


window.onmousemove = function(event){
    document.getElementById("coords").innerText = "x: " + event.clientX + ",y: " + event.clientY
}

setInterval(main,1000/60)