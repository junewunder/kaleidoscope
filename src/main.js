
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
import { Sprite } from 'pixi.js'

const EMOJI_SIZE = 72
// const GLITTER_AREA_SIZE = EMOJI_SIZE * 2
// const GLITTER_VIEW_SIZE = EMOJI_SIZE
const GLITTER_AREA_SIZE = EMOJI_SIZE * 10
const GLITTER_VIEW_SIZE = EMOJI_SIZE * 3
const {round, random, min, max, PI, cos, sin} = Math
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

const sixty = PI / 3
const makeTriangle = (x, y, sideLen) => ([
  x, y,
  x + (cos(sixty * 2) * sideLen),
  y - (sin(sixty * 2) * sideLen),
  x + (cos(sixty) * sideLen),
  y - (sin(sixty) * sideLen),
]);

const makeMask = (x, y, sideLen) =>
  new PIXI.Graphics()
    .beginFill(0, 0xffffff)
    .drawPolygon(makeTriangle(x, y, sideLen))
    .endFill();

const drawMask = (g, x, y, sideLen) =>
  g.beginFill(0, 0xffffff)
    .drawPolygon(makeTriangle(x, y, sideLen))
    .endFill();

class Hexagon {
  bg = null // PIXI.Container
  bgTex = null // PIXI.Texture
  tris = [] // PIXI.Sprite[6]
  container = new PIXI.Container()
  constructor(bg, bgTex) {
    this.bg = bg
    this.bgTex = bgTex
    for (let i = 0; i < 6; i++) {
      const tri = new Sprite(bgTex)
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
    this.bg.mask = new PIXI.Graphics()
    this.moveToLocal(bg.width / 2, bg.height / 2)
  }

  moveTo(x, y) {
    this.container.position.x = x
    this.container.position.y = y
  }

  moveToLocal(x, y) {
    for (let tri of this.tris) {
      tri.anchor.set(x / this.bgTex.width, y / this.bgTex.height)
    }
    this.bg.mask.clear()
    drawMask(this.bg.mask, x, y, GLITTER_VIEW_SIZE)
    app.renderer.render(this.bg, { renderTexture: glitterTex })
  }
}

let glitterTex, glitterContainer, glitterSprite1, glitterSprite2;
let hex;
function main () {

  glitterContainer = new PIXI.Container();
  glitterTex = PIXI.RenderTexture.create({
    width: GLITTER_AREA_SIZE,
    height: GLITTER_AREA_SIZE,
  })

  const numEmojis = 1000

  for (let index = 0; index < numEmojis; index++) {
    let sprite = PIXI.Sprite.from(choice(emojis).name);
    sprite.width = EMOJI_SIZE
    sprite.height = EMOJI_SIZE
    sprite.anchor.set(0.5)
    sprite.x = random() * glitterTex.width
    sprite.y = random() * glitterTex.height
    glitterContainer.addChild(sprite);
  }

  // glitterContainer.filters = [new PIXI.filters.BlurFilter()];
  // glitterContainer.mask = new PIXI.Graphics()
  glitterContainer.mask = makeMask(100, 100, 100)
  app.renderer.render(glitterContainer, { renderTexture: glitterTex })

  glitterSprite1 = new Sprite(glitterTex)
  glitterSprite1.x = 100
  glitterSprite1.y = 100

  glitterSprite2 = new Sprite(glitterTex)
  glitterSprite2.scale.x *= -1
  glitterSprite2.x = 100 + GLITTER_VIEW_SIZE * 1.5,
  glitterSprite2.y = 100

  hex = new Hexagon(glitterContainer, glitterTex)
  hex.moveTo(400, 400)

  // app.stage.addChild(glitterSprite1)
  // app.stage.addChild(glitterSprite2)
  app.stage.addChild(hex.container)
  app.ticker.add(mainloop)
}

let t = 0
function mainloop() {
  t += 1
  const globalX = 200
  const globalY = 200

  glitterContainer.mask.clear()
  // const x = (t % (GLITTER_AREA_SIZE - 1.5 * GLITTER_VIEW_SIZE)) + GLITTER_VIEW_SIZE
  const x = GLITTER_AREA_SIZE / 2
  const y = (t % (GLITTER_AREA_SIZE - GLITTER_VIEW_SIZE)) + GLITTER_VIEW_SIZE
  glitterSprite1.anchor.set(x / GLITTER_AREA_SIZE, y / GLITTER_AREA_SIZE)
  glitterSprite1.x = globalX
  glitterSprite1.y = globalY
  glitterSprite2.anchor.set(x / GLITTER_AREA_SIZE, y / GLITTER_AREA_SIZE)
  glitterSprite2.x = globalX
  glitterSprite2.y = globalY
  glitterSprite2.rotation = PI / 3
  // glitterSprite2.x = globalX + 200 + x
  // glitterSprite2.y = globalY + 200 - y

  hex.moveToLocal(x, y)

  drawMask(glitterContainer.mask, x, y, GLITTER_VIEW_SIZE)
  app.renderer.render(glitterContainer, { renderTexture: glitterTex })
}