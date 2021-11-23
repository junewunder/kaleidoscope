import emoji01 from '../glitter/1f0cf.png'
import emoji02 from '../glitter/1f3c6.png'
import emoji03 from '../glitter/1f4b0.png'
import emoji04 from '../glitter/1f9c1.png'
import emoji05 from '../glitter/1f9c3.png'
import emoji06 from '../glitter/1f9c7.png'
import emoji07 from '../glitter/1f9cb.png'
import emoji08 from '../glitter/1f9e0.png'

import * as PIXI from 'pixi.js'
import '@pixi/graphics-extras'

const modes = {
  singleTri: false,
  singleHex: false,
  unmasked: false,
}

const EMOJI_SIZE = 72
// const NUM_GLITTER = 200
const NUM_GLITTER = 1000
const GLITTER_AREA_SIZE = EMOJI_SIZE * 10
const GLITTER_VIEW_SIZE = EMOJI_SIZE * 3
const {round, random, min, max, PI, cos, sin, atan, sqrt, ceil} = Math
const choice = arr =>
  arr[round((arr.length - 1) * random())]

const emojis =
  [ {name: '1f0cf', tex: emoji01}
  , {name: '1f3c6', tex: emoji02}
  , {name: '1f4b0', tex: emoji03}
  , {name: '1f9c1', tex: emoji04}
  , {name: '1f9c3', tex: emoji05}
  , {name: '1f9c7', tex: emoji06}
  , {name: '1f9cb', tex: emoji07}
  , {name: '1f9e0', tex: emoji08}
  ]

const app = new PIXI.Application({
  width: window.innerWidth, height: window.innerHeight
});

document.body.appendChild(app.view);

emojis.map(e => app.loader.add(e.name, e.tex))
app.loader.load(() => main(app))

const makeTriangle = (x, y, sideLen) => ([
  x, y + 1,
  x + cos(PI / 3 * 2) * sideLen - 3,
  y - sin(PI / 3 * 2) * sideLen - 3,
  x + cos(PI / 3) * sideLen + 3,
  y - sin(PI / 3) * sideLen - 3,
]);

const drawMask = (g, x, y, sideLen) =>
  g.beginFill(0, 0xffffff)
    .drawPolygon(makeTriangle(x, y, sideLen))
    .endFill();

class Hexagon {
  bg = null // PIXI.Container
  bgTex = null // PIXI.Texture
  bgMask = null // PIXI.Graphics
  tris = [] // PIXI.Sprite[6]
  texture = null // PIXI.Texture
  container = new PIXI.Container()
  localX = 0
  localY = 0
  localTheta = 0
  localRadius = 0
  constructor(bg, bgTex) {
    this.bg = bg
    this.bgTex = bgTex
    this.bgMask = new PIXI.Graphics()
    if (!modes.unmasked) {
      this.bg.mask = this.bgMask
    } else {
      this.bg.addChild(this.bgMask)
    }
    this.texture = PIXI.RenderTexture.create({
      width: GLITTER_VIEW_SIZE * 3,
      height: GLITTER_VIEW_SIZE * 3,
    })
    this.container.x = this.texture.width / 2
    this.container.y = this.texture.height / 2
    let maxTris = modes.singleTri ? 1 : 6
    for (let i = 0; i < maxTris; i++) {
    // for (let i = 0; i < 1; i++) {
    // for (let i = 2; i < 3; i++) {
      const tri = new PIXI.Sprite(bgTex)
      tri.position.set(0, 0)
      if (i % 2 === 0) {
        tri.rotation = PI / 3 * i
      } else {
        tri.rotation = -(PI / 3 * i)
        tri.scale.x *= -1
      }
      this.container.addChild(tri)
      this.tris.push(tri)
    }
    this.moveTo(this.bg.width / 2, this.bg.height / 2)
    app.renderer.render(this.bg, { renderTexture: this.bgTex })
    app.renderer.render(this.container, { renderTexture: this.texture })
  }

  checkBounds(x, y) {
    // console.log(
    //   makeTriangle(x, y, GLITTER_VIEW_SIZE),
    //   this.bgTex.width,
    //   this.bgTex.height)
    const x0 = x + cos(PI / 3 * 2) * GLITTER_VIEW_SIZE - 3
    const y0 = y - sin(PI / 3 * 2) * GLITTER_VIEW_SIZE - 3
    const x1 = x + cos(PI / 3) * GLITTER_VIEW_SIZE + 3
    const y1 = y + 1
    return (
      x0 >= 0 && y0 >= 0 &&
      x1 <= this.bgTex.width &&
      y1 <= this.bgTex.height
    )
  }

  moveToPolar(theta, radius) {
    this.moveTo(
      this.bgTex.width / 2 + radius * cos(theta),
      this.bgTex.height - radius * sin(theta)
    )
  }

  moveTo(x, y) {
    if (x === this.localX && y === this.localY) return
    if (!this.checkBounds(x, y)) return
    this.localX = x
    this.localY = y
    this.localTheta = atan(y / x)
    this.localRadius = sqrt(x * x + y * y)
    for (let tri of this.tris) {
      tri.anchor.set(x / this.bgTex.width, y / this.bgTex.height)
    }
    this.bgMask.clear()
    drawMask(this.bgMask, x, y, GLITTER_VIEW_SIZE)
    app.renderer.render(this.bg, { renderTexture: this.bgTex })
    app.renderer.render(this.container, { renderTexture: this.texture })
  }
}

let glitterTex, glitterContainer, hexagon;
const hexes = []
function main () {
  // make glitter texture
  glitterContainer = new PIXI.Container();
  glitterTex = PIXI.RenderTexture.create({
    width: GLITTER_AREA_SIZE,
    height: GLITTER_AREA_SIZE * 5,
  })

  for (let index = 0; index < NUM_GLITTER; index++) {
    let sprite = PIXI.Sprite.from(choice(emojis).name, {
      width: EMOJI_SIZE,
      height: EMOJI_SIZE,
    });
    // sprite.width = EMOJI_SIZE
    // sprite.height = EMOJI_SIZE
    sprite.anchor.set(0.5)
    sprite.x = random() * glitterTex.width
    sprite.y = random() * glitterTex.height
    glitterContainer.addChild(sprite);
  }

  // make hexagon
  hexagon = new Hexagon(glitterContainer, glitterTex)
  hexagon.moveToPolar(PI / 2, 100)

  const makeHexSprite = (x, y) => {
    let hexSprite = new PIXI.Sprite(hexagon.texture)
    hexSprite.anchor.set(.5)
    hexSprite.x = x
    hexSprite.y = y
    app.stage.addChild(hexSprite)
    hexes.push(hexSprite)
  }

  // make hexagon sprites and add to stage
  const centerX = app.screen.width / 2
  const centerY = app.screen.height / 2
  if (modes.singleHex) {
    makeHexSprite(centerX, centerY)
  } else {
    for (let j = -1; j <= 1; j++) {
      for (let i = -1; i <= 1; i++) {
        makeHexSprite(
          centerX + (i * GLITTER_VIEW_SIZE * 3),
          centerY + (j * sin(PI / 3) * GLITTER_VIEW_SIZE * 2)
        )
      }
    }
    for (let j = -2; j <= 2; j++) {
      for (let i = -1; i < 1; i++) {
        makeHexSprite(
          centerX + (i * GLITTER_VIEW_SIZE * 3 + 1.5 * GLITTER_VIEW_SIZE),
          centerY + (j * sin(PI / 3) * GLITTER_VIEW_SIZE * 2 + GLITTER_VIEW_SIZE * sin(PI / 3))
        )
      }
    }
  }

  app.ticker.add(mainloop)
}

let prevX = 0, prevY = 0
function onDragStart(e) {
  prevX = e.data.global.x
  prevY = e.data.global.y
  app.stage.on('pointermove', onDragMove);
}
function onDragEnd(e) {
  app.stage.off('pointermove', onDragMove);
}
function onDragMove(e) {
  let currentX = e.data.global.x
  let currentY = e.data.global.y
  // console.log(prevX - currentX);
  const dx = prevX - currentX
  const dy = prevY - currentY
  // hexagon.moveToPolar(
  //   hexagon.localTheta + dx / 1000,
  //   hexagon.localRadius - dy / 100
  // )
  // if (dx > dy) {
  //   hexagon.moveToPolar(
  //     hexagon.localTheta + (dx) / 1000,
  //     hexagon.localRadius
  //   )
  // } else {
  //   hexagon.moveToPolar(
  //     hexagon.localTheta,
  //     hexagon.localRadius + (prevY - currentY)
  //   )
  // }
  prevX = currentX
  prevY = currentY
}
app.stage.interactive = true
app.stage.on('pointerdown', onDragStart);
app.stage.on('pointerup', onDragEnd);
app.stage.on('pointerupoutside', onDragEnd);

let t = 0
function mainloop() {
  t += 1
  const x = GLITTER_AREA_SIZE / 2
  const y = (t % (glitterTex.height - GLITTER_VIEW_SIZE)) + GLITTER_VIEW_SIZE
  hexagon.moveTo(x, y)
  // hexagon.moveToPolar(PI / 2 + t / 100, 100)
}