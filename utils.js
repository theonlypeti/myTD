function divmod(x, y){return [Math.floor(x / y), x % y]}

function choice(Array) {
    return Array[Math.floor(Math.random() * (Array.length - 0))];
}

function facing(elem,x=0,y=0,offset=0){
    const off = getOffset(elem) //i truly dont like this
    const ex = off.left
    const ey = off.top
    console.log(ex,ey)
    console.log(x,y)
    // elem.style.height = Math.min(100,Math.sqrt(Math.pow(parseInt(elem.style.top)-y,2) + Math.pow(parseInt(elem.style.left) - x,2))) + "px";
    elem.style.rotate = Math.atan2(ey - y, ex - x) * 180 / Math.PI + offset + "deg"
}

function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

function distance(a,b){
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function floatText(text, x, y, fontsize, fadeOut=1000) {
    const elem = document.createElement("div")
    elem.classList.add("floatup")
    elem.style.setProperty("--animlength", fadeOut + "ms")
    elem.innerText = text
    elem.style.left = x + "px"
    elem.style.top = y + "px"
    anchor.insertAdjacentElement("beforeend", elem)
    // console.log(window.getComputedStyle(elem).scale)
    elem.style.fontSize = fontsize
    $(".floatup").fadeOut(fadeOut, function () {
        $(this).remove();
    })
}