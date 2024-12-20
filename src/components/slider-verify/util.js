export const PI = Math.PI

export function sum(x, y) {
  return x + y
}

export function square(x) {
  return x * x
}

export function draw(ctx, x, y, l, r, operation) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI)
  ctx.lineTo(x + l, y)
  ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI)
  ctx.lineTo(x + l, y + l)
  ctx.lineTo(x, y + l)
  ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true)
  ctx.lineTo(x, y)
  ctx.lineWidth = 2
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.stroke()
  ctx[operation]()
  ctx.globalCompositeOperation = 'destination-over'
}

export function createImg(imgs, onload) {
  const img = document.createElement('img')
  img.crossOrigin = 'Anonymous'
  img.onload = onload
  img.onerror = () => {
    img.src = getRandomImg(imgs)
  }
  img.src = getRandomImg(imgs)
  return img
}

export function getRandomNumberByRange(start, end) {
  return Math.round(Math.random() * (end - start) + start)
}

export function getRandomImg(imgs) {
  const len = imgs.length
  return len > 0 ? imgs[getRandomNumberByRange(0, len - 1)] : 'https://source.unsplash.com/300x150/?book,library'
}

export function throttle(fn, interval, options = { leading: true, trailing: true }) {
  const { leading, trailing, resultCallback } = options
  let lastTime = 0
  let timer = null

  const _throttle = function (...args) {
    return new Promise((resolve, reject) => {
      const nowTime = new Date().getTime()
      if (!lastTime && !leading) lastTime = nowTime

      const remainTime = interval - (nowTime - lastTime)
      if (remainTime <= 0) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        const result = fn.apply(this, args)
        if (resultCallback) resultCallback(result)
        resolve(result)
        lastTime = nowTime
        return
      }

      if (trailing && !timer) {
        timer = setTimeout(() => {
          timer = null
          lastTime = !leading ? 0 : new Date().getTime()
          const result = fn.apply(this, args)
          if (resultCallback) resultCallback(result)
          resolve(result)
        }, remainTime)
      }
    })
  }

  _throttle.cancel = function () {
    if (timer) clearTimeout(timer)
    timer = null
    lastTime = 0
  }

  return _throttle
}
