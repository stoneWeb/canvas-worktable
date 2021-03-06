/*
 * @Author: DT
 * @Description: ...
 * @Date: 2020-09-18 13:26:32
 * @LastEditTime: 2020-09-28 11:35:01
 */

 // 先随便写下功能
import { fabric } from "fabric";
import { CanvasEvent } from './eventManage';

class Board {
    constructor (canvas) {
        this.pLeft = canvas.parentNode.offsetLeft;
        this.pTop = canvas.parentNode.offsetTop;
        canvas.width = this.viewWidth = canvas.parentNode.offsetWidth;
        canvas.height = this.viewHeight = canvas.parentNode.offsetHeight;
        this.canvas = new fabric.Canvas(canvas);
        this.canvas.selection = false;
        this.LISTAREA = [50, 250, 700, 700];
        this.CARDSIZE = [180, 180];
        this.events = {};
        this.injectCss();
        // obj.selectable = false  禁止拖拽
        this.loadSvgs(() => {
            this.initGlobalEvents();
            this.createSomething();
            this.createCtxMenu();
        });
    }
    svgSources = {
        "dotmenu": require('./assets/dotmenu.svg'),
    }
    cacheSvg = {}
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
    injectCss () {
        let style = document.createElement('style'),   
        str = `
            .ctx-menu{
                position: absolute;
                width: 100px;
                background-color: #f5f5f5;
                border-radius: 4px;
                visibility: hidden;
                overflow: hidden;
                box-shadow: 1px 4px 10px rgba(0,0,0,.2);
            }
            .ctx-menu span{
                display: flex;
                align-items: center;
                padding: 0 10px;
                height: 35px;
                cursor: pointer;
                color: #444;
            }
            .ctx-menu span:hover{
                background-color: #eee;
            }
        `;  
        style.type="text/css";  
        if(style.styleSheet){
            style.styleSheet.cssText = str;  
        } else {  
            style.innerHTML = str;
        }  
        document.getElementsByTagName("head")[0].appendChild(style);  
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
            width: this.CARDSIZE[0] - 10,
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
        { color: '#F16F81', num: "3", text: "这是一个神奇的卡片\n它可以表达大家的想法" }]
            .forEach((item, index) => {
                this.addCard(item, index)
            })
    }
    createCtxMenu () {
        let d = document.createElement('div');
        let isShow = false;
        d.className = 'ctx-menu';
        d._show = false;
        d.innerHTML = '<span>菜单一</span><span>菜单二</span><span>菜单三</span>';
        document.body.appendChild(d);
        this.ctxMenu = {
            show: (x, y) => {
                isShow = true;
                d.style.left = x + 'px';
                d.style.top = y + 'px';
                d.style.visibility = 'visible';
            },
            hide: () => {
                if (isShow) {
                    isShow = false;
                    d.style.visibility = 'hidden';
                }
            },
            isShow: () => {
                return isShow;
            }
        }
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
        CanvasEvent.call(this);
    }
}

export default Board