import React, { Component } from "react"
import ReactDOM from "react-dom"

import * as tf from '@tensorflow/tfjs'

import { Stage, Layer } from "react-konva"
import { SketchPicker } from 'react-color'

import 'bootstrap/dist/css/bootstrap.css'

import Paint from './paint'
import fruits from './classes'

class App extends Component {

  constructor() {
    super()
    this.child = React.createRef();

    this.state = {
      model: null,
      prediction: 'Unknown',
      confidence: 0,
      color: '#000000'
    }
  }

  componentDidMount() {
    console.log("Loading model")
    tf.loadModel('http://192.168.25.119:3001/model.json')
    .then(model => {
      this.setState({ model })
      model.predict(tf.zeros([1, 224, 224, 3])).dispose()
      console.log("Model loaded")
    })
  }

  handlePredict(canvas) {
    const { model } = this.state

    const img = tf.image.resizeBilinear(tf.fromPixels(canvas).toFloat(), [224, 224])
    const offset = tf.scalar(127.5)
    const normalized = img.sub(offset).div(offset)
    const batched = normalized.reshape([1, 224, 224, 3])

    model.predict(batched).data()
    .then(predictions => {
      const index = predictions.reduce(
        (max, value, index, arr) => value > arr[max] ? index : max, 0)

      const prediction = predictions[index]
      //const confidence = predictions[index] > 0.5 ? fruits[index] : "unknown"
      const confidence = fruits[index]

      this.setState({
        ...this.state,
        prediction,
        confidence
      })
    })
  }

  handleChangeComplete = (color) => {
    this.setState({ color: color.hex });
  };

  handleFormChange = (e) => {
    const { child } = this

    const file = URL.createObjectURL(e.target.files[0])
    child.current.drawImage(file);
  }

  render() {
    const { handleChangeComplete, handlePredict } = this
    const { color, confidence, prediction } = this.state

    return (
      <div className="container-fluid">
        <br/>
        <div className="row justify-content-center">
          <div className="col-md-2">
            <div className="row justify-content-center mb-3">
              <h4> Fruit Classifier </h4>
            </div>
            <SketchPicker
              color={ color }
              onChangeComplete={ handleChangeComplete }/>

            <input type="file" ref={fileInput => this.fileInput = fileInput}
                               style={{display: "none"}}
                               onChange={this.handleFormChange}/>
            <br/>
            <div className="row justify-content-center">
              <button className="btn btn-primary"
                  onClick={() => this.fileInput.click()}
                  href="#">Upload Fruit Image</button>
            </div>
          </div>
          <div className="col-md-6">
            <Stage width="640" height="640">
              <Layer>
                <Paint ref={this.child}
                       color={color}
                       handleMouseUp={handlePredict.bind(this)}/>
              </Layer>
            </Stage>
            <p>{prediction} - {confidence}</p>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
