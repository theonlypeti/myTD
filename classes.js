class Tile{ //extends HTMLElement{ //lets not poke the goat
    constructor() {
        this.enemies = []
        // const hex = content.toString(16).padStart(2,"0")
        this.elem = document.createElement("div");
        // this.elem.style.backgroundColor = "#" + hex + hex + hex
        // this.elem.style.backgroundColor = "hsl(${content}, 100%, 50%)"
        // this.elem.style.backgroundColor = "hsl(" + content + ", 100%, 50%)"

        // console.log(hex)
        // console.log(this.elem.style.backgroundColor)
        this.elem.classList.add("tile")
        this.elem.style.width = tilesize + "px"
        grid.insertAdjacentElement("beforeend", this.elem)
        this.calculateCorners();

    }

    calculateCorners() {
        this.corners = [[this.getPos()[0], this.getPos()[1]], [this.getPos()[0] + tilesize, this.getPos()[1]], [this.getPos()[0], this.getPos()[1] + tilesize], [this.getPos()[0] + tilesize, this.getPos()[1] + tilesize]]
    }

    getPos(){return [this.elem.offsetLeft, this.elem.offsetTop]}
    getPosC(){return [this.elem.offsetLeft + parseInt(this.elem.style.width) / 2 , this.elem.offsetTop + parseInt(this.elem.style.width) / 2]}

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
    constructor() {
        super();
        this.elem.classList.add("stone")
    }
}

class Path extends Tile {
    constructor() {
        super();
        this.enemies = []
        this.elem.classList.add("path")
        this.elem.addEventListener("mouseup",event=>{
            // for (const road of this.getNeighbouringRoads()) {
            //     road.elem.style.backgroundColor = "#aa0000"
            // }
            if(buildmode === "SPAWN"){
                new Enemy(this);
            }
        })
    }

    getNeighbouringRoads(){
        return this.getCardinals().filter(x=>{return x instanceof Path})
    }



}

class Buildable extends Tile{
    constructor() {
        super();
        this.tower = null;
        this.elem.classList.add("grass")
        this.elem.addEventListener("mouseup",event=>{
            if(buildmode === "DIG"){
                let newPath = new Path();
                tiles[tiles.indexOf(this)] = newPath
                event.target.replaceWith(newPath.elem)
                newPath.calculateCorners()
                for (const tower of towers) {
                    tower.tilesReached = tower.calculateCircle(tower.x,tower.y,tower.radius)
                    console.log(tower.tilesReached)
                }
            }
            else if(buildmode === "BUILD"){
                if(this.tower === null){
                    this.tower = new Tesla(this)
                    towers.push(this.tower)
                }
            }
        })
    }
}

class Enemy{
    constructor(spawnTile) {
        this.maxhealth = 100
        this.health = this.maxhealth
        this.speed = 1.5
        this.x = spawnTile.getPosC()[0]
        this.y = spawnTile.getPosC()[1]
        this.getTarget(spawnTile)
        spawnTile.enemies.push(this)

        this.elem = document.createElement("div")
        this.elem.classList.add("enemy")
        anchor.insertAdjacentElement("beforeend", this.elem);

        this.hpbar = document.createElement("div")
        this.hpbar.classList.add("hpbar")
        this.hpbar.style.left = -this.elem.offsetWidth/2 + "px"
        this.hpbar.style.top = -this.elem.offsetHeight/2 + "px"
        this.elem.insertAdjacentElement("beforeend", this.hpbar);

        enemies.push(this)
        this.draw()

    }

    getTarget(currTile){
        const prevTile = this.currentTile
        this.x = currTile.getPosC()[0]
        this.y = currTile.getPosC()[1]
        if(this.currentTile !== undefined){
            prevTile.enemies.splice(prevTile.enemies.indexOf(this),1)
            // prevTile.elem.innerText = prevTile.enemies.length
        }
        this.currentTile = currTile;

        const possibleTiles = this.currentTile.getNeighbouringRoads().filter(x => {return x !== prevTile});
        if(possibleTiles.length === 0){
            this.targetTile = prevTile
        }
        else{
            this.targetTile = choice(possibleTiles);
        }
        this.targetTile.enemies.push(this)
        // this.targetTile.elem.innerText = this.targetTile.enemies.length
        this.target = this.targetTile.getPosC()

    }

    draw(){
        this.elem.style.left = this.x + "px"
        this.elem.style.top = this.y + "px"
        this.hpbar.style.width = (this.health / this.maxhealth) * 100 * 2 + "%"

    }
    update(){
        // move towards target
        if(this.health <= 0){
            this.kill()
            return
        }

        this.x += Math.round(Math.sign(this.target[0] - this.x) * this.speed * w/1000)
        this.y += Math.round(Math.sign(this.target[1] - this.y) * this.speed * w/1000)
        if (Math.abs(this.x - this.target[0])<this.speed && Math.abs(this.y - this.target[1])<this.speed){
            this.getTarget(this.targetTile)
        }
        this.draw()
    }

    kill() {
        this.elem.remove()
        enemies.splice(enemies.indexOf(this),1)
        this.currentTile.enemies.splice(this.currentTile.enemies.indexOf(this),1)
        this.targetTile.enemies.splice(this.targetTile.enemies.indexOf(this),1)
    }
}

class Tower {
    constructor(tile,dmg=50,cd=100,radius= 2, cost=100, charge=0) {
        this.tile = tile
        this.x = tile.getPosC()[0]
        this.y = tile.getPosC()[1]
        this.cost = cost
        this.charge = charge
        this.dmg = dmg
        this.cd = cd
        this.timer = 0
        this.radius = radius * tilesize
        this.turretsize = tilesize / 3;

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

    draw(){
        this.elem.style.left = this.x - this.elem.offsetWidth/4 + "px"
        this.elem.style.top = this.y - this.elem.offsetHeight/4 + "px"
        if (buildmode === "BUILD"){
            this.drawRadius(true)
        }
    }

    update(){}
    attack(){}
}

class Gatling extends Tower {
    constructor(tile) {
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
        if(this.timer){
            this.timer -= 1
        }
        if(enemies.length === 0){return}
        const reachableEnemies = this.tilesReached.flatMap(tile => {return tile.enemies})
        if(reachableEnemies.length === 0){return}

        for (const enemy of reachableEnemies) {
            if(Math.sqrt((enemy.x-this.x)**2 + (enemy.y-this.y)**2) <= this.radius){
                facing(this.elem, enemies[0].x, enemies[0].y,-90) //TODO: probable optimization here
                if(this.timer === 0){
                    this.attack(enemy)
                }
                break
            }
        }
        // this.draw()
    }


    attack(enemy) {
        enemy.health -= this.dmg
        this.cannonelem.classList.remove("cannonpow")
        void this.elem.offsetWidth
        this.cannonelem.classList.add("cannonpow")
        this.timer = this.cd
    }
}

class Tesla extends Tower{
    constructor(tile) {
        super(tile, 25, 100, 2, 250, 0)

        this.elem = document.createElement("div")
        this.elem.classList.add("tesla")
        this.elem.style.width = this.turretsize + "px"
        this.elem.style.height = this.turretsize + "px"
        this.elem.style.borderRadius = this.turretsize + "px"

        anchor.insertAdjacentElement("beforeend", this.elem);
        this.draw()

    }

    update(){
        if(this.timer){
            this.timer -= 1 //TODO put this into the super class
        }
        if(enemies.length === 0){return}
        const reachableEnemies = this.tilesReached.flatMap(tile => {return tile.enemies})
        if(reachableEnemies.length === 0){return}

        if(this.timer === 0){
            for (const enemy of reachableEnemies) { //TODO extract into helper func?
                if(Math.sqrt((enemy.x-this.x)**2 + (enemy.y-this.y)**2) <= this.radius){
                    this.attack(enemy)
                }
            }
            this.timer = this.cd //TODO put this into the super class
        }
        this.elem.innerText = this.timer
        // this.draw()
    }

    attack(enemy) {
        enemy.health -= this.dmg
        const lightning = document.createElement("div")
        const length = Math.sqrt((enemy.x-this.x)**2 + (enemy.y-this.y)**2);

        lightning.classList.add("lightning")
        lightning.style.left = this.x +"px"
        lightning.style.top = this.y + "px"
        lightning.style.width = "0.2vw"
        lightning.style.transformOrigin = "50% 0%"
        lightning.style.height = length + "px"
        anchor.insertAdjacentElement("beforeend", lightning)
        facing(lightning, enemy.x, enemy.y, 90)

        $(".lightning").fadeOut(1000, function(){
            $(this).remove();
        })

    }
}