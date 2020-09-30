import { fabric } from "fabric";
import APITypes from './APITypes';

export default function () {
  //鼠标按下
  let holdKeys = {
    spaceKey: false,
  }
  let actions = {
    moveBoard: false
  }
  let scale = 1;
  this.canvas.on('mouse:down', e => {
    // const pointer = this.canvas.getPointer(e);
    if (holdKeys.spaceKey) {
        actions.moveBoard = 1;
        this.canvas.upperCanvasEl.classList.remove('canvas-move');
        this.canvas.upperCanvasEl.classList.add('canvas-moved');
        this.triggerEvent(APITypes.DRAGPANSTART);
    }
    this.ctxMenu.hide()
  });

  this.canvas.on('mouse:up', e => {
    if (actions.moveBoard && holdKeys.spaceKey) {
        this.triggerEvent(APITypes.DRAGPANEND);
        this.canvas.upperCanvasEl.classList.remove('canvas-move');
        this.canvas.upperCanvasEl.classList.remove('canvas-moved');
        actions.moveBoard = 0;
    }
  });
  this.canvas.on('mouse:move', e => {
    if (actions.moveBoard && e && e.e) {
        var delta = new fabric.Point(e.e.movementX, e.e.movementY);
        this.canvas.relativePan(delta);
    }
  });
  this.canvas.on('mouse:over', e => {
    if (e.target) {
        if (e.target._cardId) {
            e.target.getObjects()[0].set("shadow", "1px 10px 10px rgba(0,0,0,.3)");
            this.canvas.renderAll();
        }
    }
  });

  this.canvas.on('mouse:out', e => {
    if (e.target) {
        if (e.target._cardId) {
            e.target.getObjects()[0].set("shadow", "1px 10px 10px rgba(0,0,0,.2)");
            this.canvas.renderAll();
        }
    }
  });

  this.canvas.wrapperEl.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.ctrlKey) {
        scale -= e.deltaY * 0.02;
        scale = Math.min(scale, 10);
        scale = Math.max(scale, 0.2);
        var zoomPoint = new fabric.Point(e.pageX - this.pLeft, e.pageY - this.pTop);
        this.canvas.zoomToPoint(zoomPoint, scale);
        this.triggerEvent(APITypes.ZOOM, scale);
    }
    
  }, { passive: false, capture: false, });
  this.canvas.upperCanvasEl.addEventListener('contextmenu', e => {
    const pointer = this.canvas.getPointer(e);
    const objects = this.canvas.getObjects();
    let activeObject;
    for (let i = objects.length - 1; i >= 0; i--) {
        let object = objects[i];
        //判断该对象是否在鼠标点击处
        // console.log(this.canvas.isTargetTransparent(object, pointer.x, pointer.y))
        if (object.containsPoint(pointer)) {
            //选中该对象
            activeObject = object;
            break;
            // this.canvas.setActiveObject(object);
        }
    }
    console.log(activeObject);
    this.ctxMenu.show(e.clientX, e.clientY); // pointer 是画布的坐标，有可能缩放移动过的
    e.preventDefault();
    return false;
  }, !1)
  //.contextmenu(onContextmenu);
  window.addEventListener('resize', () => {
    this.viewWidth = this.canvas.wrapperEl.offsetWidth;
    this.viewHeight = this.canvas.wrapperEl.offsetHeight;
    this.canvas.setWidth(this.viewWidth);
    this.canvas.setHeight(this.viewHeight);
  }, !1);
  document.addEventListener('keydown', e => {
    if (e.keyCode === 32) {
        holdKeys.spaceKey = 1;
        this.canvas.upperCanvasEl.classList.add('canvas-move')
    }
  }, !1)
  document.addEventListener('keyup', e => {
    if (e.keyCode === 32) {
        holdKeys.spaceKey = 0;
        this.canvas.upperCanvasEl.classList.remove('canvas-move');
        this.canvas.upperCanvasEl.classList.remove('canvas-moved')
        if (actions.moveBoard) {
            this.triggerEvent(APITypes.DRAGPANEND);
            actions.moveBoard = 0;
        }
    }
  }, !1)
}