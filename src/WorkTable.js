/*
 * @Author: DT
 * @Description: ...
 * @Date: 2020-09-18 11:21:55
 * @LastEditTime: 2020-09-22 20:03:53
 */
import React, { Component } from 'react';
import './main.css';
import Board from './board';

class WorkTable extends Component {
  state = {
    zoom: 1,
    dragPan: false,
  }
  componentDidMount () {
    this._b = new Board(this.canvas);
    this._b.on('zoom', zoom => {
      this.setState({ zoom })
    })
    this._b.on('dragPanStart', () => {
      this.setState({ dragPan: true })
    })
    this._b.on('dragPanEnd', () => {
      this.setState({ dragPan: false })
    })
  }
  render () {
    return (
      <div className="main">
        <div className="tools">
          <p>1. 按住空格键拖拽画布<br/>2. macOS触摸板手势缩放画布<br/>3. windows系统按着ctrl键鼠标滚轮缩放画布</p>
          <span>zoom: {parseInt(this.state.zoom*100)}%</span>
          <span>canvas dragging: {this.state.dragPan?'yes':'no'}</span>
        </div>
        <canvas className="canvas" ref={e => (this.canvas = e)}></canvas>
      </div>
    );
  }
}
export default WorkTable;
