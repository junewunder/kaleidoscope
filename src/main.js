import glitterpacks from './glitterpacks'

import * as PIXI from 'pixi.js'
import '@pixi/graphics-extras'

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
const {round, random, min, max, PI, cos, sin, atan, sqrt, ceil} = Math
const choice = arr =>
  arr[round((arr.length - 1) * random())]

const glitterPack = pack =>
  glitterpacks[pack].map((fname, i) =>
    ({name: pack + i, tex: fname}))

let glitters = glitterPack('emoji1')

const app = new PIXI.Application({
  width: window.innerWidth, height: window.innerHeight
});

document.body.appendChild(app.view);

glitters.map(e => app.loader.add(e.name, e.tex))
app.loader.load(() => main(app))

const cos1 = cos(PI / 3 * 2)
const cos2 = cos(PI / 3)
const sin1 = sin(PI / 3 * 2)
const sin2 = sin(PI / 3)
const makeTriangle = (x, y, sideLen) => ([
  x, y + 1,
  x + cos1 * sideLen - 3,
  y - sin1 * sideLen - 3,
  x + cos2 * sideLen + 3,
  y - sin2 * sideLen - 3,
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
    const x0 = x + cos1 * GLITTER_VIEW_SIZE - 3
    const y0 = y - sin1 * GLITTER_VIEW_SIZE - 3
    const x1 = x + cos2 * GLITTER_VIEW_SIZE + 3
    const y1 = y + 1
    return (
      x0 >= 0 && y0 >= 0 &&
      x1 <= this.bgTex.width &&
      y1 <= this.bgTex.height
    )
  }

  moveTo(x, y) {
    if (x === this.localX && y === this.localY) return
    this.localX = x
    this.localY = y
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
    // width: GLITTER_AREA_SIZE,
    // height: GLITTER_AREA_SIZE * 5,
    width: GLITTER_VIEW_SIZE,
    height: GLITTER_AREA_SIZE * 10,
    // height: GLITTER_VIEW_SIZE * 2,
  })

  for (let index = 0; index < NUM_GLITTER; index++) {
    let sprite = PIXI.Sprite.from(choice(glitters).name, {
      width: EMOJI_SIZE,
      height: EMOJI_SIZE,
    });
    sprite.anchor.set(0.5)
    sprite.x = random() * glitterTex.width
    sprite.y = random() * glitterTex.height
    glitterContainer.addChild(sprite);
  }

  // make hexagon
  hexagon = new Hexagon(glitterContainer, glitterTex)

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
    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col++) {
        makeHexSprite(
          centerX + (col * GLITTER_VIEW_SIZE * 3),
          centerY + (row * sin(PI / 3) * GLITTER_VIEW_SIZE * 2)
        )
      }
    }
    for (let row = -2; row < 2; row++) {
      for (let col = -1; col < 1; col++) {
        makeHexSprite(
          centerX + (col * GLITTER_VIEW_SIZE * 3 + 1.5 * GLITTER_VIEW_SIZE),
          centerY + (row * sin(PI / 3) * GLITTER_VIEW_SIZE * 2 + GLITTER_VIEW_SIZE * sin(PI / 3))
        )
      }
    }
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