import React, { Component } from "react"
import { Image } from "react-konva"

export default class Paint extends Component {
  constructor() {
    super()

    this.state = {
      isDrawing: false,
      mode: "brush"
    }
  }

  componentDidMount() {
    const canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = [640, 640]
    const context = canvas.getContext("2d");

    this.setState({ canvas, context });
  }

  handleMouseDown = () => {
    this.setState({ isDrawing: true });

    const stage = this.image.parent.parent;
    this.lastPointerPosition = stage.getPointerPosition();
  }

  handleMouseUp = () => {
    const { handleMouseUp } = this.props
    const { canvas } = this.state

    handleMouseUp(canvas)
    this.setState({ isDrawing: false })
  }

  handleMouseMove = () => {
    const { context, isDrawing, mode } = this.state;

    if (isDrawing) {
      context.strokeStyle = this.props.color;
      context.lineJoin = "round";
      context.lineWidth = 5;

      if (mode === "brush") {
        context.globalCompositeOperation = "source-over";
      } else if (mode === "eraser") {
        context.globalCompositeOperation = "destination-out";
      }
      context.beginPath();

      let localPos = {
        x: this.lastPointerPosition.x - this.image.x(),
        y: this.lastPointerPosition.y - this.image.y()
      };

      context.moveTo(localPos.x, localPos.y)

      const stage = this.image.parent.parent;

      let pos = stage.getPointerPosition()
      localPos = {
        x: pos.x - this.image.x(),
        y: pos.y - this.image.y()
      };

      context.lineTo(localPos.x, localPos.y)
      context.closePath();
      context.stroke();
      this.lastPointerPosition = pos;
      this.image.getLayer().draw()
    }
  }

  drawImage = (src) => {
    console.log("called")

    const { context } = this.state;

    let image = new window.Image()
    image.src = src
    image.onload = () => {
      context.drawImage(image, 0, 0, 640, 640)
    }
  }

  render() {
    const { canvas } = this.state;

    return (
      <Image
        image={canvas}
        ref={node => (this.image = node)}
        width={640}
        height={640}
        stroke="black"
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
      />
    );
  }
}
