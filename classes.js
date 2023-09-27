
class Tile{ //extends HTMLElement{ //lets not poke the goat
    constructor(tile=null) {
        this.enemies = []
        // const hex = content.toString(16).padStart(2,"0")
        if(tile){
            this.elem = tile
        }else{
            this.elem = document.createElement("div")
            this.elem.classList.add("tile")
            this.elem.style.width = tilesize + "px"
            grid.insertAdjacentElement("beforeend", this.elem)
        }
        // this.elem.style.backgroundColor = "#" + hex + hex + hex
        // this.elem.style.backgroundColor = "hsl(${content}, 100%, 50%)"

        // this.elem.style.backgroundColor = "hsl(" + content + ", 100%, 50%)"
        // console.log(hex)
        // console.log(this.elem.style.backgroundColor)
        this.calculateCorners();

    }

    calculateCorners() {
        this.corners = [[this.getPos()[0], this.getPos()[1]], [this.getPos()[0] + tilesize, this.getPos()[1]], [this.getPos()[0], this.getPos()[1] + tilesize], [this.getPos()[0] + tilesize, this.getPos()[1] + tilesize]]
    }

    getPos(){return [this.elem.offsetLeft, this.elem.offsetTop]}
    getPosC(){return {x:this.elem.offsetLeft + parseInt(this.elem.style.width) / 2 ,y:this.elem.offsetTop + parseInt(this.elem.style.width) / 2}}

    getNeighbours(){
        const which =  tiles.indexOf(this)
        const neighbours = []
        for (let i = -1; i < 2; i++) {
            const [x,y] = divmod(which, size)
            if((x + i)<0 || (x + i)>=size){continue}
            for (let j = -1; j < 2; j++) {
                if(!(i||j)){continue}
                if((y + j)<0 || (y + j)>=size){continue}
                neighbours.push(tiles[((x+i)*size) + (y+j)])
            }
        }
        return neighbours
    }

    getCardinals(){
        const which =  tiles.indexOf(this)
        // if(debug){console.log(which)}
        const neighbours = []
        for (let i = -1; i < 2; i++) {
            const [x,y] = divmod(which, size)
            if((x + i)<0 || (x + i)>=size){continue}
            for (let j = -1; j < 2; j++) {
                if(!(Math.abs(i)^Math.abs(j))){continue}
                if((y + j)<0 || (y + j)>=size){continue}
                neighbours.push(tiles[((x+i)*size) + (y+j)])
            }
        }
        return neighbours
    }
}


class Stone extends Tile{
    constructor(tile) {
        super(tile);
        this.elem.classList.add("stone")
    }
}

class Path extends Tile {
    constructor(elem) {
        super(elem);
        this.enemies = []
        this.elem.classList.add("path")
        this.distFromEnd = 0
        this.elem.addEventListener("mouseup", event => {
            if (debug) {
                for (const road of this.getNeighbouringRoads()) {
                    road.elem.style.backgroundColor = "#aa0000"
                }
            }
            if (buildmode === "SPAWN") {
                new Alien(this);
            }
        })
    }

    getNeighbouringRoads() {
        return this.getCardinals().filter(x => {
            return x instanceof Path
        })
    }

    // findDistanceFromEnd() {
    //     this.visited = true
    //     if (this.distFromEnd) {
    //         if(debug){this.elem.innerText = "dist: " + this.distFromEnd}
    //         return this.distFromEnd
    //     }
    //
    //     const neighbours = this.getNeighbouringRoads()
    //     if (neighbours.length === 0) {
    //         this.distFromEnd = 0
    //         console.log("no neighbours")
    //         return 0
    //     }
    //     else if (neighbours.filter(x => {return x instanceof End}).length > 0) {
    //         this.distFromEnd = 1
    //         console.log("end found") //TODO probably not needed
    //     }
    //     else{
    //         // this.distFromEnd = Math.min(...neighbours.filter(x=>{return !x.visited}).map(x => {
    //         this.distFromEnd = Math.min(...neighbours.filter(x=>{return (x.distFromEnd > this.distFromEnd) || !x.visited}).map(x => {
    //             return x.findDistanceFromEnd()
    //         })) + 1
    //     }
    //     if(debug){this.elem.innerText = "dist: " + this.distFromEnd}
    //     return this.distFromEnd
    // }

    floodFill(distance=0) {
        const smaller = Math.min(distance, this.distFromEnd)
        if (smaller < this.distFromEnd) {
            this.distFromEnd = smaller
            if(debug){this.elem.innerText = "dist: " + this.distFromEnd}
        }
        else{
            return
        }
        const neighbours = this.getNeighbouringRoads();
        // if (neighbours.filter(x => {return x instanceof Spawn}).length > 0) {
        //     // return
        //     void 0;
        // }
        // else{
            for (const neighbour of neighbours) {
                neighbour.floodFill(distance+1)
            }
        }
    // }
}

class Buildable extends Tile{
    constructor() {
        super();
        this.tower = null;
        this.elem.classList.add("grass")
        this.elem.addEventListener("mouseup",event=>{
            if(buildmode === "DIG" && this.tower === null && !inWave){
                let newPath = new Path();
                newPath.num = this.num
                tiles[tiles.indexOf(this)] = newPath
                event.target.replaceWith(newPath.elem)
                newPath.calculateCorners()
                tiles.filter(tile=>tile instanceof Path).forEach(tile=>{
                    tile.distFromEnd = Infinity
                })
                goal.floodFill()
                if (spawn.distFromEnd!==Infinity && spawn.distFromEnd!=null){
                    console.log(spawn.distFromEnd)
                    document.getElementById("spawnbutton").disabled = false
                    document.getElementById("wavebutton").disabled = false
                }

                for (const tower of towers) {
                    tower.tilesReached = tower.calculateCircle(tower.x,tower.y,tower.radius)
                }
            }
            else if(buildmode === "BUILD"){
                const fontsize = "1.8vw"
                if(this.tower === null){
                    const tt = turretmap.get(TURRETTYPE)
                    const cost = turretcosts.get(TURRETTYPE);
                    if(gold >= cost){
                        this.tower = new tt(this)
                        towers.push(this.tower)
                        gold -= cost
                        redrawUI()
                    }
                    else{
                        floatText(`Not enough gold. ${cost-gold} needed.`, this.getPosC()["x"], this.getPosC()["y"], fontsize,2000)
                    }
                }else{
                    // this.tower.drawRadius(false)
                    // this.tower.elem.remove()
                    // towers.splice(towers.indexOf(this.tower),1)
                    // delete this.tower
                    floatText("Already a tower here", this.getPosC()["x"], this.getPosC()["y"], fontsize,2000)
                }
            }
        })
    }
}

class Spawn extends Path{
    constructor(tile) {
        const newTile = tile.cloneNode(true);
        tile.replaceWith(newTile);
        super(newTile);
        this.elem.classList = ["tile spawn"]
        this.distFromEnd = Infinity
    }
}

class End extends Path{
    constructor(tile) {
        const newTile = tile.cloneNode(true); //prevent cloning of event listeners and digging of end or spawn
        tile.replaceWith(newTile);
        super(newTile);
        this.elem.classList = ["tile end"]
        this.distFromEnd = 0
    }
}

class Enemy{
    constructor(spawnTile=spawn, maxhealth=100, speed=1, reward=5) {
        this.maxhealth = maxhealth
        this.health = this.maxhealth
        this.speed = speed
        this.reward = reward
        this.x = spawnTile.getPosC()["x"]
        this.y = spawnTile.getPosC()["y"]
        this.getTarget(spawnTile)

        this.elem = document.createElement("div")
        this.elem.classList.add("enemy")
        anchor.insertAdjacentElement("beforeend", this.elem);

        this.size ??= this.elem.offsetWidth
        this.hpbar = document.createElement("div")
        this.hpbar.classList.add("hpbar")
        this.hpbar.style.left = -this.elem.offsetWidth/2 + "px"
        this.hpbar.style.top = -this.elem.offsetHeight/2 + "px"
        this.elem.insertAdjacentElement("beforeend", this.hpbar);

        enemies.push(this)
        this.draw()

    }

    getTarget(currTile){
        if(currTile === goal){
            this.kill()
            lives -= 1
            redrawUI()
            return
        }
        const prevTile = this.currentTile

        this.x = currTile.getPosC()["x"]
        this.y = currTile.getPosC()["y"]
        if(this.currentTile !== undefined){ //TODO LOOK INTO THIS
            prevTile.enemies.splice(prevTile.enemies.indexOf(this),1)
            if(debug){
                prevTile.elem.innerText = prevTile.enemies.length
            }

        }
        this.currentTile = currTile;

        const possibleTiles = this.currentTile.getNeighbouringRoads().filter(x => {return x !== prevTile});
        if(possibleTiles.length === 0){
            this.targetTile = prevTile
        }
        else{
            this.targetTile = possibleTiles.reduce((a,b) => {return a.distFromEnd < b.distFromEnd ? a : b})
        }
        this.currentTile.enemies.push(this)
        // console.log(this.currentTile)
        if(debug){this.currentTile.elem.innerText = this.currentTile.enemies.length}

        this.target = this.targetTile.getPosC()
        this.xdir = Math.sign(this.target["x"] - this.x)
        this.ydir = Math.sign(this.target["y"] - this.y)

    }

    draw(){
        this.elem.style.left = this.x + "px"
        this.elem.style.top = this.y + "px"
        this.hpbar.style.width = (this.health / this.maxhealth) * 100 * 2 + "%"

    }
    update(){
        // move towards target
        if(this.health <= 0){
            gold += this.reward
            this.kill()
            new CoinPickup(this.x,this.y,this.reward,10000)
        }

        this.x += Math.round(this.xdir * this.speed * tilesize/50)
        this.y += Math.round(this.ydir * this.speed * tilesize/50)
        if (distance(this,this.targetTile.getPosC()) <= this.speed * tilesize/50){
            this.getTarget(this.targetTile)
        }
        this.draw()
    }

    kill() {
        this.elem.remove()
        enemies.splice(enemies.indexOf(this),1)
        this.currentTile.enemies.splice(this.currentTile.enemies.indexOf(this),1)
        this.targetTile.enemies.splice(this.targetTile.enemies.indexOf(this),1)
        delete this
        inWave = Boolean(enemies.length)

        redrawUI()

    }

    dmgNumbers(dmg){
        if(dmg < 5){return}
        floatText(dmg, this.x, this.y, 1 + dmg / 10000 + "vw");
    }
}

class Alien extends Enemy{
    constructor(tile=spawn) {
        super(tile, 100, 1, 5)
    }
}

class Tower {
    constructor(tile,dmg=50,cd=100,radius= 2, cost=100, charge=0) {
        this.tile = tile
        this.cost = cost
        this.x = tile.getPosC()["x"]
        this.y = tile.getPosC()["y"]
        this.charge = charge
        this.dmg = dmg
        this.cd = cd
        this.timer = 0
        this.radius = radius * tilesize
        this.turretsize = tilesize / 3;
        // gold -= this.cost //this would make autogenerated turrets remove money too

        this.radiuscircle = document.createElement("div")
        this.radiuscircle.classList.add("radiuscircle")
        this.tilesReached = this.calculateCircle(this.x,this.y,this.radius)

        // for (const tile of this.tilesReached) {
        //     tile.elem.style.backgroundColor = "#aa0000"

        // }

        this.elem = document.createElement("div") //placeholder
    }

    drawRadius(state){
        if(state){
            anchor.insertAdjacentElement("beforeend", this.radiuscircle)
        }
        else{
            this.radiuscircle.remove()
        }

    }

    calculateCircle(x, y, radius) {
        this.radiuscircle.style.width = radius*2 + "px"
        this.radiuscircle.style.height = radius*2 + "px"
        this.radiuscircle.style.left = x - radius + "px"
        this.radiuscircle.style.top = y - radius + "px"
        this.radiuscircle.style.borderRadius = radius + "px"

        const reached = []
        for (const tile of tiles) {
            //if any corner of a tile is inside the circle, the tile is inside the circle
            for (const corner of tile.corners) {
                if(Math.sqrt((corner[0]-x)**2 + (corner[1]-y)**2) <= radius){
                    reached.push(tile)
                    break
                }
            }
        }
        return reached
    }

    inRadius(enemy) {
        return Math.sqrt((enemy.x-this.x)**2 + (enemy.y-this.y)**2) <= this.radius
    }

    draw(){
        this.elem.style.left = this.x - this.elem.offsetWidth/4 + "px"
        this.elem.style.top = this.y - this.elem.offsetHeight/4 + "px"
        if (buildmode === "BUILD"){
            this.drawRadius(true)
        }
    }

    update(){
        if(debug){
            this.elem.innerText = this.timer
        }
    }
    attack(enemy){
        enemy.health -= this.dmg
        enemy.dmgNumbers(this.dmg)
    }
}

class Gatling extends Tower {

    // static getCost() {
    //     return 150;
    // }
    constructor(tile) {
        // super(tile, 10, 20, 2, Gatling.getCost(), 0)
        super(tile, 10, 20, 2, 100, 0)

        this.elem = document.createElement("div")
        this.elem.classList.add("tower")
        this.elem.style.width = this.turretsize + "px"
        this.elem.style.height = this.turretsize + "px"
        this.elem.style.borderRadius = this.turretsize + "px"

        this.cannonelem = document.createElement("div");
        this.cannonelem.classList.add("cannon")
        this.cannonelem.style.width = this.turretsize + "px"
        this.cannonelem.style.height = this.turretsize/8 + "px"

        this.elem.insertAdjacentElement("beforeend", this.cannonelem)
        anchor.insertAdjacentElement("beforeend", this.elem);
        this.draw()
    }

    update(){
        super.update()

        if(this.timer){
            this.timer -= 1
        }
        if(enemies.length === 0){return}
        const reachableEnemies = this.tilesReached.flatMap(tile => {return tile.enemies})
        if(reachableEnemies.length === 0){return}

        for (const enemy of reachableEnemies) {
            if(Math.sqrt((enemy.x-this.x)**2 + (enemy.y-this.y)**2) <= this.radius){
                facing(this.elem, enemy.x + enemy.size/2, enemy.y + enemy.size/2,-90) //TODO: probable optimization here, only do when shooting?
                if(this.timer === 0){
                    this.attack(enemy)
                }
                break
            }
        }
        // this.draw()
    }


    attack(enemy) {
        super.attack(enemy)
        const pew = new Audio('sounds/ptoo.mp3');
        pew.currentTime = 1;
        pew.play()
        this.cannonelem.classList.remove("cannonpow")
        void this.elem.offsetWidth
        this.cannonelem.classList.add("cannonpow")
        this.timer = this.cd
    }
}

class Tesla extends Tower{
    constructor(tile) {

        super(tile, 25, 100, 2, 250, 0)
        this.maxtargets = 5

        this.elem = document.createElement("div")
        this.elem.classList.add("tesla")
        this.elem.style.width = this.turretsize + "px"
        this.elem.style.height = this.turretsize + "px"
        this.elem.style.borderRadius = this.turretsize + "px"

        anchor.insertAdjacentElement("beforeend", this.elem);
        this.draw()

    }

    update(){
        super.update()
        if(this.timer){this.timer -= 1} //TODO put this into the super class
        if(enemies.length === 0){return}

        // const reachableEnemies = new Set(this.tilesReached.flatMap(tile => {return tile.enemies}))
        const reachableEnemies = this.tilesReached.flatMap(tile => {return tile.enemies})
        if(reachableEnemies.length === 0){return}

        if(this.timer === 0){
            // for (const enemy of reachableEnemies) {
            for (let i = 0; i < this.maxtargets && i < reachableEnemies.length; i++) {
                // const enemy = Array.from(reachableEnemies)[0] //TODO this is bad i should probably not put enemies in two tiles at once
                const enemy = reachableEnemies[i] //TODO this is bad i should probably not put enemies in two tiles at once
                if (this.inRadius(enemy)){
                    this.attack(enemy)
                }
            }
            this.timer = this.cd
        }


        // this.draw()
    }

    attack(enemy) {
        super.attack(enemy)
        const zap = new Audio('sounds/zap.mp3');
        zap.currentTime = 0.5;
        zap.play()
        const lightning = document.createElement("div")
        const length = distance(enemy,this)

        lightning.classList = ["lightning"]
        lightning.style.left = this.x +"px"
        lightning.style.top = this.y + "px"
        lightning.style.width = "0.2vw"
        lightning.style.transformOrigin = "50% 0%"
        lightning.style.height = length + "px"
        anchor.insertAdjacentElement("beforeend", lightning)
        facing(lightning, enemy.x + enemy.size/2, enemy.y + enemy.size/2, 90)

        $(".lightning").fadeOut(1000, function(){
            $(this).remove();
        })

    }
}

class Cannon extends Tower {
    constructor(tile) {
        super(tile, 100, 200, 3, 500, 0)

        this.elem = document.createElement("div")
        this.elem.classList.add("tower")
        this.elem.style.width = this.turretsize*1.5 + "px"
        this.elem.style.height = this.turretsize*1.5 + "px"
        this.elem.style.borderRadius = this.turretsize*1.5 + "px"

        this.cannonelem = document.createElement("div");
        this.cannonelem.classList.add("cannon")
        this.cannonelem.style.width = this.turretsize*1.5 + "px"
        this.cannonelem.style.height = this.turretsize/3 + "px"

        this.elem.insertAdjacentElement("beforeend", this.cannonelem)
        anchor.insertAdjacentElement("beforeend", this.elem);
        this.draw()
    }

    update(){
        super.update()
        if(this.timer){
            this.timer -= 1
        }
        if(enemies.length === 0){return}
        const reachableEnemies = this.tilesReached.flatMap(tile => {return tile.enemies})
        if(reachableEnemies.length === 0){return}

        for (const enemy of reachableEnemies) {
            if(Math.sqrt((enemy.x-this.x)**2 + (enemy.y-this.y)**2) <= this.radius){
                facing(this.elem, enemy.x, enemy.y,-90) //TODO: probable optimization here, only do when shooting?
                if(this.timer === 0){
                    this.attack(enemy)
                }
                break
            }
        }
        // this.draw()
    }


    attack(enemy) {
        super.attack(enemy)
        const boom = new Audio('sounds/boom.mp3');
        boom.currentTime = 1;
        boom.play()
        this.cannonelem.classList.remove("cannonpow")
        void this.elem.offsetWidth
        this.cannonelem.classList.add("cannonpow")
        this.timer = this.cd
    }
}

class Laser extends Tower {
    constructor(tile) {
        super(tile, 1, 2, 2, 250, 0)

        this.elem = document.createElement("div")
        this.elem.classList.add("tower")
        this.elem.backgroundColor = "#571313"
        this.elem.style.width = this.turretsize + "px"
        this.elem.style.height = this.turretsize + "px"
        this.elem.style.borderRadius = this.turretsize + "px"

        this.cannonelem = document.createElement("div");
        this.cannonelem.classList.add("cannon")
        this.cannonelem.style.width = this.turretsize + "px"
        this.cannonelem.style.height = this.turretsize/3 + "px"

        this.elem.insertAdjacentElement("beforeend", this.cannonelem)
        anchor.insertAdjacentElement("beforeend", this.elem);
        this.draw()
    }

    update(){
        super.update()
        if(this.timer){
            this.timer -= 1
        }
        if(enemies.length === 0){return}
        const reachableEnemies = this.tilesReached.flatMap(tile => {return tile.enemies})
        if(reachableEnemies.length === 0){return}

        for (const enemy of reachableEnemies) {
            if(Math.sqrt((enemy.x-this.x)**2 + (enemy.y-this.y)**2) <= this.radius){
                facing(this.elem, enemy.x, enemy.y,-90) //TODO: probable optimization here, only do when shooting?
                if(this.timer === 0){
                    this.attack(enemy)
                    this.timer = this.cd;
                }
                break
            }
        }
        // this.draw()
    }


    attack(enemy) {
        super.attack(enemy)
        const beam = document.createElement("div")
        const length = distance(enemy,this)
        const laser = new Audio('sounds/laser.mp3');
        laser.currentTime = 1;
        laser.play()

        beam.classList = ["lightning"]
        beam.style.backgroundColor = "#c02c2c"
        beam.style.left = this.x +"px"
        beam.style.top = this.y + "px"
        beam.style.width = "0.2vw"
        beam.style.transformOrigin = "50% 0%"
        beam.style.height = length + "px"
        anchor.insertAdjacentElement("beforebegin", beam)
        facing(beam, enemy.x + enemy.size/2, enemy.y + enemy.size/2, 90)

        $(".lightning").fadeOut(10, function(){
            $(this).remove();
        })
    }
}

class CoinPickup{
    constructor(x,y,value,timeout) {
        this.x = x;
        this.y =y;
        this.value = value;
        this.timeout = timeout;

        this.elem = document.createElement("div")
        this.elem.myparent = this
        this.elem.classList = ["coinpickup drop"]

        const dropradius = 50
        this.elem.style.setProperty("--xpos",(Math.random()*dropradius-dropradius/2) + "px")
        this.elem.style.setProperty("--ypos",(Math.random()*dropradius-dropradius/2) + "px")

        grid.insertAdjacentElement("beforebegin", this.elem);
        this.draw()

        this.elem.addEventListener("mouseenter", event=>{
            gold += this.value
            redrawUI()
            $(this.elem).stop().animate({opacity:'0'});
            $(this.elem).fadeOut(300, function (elem) {
                // $(this).remove();
                // console.log($(this))
                $(this)[0].myparent.kill();
                // $(this).kill();

            })
            this.elem.classList.add("pickup")
        })
        $(this.elem).fadeOut(this.timeout, function () {
            $(this)[0].myparent.kill();
        })
    }

    kill(){
        this.elem.remove()
        delete this
    }

    draw(){
        this.elem.style.left = this.x + "px"
        this.elem.style.top = this.y + "px"
    }
}