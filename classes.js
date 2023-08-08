class Tile{ //extends HTMLElement{ //lets not poke the goat
    constructor() {
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
    }

    getPos(){return [this.elem.offsetLeft, this.elem.offsetLeft]}
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

class Path extends Tile {
    constructor() {
        super();
        this.elem.classList.add("path")
        this.elem.addEventListener("mouseup",event=>{
            // for (const road of this.getNeighbouringRoads()) {
            //     road.elem.style.backgroundColor = "#aa0000"
            // }

            new Enemy(this);
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
            let newPath = new Path();
            tiles[tiles.indexOf(this)] = newPath
            event.target.replaceWith(newPath.elem)
        })
    }
}

class Enemy{
    constructor(spawnTile) {
        this.maxhealth = 100
        this.health = this.maxhealth
        this.speed = 1
        this.x = spawnTile.getPosC()[0]
        this.y = spawnTile.getPosC()[1]
        this.getTarget(spawnTile)

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

    getTarget(nextTo){
        const prevTile = this.currentTile
        this.currentTile = nextTo;

        const possibleTiles = this.currentTile.getNeighbouringRoads().filter(x => {return x !== prevTile});
        if(possibleTiles.length === 0){
            this.targetTile = prevTile
        }
        else{
            this.targetTile = choice(possibleTiles);
        }
        this.target = this.targetTile.getPosC()
    }

    draw(){
        this.elem.style.left = this.x + "px"
        this.elem.style.top = this.y + "px"

    }
    update(){
        // move towards target
        if(this.health <= 0){
            this.kill()
            return
        }
        this.hpbar.style.width = (this.health / this.maxhealth) * 100 * 2 + "%"
        this.x += Math.sign(this.target[0] - this.x) * this.speed
        this.y += Math.sign(this.target[1] - this.y) * this.speed
        if (this.x === this.target[0] && this.y === this.target[1]){
            this.getTarget(this.targetTile)
        }
        this.draw()
    }

    kill() {
        this.elem.remove()
        enemies.splice(enemies.indexOf(this),1)
    }
}

class Tower {
    constructor(tile) {
        this.tile = tile
        this.x = tile.getPosC()[0]
        this.y = tile.getPosC()[1]
        this.dmg = 50
        this.cd = 100
        this.timer = 0

        this.elem = document.createElement("div")
        this.elem.classList.add("tower")

        const turretsize = tilesize / 3;
        this.elem.style.width = turretsize + "px"
        this.elem.style.height = turretsize + "px"
        this.elem.style.borderRadius = turretsize + "px"

        const cannon = document.createElement("div");
        cannon.classList.add("cannon")
        this.elem.insertAdjacentElement("beforeend", cannon)
        cannon.style.width = turretsize + "px"
        cannon.style.height = turretsize/8 + "px"
        this.cannonelem = cannon
        anchor.insertAdjacentElement("beforeend", this.elem);
        this.draw()
    }

    draw(){
        this.elem.style.left = this.x - this.elem.offsetWidth/4 + "px"
        this.elem.style.top = this.y - this.elem.offsetHeight/4 + "px"
        // this.elem.style.top = this.y - parseInt(this.elem.style.height)/2 + "px"
    }

    update(){
        if(enemies.length === 0){return}
        facing(this.elem, enemies[0].x, enemies[0].y,-90)
        this.timer = (this.timer + 1) % this.cd
        if(this.timer === 0){
            enemies[0].health -= this.dmg
            this.cannonelem.classList.remove("cannonpow")
            void this.elem.offsetWidth
            this.cannonelem.classList.add("cannonpow")
        }
        // this.draw()
    }
}
