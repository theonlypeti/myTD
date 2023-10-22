const size = 12
let lives = 20
let gold = 500
const w = window.innerWidth
const h = window.innerHeight
let sound = true
const tilesize = Math.min(w / size, h / size)
const grid = document.getElementById("grid")
const anchor = document.getElementById("anchor")

const tiles = [];
const enemies = [];
const towers = [];

let inWave = false;
let debug = false;
document.getElementById("coords").style.color = "white"

const buildmodes = ["DIG","BUILD","SPAWN","BLOCK"]
let buildmode = buildmodes[0]

const turrettypes = [Gatling, Tesla, Cannon, Laser]
turretcosts = new Map(turrettypes.map( item => [item.name, new item(new Tile()).cost])); //map of wall class names to wall classes
console.log(turretcosts)

tiles.length = 0;
towers.length = 0
grid.innerHTML = ""
anchor.innerHTML = ""


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
chosen.tower = new Gatling(chosen)
towers.push(chosen.tower)

const edges = tiles.filter(tile=>tile.num < size || tile.num > size*(size-1) || tile.num % size === 0 || tile.num % size === size-1)
let spawn = choice(edges)


//make sure the goal isn't next to the spawn
const edges2 = edges.filter(tile=>tile.num !== spawn.num && tile.num !== spawn.num+1 && tile.num !== spawn.num-1 && tile.num !== spawn.num+size && tile.num !== spawn.num-size)
console.log("end cannot be " + edges.filter(tile=>!edges2.includes(tile)).map(tile=>tile.num))

let goal = choice(edges2)
let which = tiles.indexOf(spawn)

spawn = new Spawn(spawn.elem)
tiles[which] = spawn //TODO do this better

which = tiles.indexOf(goal)
goal = new End(goal.elem)
tiles[which] = goal //TODO do this better
console.log(goal.constructor.name)
console.log(spawn.constructor.name)
console.log(goal instanceof Buildable)

redrawUI()
function redrawUI(){
    document.getElementById("wavebutton").disabled = inWave || spawn.distFromEnd==null || spawn.distFromEnd === Infinity
    document.getElementById("spawnbutton").disabled = inWave || spawn.distFromEnd==null || spawn.distFromEnd === Infinity
    document.getElementById("buildbutton").disabled = inWave
    document.getElementById("digbutton").disabled = inWave
    document.getElementById("money").innerText = gold
    document.getElementById("lives").innerText = lives
}



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

document.getElementById("roadblockbuild").addEventListener("mouseup",event=>{
    buildmode = buildmodes[3]
    for (const tower of towers) {
        tower.drawRadius(false);
    }
})

document.getElementById("coinspawn").addEventListener("mouseup",event=>{
    const tile = choice(tiles);
    const {x,y} = tile.getPosC()
    let coin = new CoinPickup(x,y,1,10000)
    coin.elem.style.setProperty("--xpos",Math.round(Math.random()*50-25) + "px")
    coin.elem.style.setProperty("--ypos",Math.random()*50-25 + "px")
    console.log(coin.elem.style.getPropertyValue("--xpos"))
    coin.elem.classList.add("drop")
    console.log(coin)

})

document.getElementById("spawnbutton").addEventListener("mouseup",event=>{
    buildmode = buildmodes[2]
    new Alien()
    for (const tower of towers) {
        tower.drawRadius(false);
    }
    redrawUI()
})

function spawnerfunc(howmany=10){
    counter += 1
    new Alien()
    // new Enemy(spawn)
    if(counter >= howmany){
        counter = 0
        clearInterval(spawner)
    }
}

let counter = 0
let wavenumber = 1
let spawner = undefined

document.getElementById("wavebutton").addEventListener("mouseup",event=>{
    clearInterval(spawner)
    inWave = true
    spawner = setInterval(spawnerfunc,500, wavenumber*2)
    wavenumber += 1
    for (const tower of towers) {
        tower.drawRadius(false);
    }
    redrawUI()
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

document.getElementById("soundtoggle").addEventListener("mouseup",event=>{
    sound = !sound
    event.target.innerText = sound ? "Sound: On" : "Sound: Off"
})


turretsel = document.getElementById("turrettype")
const turretmap =  new Map(turrettypes.map( item => [item.name, item])); //map of wall class names to wall classes
turretmap.forEach((v,k)=>{ //why are k,v flipped?
    const opt = document.createElement("option"); //TODO hold on i am just doing i.name = i.name
    opt.value = k;
    opt.innerHTML = v.name;
    turretsel.appendChild(opt); //add each wall type to the wall type selector
})
let TURRETTYPE = turretsel.value;

turretsel.addEventListener("change", function(event) {
    TURRETTYPE = event.target.value;
})


window.onmousemove = function(event){
    document.getElementById("coords").innerText = "x: " + event.clientX + ",y: " + event.clientY
}

setInterval(main,1000/60)


