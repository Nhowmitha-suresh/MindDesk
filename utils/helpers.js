function makeDraggable(el) {
  let x=0,y=0;
  el.onmousedown = e => {
    x = e.clientX;
    y = e.clientY;
    document.onmousemove = move;
    document.onmouseup = () => document.onmousemove = null;
  };

  function move(e) {
    el.style.position = "absolute";
    el.style.left = el.offsetLeft + (e.clientX - x) + "px";
    el.style.top = el.offsetTop + (e.clientY - y) + "px";
    x = e.clientX;
    y = e.clientY;
  }
}
