/*
 * @Author: DT
 * @Description: ...
 * @Date: 2020-09-18 13:26:32
 * @LastEditTime: 2020-09-18 21:38:22
 */
import { fabric } from "fabric";

class Board {
    constructor (canvas) {
        this.pLeft = canvas.parentNode.offsetLeft;
        this.pTop = canvas.parentNode.offsetTop;
        canvas.width = this.viewWidth = canvas.parentNode.offsetWidth;
        canvas.height = this.viewHeight = canvas.parentNode.offsetHeight;
        this.canvas = new fabric.Canvas(canvas);
        this.canvas.selection = false;
        this.LISTAREA = [50, 50, 700, 700];
        this.CARDSIZE = [180, 180];
        this.events = {};
        console.log(this.canvas)
        // obj.selectable = false  禁止拖拽
        this.loadSvgs(() => {
            this.initGlobalEvents();
            this.createSomething();
            console.log(this.cacheSvg)
        });
    }
    svgSources = {
        "dotmenu": require('./assets/icons/dotmenu.svg'),
    }
    cacheSvg = {}
    eventTypes = {
        ZOOM: 'zoom',
        DRAGPANSTART: 'dragPanStart',
        DRAGPANEND: 'dragPanEnd',
    }
    loadSvgs (cb) {
        let ks = Object.keys(this.svgSources);
        let i = 0;
        ks.forEach(key => {
            fabric.loadSVGFromURL(this.svgSources[key], (objects, options) => {
                this.cacheSvg[key] = fabric.util.groupSVGElements(objects, options);
                this.cacheSvg[key].scale(0.02)
                if (++i === ks.length) {
                    cb && cb()
                }
            })
        })
    }
    addCard (opt, index) {
        // { text, num, color }
        let fontFamily = '-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol';
        let card = new fabric.Rect({
            top: 0, 
            left: 0, 
            width: this.CARDSIZE[0], 
            height: this.CARDSIZE[1], 
            rx: 4, 
            ry: 4, 
            fill: opt.color,
            shadow: {
                color: 'rgba(0,0,0,.2)',
                offsetX: 1,
                offsetY: 10,
                blur: 10
            }
        });
        let text = new fabric.Textbox(opt.text, {
            left: 10,
            top: 35,
            width: this.CARDSIZE[0] - 20,
            fontSize: 16,
            fill: '#333',
            fontFamily,
            splitByGrapheme: true,
          });
          let num = new fabric.Textbox(opt.num, {
            left: 10,
            top: 10,
            width: 20,
            fontSize: 14,
            fontFamily,
            fill: 'rgba(0,0,0,.7)',
            splitByGrapheme: true,
          });
        //进行组合
        let group = new fabric.Group([card, text, num], {
            _cardId: '1243',
            top: this.LISTAREA[1], 
            left: this.LISTAREA[0] + (this.CARDSIZE[0] + 20) * index, 
            width: this.CARDSIZE[0],
            height: this.CARDSIZE[1],
            subTargetCheck: true,
            hasControls: false,
            hasBorders: false,
        })
        this.cacheSvg.dotmenu.clone(clone => {
            clone.set({
                left: 10,
                top: 8,
                originX: 'left',
                originY: 'top',
            });
            let menuBtn = new fabric.Rect({
                top: 0, 
                left: 0, 
                width: 35, 
                height: 20, 
                originX: 'left',
                originY: 'top',
                rx: 4, 
                ry: 4, 
                fill: "rgba(0,0,0,0)",
            });
            let btnG = new fabric.Group([menuBtn, clone], {
                top:  -this.CARDSIZE[1]/2, 
                left: this.CARDSIZE[0] - 35 - this.CARDSIZE[0]/2, 
                width: 35,
                height: 20,
                subTargetCheck: true,
                hasControls: false,
                hasBorders: false,
            })
            btnG.on('mouseover', function (e){
                e.target.getObjects()[0].set("fill", "rgba(0,0,0,.1)");
                this.canvas.hoverCursor = 'pointer';
                this.canvas.renderAll();
            });
            btnG.on('mouseout', function (e){
                e.target.getObjects()[0].set("fill", "rgba(0,0,0,0)");
                this.canvas.hoverCursor = 'default';
                this.canvas.renderAll();
            });
            group.add(btnG)
        })
        // card.on('mouseover', function (e){
        //     console.log(e)
        //     console.log(e.subTargets);
        // });
        // card.on('mouseout', function (e){
        //     console.log(e)
        //     console.log(e.subTargets);
        // });
        this.canvas.add(group);
    }
    createSomething () {
        [{ color: '#FF9E4A', num: "1", text: "公司机密文件容易轻易泄露，缺乏监管" },
        { color: '#B486BC', num: "2", text: "时间变得琐碎不集中" },
        { color: '#F16F81', num: "3", text: "在家上班所产生的电费网费公司不承担" }]
            .forEach((item, index) => {
                this.addCard(item, index)
            })
    }
    registerDragBoardEvent () {
        //鼠标按下
        let holdKeys = {
            spaceKey: false,
        }
        let actions = {
            moveBoard: false
        }
        let scale = 1;
        this.canvas.on('mouse:down', e => {
            if (holdKeys.spaceKey) {
                actions.moveBoard = 1;
                this.canvas.upperCanvasEl.classList.remove('canvas-move');
                this.canvas.upperCanvasEl.classList.add('canvas-moved');
                this.triggerEvent(this.eventTypes.DRAGPANSTART);
            }
        });
    
        this.canvas.on('mouse:up', e => {
            if (actions.moveBoard && holdKeys.spaceKey) {
                this.triggerEvent(this.eventTypes.DRAGPANEND);
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
                this.triggerEvent(this.eventTypes.ZOOM, scale);
            }
            
        }, { passive: false, capture: false, });

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
                    this.triggerEvent(this.eventTypes.DRAGPANEND);
                    actions.moveBoard = 0;
                }
            }
        }, !1)
    }
    triggerEvent (ev, data) {
        if (this.events[ev]) {
            this.events[ev].forEach(fn => {
                fn.call(this, data);
            })
        }
    }
    on (ev, fn) {
        if (this.events[ev]) {
            this.events[ev].push(fn);
        } else {
            this.events[ev] = [fn];
        }
    }
    initGlobalEvents () {
        this.registerDragBoardEvent()
    }
}

export default Board