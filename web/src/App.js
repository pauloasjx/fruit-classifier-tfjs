import React, { Component } from 'react'
import * as tf from '@tensorflow/tfjs'

import sample from './samples/apple.jpg'

class App extends Component {

  async loadModel() {
    const model = await tf.loadModel('./classifier/model.json')
    model.predict(tf.zeros([1, 224, 224, 3])).dispose();
    return model
  }

  async loadImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 224; canvas.height = 224
    const ctx = canvas.getContext("2d");

    let imgSample = new Image()
    imgSample.onload = () => { imgSample.src = sample }
    let imageData = ctx.getImageData(0, 0, 224, 224);

    const image = tf.fromPixels(imageData).toFloat()
    const offset = tf.scalar(127.5)
    const normalized = image.sub(offset).div(offset)
    const batched = normalized.reshape([1, 224, 224, 3])

    return batched
  }

  componentDidMount() {


    const image = this.loadImage()
    const model = this.loadModel()

    //console.log(model.predict((image)))
  }


  render() {

    return (
      <div className="App">

      </div>
    );
  }
}

export default App;
