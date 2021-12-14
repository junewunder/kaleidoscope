import glitterpacks from './glitterpacks'

import * as PIXI from 'pixi.js'
import '@pixi/graphics-extras'

function makeKaleidoscope() {
  const modes = {
    singleTri: false,
    singleHex: false,
    unmasked: false,
  }

  const EMOJI_SIZE = 72
  // const EMOJI_SIZE = 72 / 3
  // const NUM_GLITTER = 200
  const NUM_GLITTER = 1000
  // const NUM_GLITTER = 50
  const GLITTER_AREA_SIZE = EMOJI_SIZE * 10
  const GLITTER_VIEW_SIZE = EMOJI_SIZE * 3
  const { round, random, min, max, PI, cos, sin, atan, sqrt, ceil } = Math
  const choice = arr =>
    arr[round((arr.length - 1) * random())]

  const glitterPack = pack =>
    glitterpacks[pack].map((fname, i) =>
      ({ name: pack + i, tex: fname }))

  let glitters = glitterPack('june1')

  const app = new PIXI.Application({
    width: window.innerWidth, height: window.innerHeight
  });

  document.body.appendChild(app.view);

  glitters.map(e => app.loader.add(e.name, e.tex))
  app.loader.load(() => main(app))


  function main() {
    for (let index = 0; index < NUM_GLITTER; index++) {
      let sprite = PIXI.Sprite.from(choice(glitters).name, {
        width: EMOJI_SIZE,
        height: EMOJI_SIZE,
      });
      sprite.anchor.set(0.5)
      sprite.x = random() * glitterTex.width
      sprite.y = random() * glitterTex.height
      app.stage.addChild(sprite);
    }

    app.ticker.add(mainloop)
  }

  let t = 0
  function mainloop() {
    t += 1
    const x = glitterTex.width / 2
    const y = (t % (glitterTex.height - GLITTER_VIEW_SIZE)) + GLITTER_VIEW_SIZE
    hexagon.moveTo(x, y)
  }
}