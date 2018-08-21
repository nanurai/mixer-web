
class POWService {

  constructor() {
    this.webGLTested = false
    this.webGLAvailable = false
    this.powPool = []
    this.parallelQueue = false
    this.processingQueueItem = false
  }

  determineBestPoWMethod() {
    if (this.hasWebGLSupport()) {
      return 'clientWebGL'
    }
    return 'server'
  }

  async getPow(hash) {
    const existingPoW = this.powPool.find(p => p.hash == hash)

    if (existingPoW) {
      return existingPoW.work || existingPoW.promise.promise
    }

    return this.addQueueItem(hash)
  }

  addQueueItem(hash) {
    const existingPow = this.powPool.find(p => p.hash == hash)
    if (existingPow) {
      return existingPow.work || existingPow.promise.promise
    }

    const queueItem = {
      hash,
      work: null,
      promise: this.getDeferredPromise(),
    }

    this.PowPool.push(queueItem)
    this.processQueue()

    return queueItem.promise.promise
  }

  hasWebGLSupport() {
    if (this.webGLTested) return this.webGLAvailable;

    this.webGLTested = true;
    try {
      const canvas = document.createElement('canvas')
      const webGL = !!window['WebGLRenderingContext'] && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      this.webGLAvailable = !!webGL
      return this.webGLAvailable
    } catch (e) {
      this.webGLAvailable = false
      return false
    }
  }

  processQueue() {
    if (!this.powPool.length) return // No items in the queue
    if (this.parallelQueue) return // Not yet implemented
    if (this.processingQueueItem) return // Already processing.
    // Get the next item from the queue and process it
    this.processNextQueueItem()
  }

  async processNextQueueItem() {
    this.processingQueueItem = true
    if (!this.PoWPool.length) return // Nothing in the queue?
    const queueItem = this.PoWPool[0]

    let powSource = this.appSettings.settings.powSource
    if (powSource === 'best') {
      powSource = this.determineBestPoWMethod()
    }

    let work;
    switch (powSource) {
      default:
      case 'server':
        work = (await this.api.workGenerate(queueItem.hash)).work
        break
      case 'clientCPU':
        work = await this.getHashCPUWorker(queueItem.hash)
        break
      case 'clientWebGL':
        work = await this.getHashWebGL(queueItem.hash)
        break
    }

    queueItem.work = work
    queueItem.promise.resolve(work)

    this.PoWPool.shift() // Remove this item from the queue
    this.processingQueueItem = false
    this.processQueue()

    return queueItem
  }

  getHashCPUSync(hash) {
    const response = this.getDeferredPromise()

    const PoW = mod.cwrap("launchPoW", 'string', ['string'])
    const start = Date.now()
    let work
    do { work = PoW(hash) } while (work == '0000000000000000')
    console.log(`Synchronous CPU: Found work (${work}) for ${hash} after ${(Date.now() - start) / 1000} seconds`)

    response.resolve(work)
    return response.promise
  }

  getHashCPUWorker(hash) {
    const response = this.getDeferredPromise()

    const start = Date.now()
    const NUM_THREADS = navigator.hardwareConcurrency < 4 ? navigator.hardwareConcurrency : 4
    const workers = window['pow_initiate'](NUM_THREADS, '/assets/lib/pow/')

    window['pow_callback'](workers, hash, () => {}, (work) => {
      console.log(`CPU Worker: Found work (${work}) for ${hash} after ${(Date.now() - start) / 1000} seconds [${NUM_THREADS} Workers]`);
      response.resolve(work)
    })

    return response.promise
  }

  getHashWebGL(hash) {
    const response = this.getDeferredPromise()

    const start = Date.now()
    try {
      window['NanoWebglPow'](hash, (work, n) => {
          console.log(`WebGL Worker: Found work (${work}) for ${hash} after ${(Date.now() - start) / 1000} seconds [${n} iterations]`)
          response.resolve(work)
        },
        n => {}
      )
    } catch(error) {
      if (error.message === 'webgl2_required') {
        this.webGLAvailable = false
      }
      response.reject(error)
    }

    return response.promise
  }

  getDeferredPromise() {
    const defer = {
      promise: null,
      resolve: null,
      reject: null,
    }

    defer.promise = new Promise((resolve, reject) => {
      defer.resolve = resolve
      defer.reject = reject
    })

    return defer
  }
}
