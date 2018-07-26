import p5 from 'p5'
import * as tf from '@tensorflow/tfjs'

import fruits from './classes'

const model_path = 'http://192.168.25.119:3001/model.json'

let model

const fruitClassifier = async () => {
  console.log('Loading model')
  model = await tf.loadModel(model_path)
  model.predict(tf.zeros([1, 224, 224, 3])).dispose();
  console.log('Model loaded')

  const sketch = new p5(($) => {
    let oldMouseX, oldMouseY
    let img

    const loadImage = () =>  {
     const canvas = document.getElementById('defaultCanvas0');

     const image = tf.image.resizeBilinear(tf.fromPixels(canvas).toFloat(), [224, 224])

     const offset = tf.scalar(127.5)
     const normalized = image.sub(offset).div(offset)
     const batched = normalized.reshape([1, 224, 224, 3])

     return batched
   }


    $.setup = () => {
        const button = $.createFileInput(upload)

        $.createCanvas(640, 640)
        $.background('black')

        setInterval(() => {
          model.predict(loadImage()).data()
          .then((predictions) => {
            const prediction = predictions.reduce(
              (max, value, index, arr) => value > arr[max] ? index : max, 0)

            console.log(predictions[prediction])
            console.log(predictions[prediction] > 0.5 ? fruits[prediction] : "unknown")
           })
        }, 1000)
    }

    const upload = (file) => {
      img = $.loadImage(file.data, () => {
         $.image(img, 0, 0, 640, 640);
         img.filter($.GRAY,0.5);
     })
    }

    $.draw = () => {
      $.image(img, 0, 0);
      if($.mouseIsPressed){
        $.stroke('white')
        $.line($.mouseX, $.mouseY, oldMouseX, oldMouseY);
      }

      [oldMouseX, oldMouseY] = [$.mouseX, $.mouseY]
    }
  });
}

fruitClassifier()
