<template>
<div>
  <div v-if="!job">
    <spinner message="loading"
             :speed="0.7"
             size="large"
             :line-fg-color="mainColor"
             text-fg-color="#fff" />
  </div>
  <div v-else>
    <h1 class="title is-1">Ready to go</h1>
    <h2 class="subtitle">
      Send Nano to the below address and leave browser open
    </h2>
    <div>
      <div class="tag is-large is-info">
        {{ job.input }}
      </div>
    </div>
    <div class="is-divider"></div>
    <h1 class="title">Status</h1>
    <div class="socket-status">
      <spinner :speed="0.35" :line-fg-color="mainColor" />
      <h2 class="subtitle">
        {{ status }}
      </h2>
    </div>
    <div class="is-divider" />
    <h1 class="title">Details</h1>
    <div class="tags has-addons">
      <div class="tag is-info is-medium">
        Destination
      </div>
      <div class="tag is-primary is-medium">
        {{ job.output }}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Jobs from '@/api/jobs'
import Spinner from 'vue-simple-spinner'
import socketio from 'socket.io-client'

export default {
  data() {
    return {
      state: 'loading',
      job: null,
      socket: null,
      mainColor: '#f72c7a',
      status: 'Waiting for Nano',
      workQueue: [],
      running: false
    }
  },
  components: {
    Spinner
  },
  async mounted() {
    this.state = 'loading'
    try {
      const job = await Jobs.get(this.$route.params.id)
      if (!job) { this.$router.push('/mix') }
      this.job = job
      this.connect()
    } catch (error) {
      this.$router.push('/mix')
    }
  },
  methods: {
    connect() {
      const id = this.job._id
      const query = { id }
      this.socket = socketio(`${window.location.host}`, {
        resource: '/connect', query
      })
    },
    onUpdate(data) {
    },
    completedWork(work, hash, block) {
      const data = { work: work, blockHash: block }
      this.$socket.emit('work#completed', data)
    },
    async onWork({ block, hash }) {
      if (this.running) {
        this.workQueue.push({ block, hash })
        return
      }

      this.running = true

      if (window.powCPU) {
        console.log('hashy')
        console.log(hash)
        const NUM_THREADS = 3
        const workers = window.pow_initiate(NUM_THREADS, '/static/lib/pow/')
        window.pow_callback(workers, hash, () => {
          this.status = 'Computing Work'
        }, (data) => {
          this.status = 'Work computed'
          this.completedWork(data, hash, block)

          this.running = false
          if (this.workQueue.length > 0) {
            this.onWork(this.workQueue.shift())
          }
        })
      }
    }
  },
  sockets: {
    connect() {
      this.$socket.emit('subscribe#job', this.$route.params.id)
    },
    disconnect() {
    },
    work({ block, hash }) {
      this.onWork({ block, hash })
    }
  }
}
</script>

<style lang="scss" scoped>
.socket-status {
  margin-top: 2em;
  margin-bottom: 2em;
  display: flex;
  align-items: center;

  .subtitle {
    margin-left: 1em;
  }
}

.detail {
  display: flex;
  align-items: flex-stop;
}
</style>

<style lang="scss">
.socket-status div.vue-simple-spinner {
  margin: 0 !important;
}
</style>
