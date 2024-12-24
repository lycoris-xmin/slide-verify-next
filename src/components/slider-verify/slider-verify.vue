<template>
  <div id="slideVerify" class="slide-verify" :style="{ width: w + 'px' }" onselectstart="return false;">
    <!-- 图片加载遮蔽罩 -->
    <div v-if="loadBlock" class="slide-verify-loading"></div>
    <canvas ref="canvas" :width="w" :height="h"></canvas>
    <div v-if="show" class="slide-verify-refresh-icon" @click="refresh">
      <i class="iconfont icon-refresh"></i>
    </div>
    <canvas ref="block" :width="w" :height="h" class="slide-verify-block"></canvas>
    <!-- container -->
    <div
      class="slide-verify-slider"
      :class="{
        'container-active': containerCls.containerActive,
        'container-success': containerCls.containerSuccess,
        'container-fail': containerCls.containerFail
      }"
    >
      <div class="slide-verify-slider-mask" :style="{ width: sliderBox.width }">
        <!-- slider -->
        <div class="slide-verify-slider-mask-item" :style="{ left: sliderBox.left }" @mousedown="sliderDown" @touchstart="touchStartEvent" @touchmove="touchMoveEvent" @touchend="touchEndEvent">
          <i :class="['slide-verify-slider-mask-item-icon', 'iconfont', `icon-${sliderBox.iconCls}`]"></i>
        </div>
      </div>
      <span class="slide-verify-slider-text">{{ sliderText }}</span>
    </div>
  </div>
</template>

<script>
  import { defineComponent, reactive, ref, onMounted, onBeforeUnmount } from 'vue'
  import { useSlideAction } from './hook'
  import { createImg, draw, getRandomImg, getRandomNumberByRange, throttle } from './util.js'

  export default defineComponent({
    name: 'SlideVerifyNext',
    props: {
      l: {
        type: Number,
        default: 42
      },
      r: {
        type: Number,
        default: 10
      },
      w: {
        type: Number,
        default: 310
      },
      h: {
        type: Number,
        default: 155
      },
      sliderText: {
        type: String,
        default: '滑动验证'
      },
      accuracy: {
        type: Number,
        default: 5
      },
      show: {
        type: Boolean,
        default: true
      },
      imgs: {
        type: Array,
        default: () => []
      },
      interval: {
        type: Number,
        default: 50
      },
      block: {
        type: Object,
        default: () => {
          return {
            x: 0,
            y: 0
          }
        }
      }
    },
    emits: ['success', 'again', 'fail', 'refresh'],
    setup(props, { emit }) {
      const { imgs, l, r, w, h, accuracy, interval } = props
      const loadBlock = ref(true)
      const blockX = ref(0)
      const blockY = ref(0)
      const containerCls = reactive({
        containerActive: false,
        containerSuccess: false,
        containerFail: false
      })
      const sliderBox = reactive({
        iconCls: 'arrow-right',
        width: '0',
        left: '0'
      })

      const block = ref(null)
      const blockCtx = ref(null)
      const canvas = ref(null)
      const canvasCtx = ref(null)
      let img

      const { success, start, move, end, verify } = useSlideAction()

      const reset = () => {
        success.value = false
        containerCls.containerActive = false
        containerCls.containerSuccess = false
        containerCls.containerFail = false
        sliderBox.iconCls = 'arrow-right'
        sliderBox.left = '0'
        sliderBox.width = '0'
        block.value.style.left = '0'
        canvasCtx.value?.clearRect(0, 0, w, h)
        blockCtx.value?.clearRect(0, 0, w, h)
        block.value.width = w
        img.src = getRandomImg(imgs)
      }

      const refresh = () => {
        reset()
        emit('refresh')
      }

      const moveCb = moveX => {
        sliderBox.left = moveX + 'px'
        let blockLeft = ((w - 40 - 20) / (w - 40)) * moveX
        block.value.style.left = blockLeft + 'px'
        containerCls.containerActive = true
        sliderBox.width = moveX + 'px'
      }

      const endCb = timestamp => {
        const { spliced, TuringTest } = verify(block.value.style.left, blockX.value, accuracy)
        if (spliced) {
          if (accuracy === -1) {
            containerCls.containerSuccess = true
            sliderBox.iconCls = 'success'
            success.value = true
            emit('success', timestamp)
            return
          }
          if (TuringTest) {
            containerCls.containerSuccess = true
            sliderBox.iconCls = 'success'
            success.value = true
            emit('success', timestamp)
          } else {
            containerCls.containerFail = true
            sliderBox.iconCls = 'fail'
            emit('again')
          }
        } else {
          containerCls.containerFail = true
          sliderBox.iconCls = 'fail'
          emit('fail')
          setTimeout(() => {
            reset()
          }, 1000)
        }
      }

      const touchMoveEvent = throttle(e => {
        move(w, e, moveCb)
      }, interval)

      const touchEndEvent = e => {
        end(e, endCb)
      }

      onMounted(() => {
        const _canvasCtx = canvas.value?.getContext('2d')
        const _blockCtx = block.value?.getContext('2d')
        canvasCtx.value = _canvasCtx
        blockCtx.value = _blockCtx

        img = createImg(imgs, () => {
          loadBlock.value = false
          const L = l + r * 2 + 3

          // 图片坐标位置
          if (props.block.x <= 0 && props.block.y <= 0) {
            blockX.value = getRandomNumberByRange(L + 10, w - (L + 10))
            blockY.value = getRandomNumberByRange(10 + r * 2, h - (L + 10))
          } else {
            blockX.value = props.block.x
            blockY.value = props.block.y
          }

          if (_canvasCtx && _blockCtx) {
            draw(_canvasCtx, blockX.value, blockY.value, l, r, 'fill')
            draw(_blockCtx, blockX.value, blockY.value, l, r, 'clip')

            _canvasCtx.drawImage(img, 0, 0, w, h)
            _blockCtx.drawImage(img, 0, 0, w, h)
            const _y = blockY.value - r * 2 - 1
            const imgData = _blockCtx.getImageData(blockX.value, _y, L, L)
            block.value.width = L
            _blockCtx.putImageData(imgData, 0, _y)
          }
        })

        document.addEventListener('mousemove', touchMoveEvent)
        document.addEventListener('mouseup', touchEndEvent)
      })

      onBeforeUnmount(() => {
        document.removeEventListener('mousemove', touchMoveEvent)
        document.removeEventListener('mouseup', touchEndEvent)
      })

      return {
        block,
        canvas,
        loadBlock,
        containerCls,
        sliderBox,
        refresh,
        sliderDown: start,
        touchStartEvent: start,
        touchMoveEvent,
        touchEndEvent
      }
    }
  })
</script>

<style lang="scss" scoped>
  @use '@/assets/iconfont.css';

  @mixin position() {
    position: absolute;
    left: 0;
    top: 0;
  }

  .slide-verify {
    position: relative;

    &-loading {
      @include position();
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      z-index: 999;
      animation: loading 1.5s infinite;
    }

    &-block {
      @include position();
    }

    &-refresh-icon {
      position: absolute;
      right: 0;
      top: 0;
      width: 34px;
      height: 34px;
      cursor: pointer;

      .iconfont {
        font-size: 34px;
        color: #fff;
      }
    }

    &-slider {
      position: relative;
      text-align: center;
      width: 100%;
      height: 40px;
      line-height: 40px;
      margin-top: 15px;
      background: #f7f9fa;
      color: #45494c;
      border: 1px solid #e4e7eb;

      &-mask {
        @include position();
        height: 40px;
        border: 0 solid #1991fa;
        background: #d1e9fe;

        &-item {
          @include position();
          width: 40px;
          height: 40px;
          background: #fff;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: background 0.2s linear;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background: #1991fa;

            .iconfont {
              color: #fff;
            }
          }

          &-icon {
            line-height: 1;
            font-size: 30px;
            color: #303030;
          }
        }
      }
    }

    .container-active &-slider-mask {
      height: 38px;
      border-width: 1px;

      &-item {
        height: 38px;
        top: -1px;
        border: 1px solid #1991fa;
      }
    }

    .container-success &-slider-mask {
      height: 38px;
      border: 1px solid #52ccba;
      background-color: #d2f4ef;

      &-item {
        height: 38px;
        top: -1px;
        border: 1px solid #52ccba;
        background-color: #52ccba !important;
      }

      .iconfont {
        color: #fff;
      }
    }

    .container-fail &-slider-mask {
      height: 38px;
      border: 1px solid #f57a7a;
      background-color: #fce1e1;

      &-item {
        height: 38px;
        top: -1px;
        border: 1px solid #f57a7a;
        background-color: #f57a7a !important;
      }

      .iconfont {
        color: #fff;
      }
    }

    .container-active &-slider-text,
    .container-success &-slider-text,
    .container-fail &-slider-text {
      display: none;
    }

    @keyframes loading {
      0% {
        opacity: 0.7;
      }
      100% {
        opacity: 1;
      }
    }
  }
</style>
