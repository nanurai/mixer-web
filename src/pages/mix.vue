<template>
<div>
  <h1 class="title is-1">Let's Mix</h1>
  <h1 class="subtitle">Enter your Nano destination</h1>
  <div class="field">
    <div class="field has-addons">
      <div class="control">
        <input class="input is-medium"
        type="text"
        v-model="output" />
      </div>
      <div class="control">
        <button class="button is-primary is-medium"
          @click="onGoClicked"
          :class="{'is-loading': state === 'loading'}">
          Go
        </button>
      </div>
    </div>
    <transition name="fade">
    <p class="help is-danger" v-if="state === 'error'">
    This address is invalid
    </p>
    </transition>
  </div>
</div>
</template>

<script>
import Jobs from '@/api/jobs'
import * as Nano from 'nanocurrency'

export default {
  data() {
    return {
      output: '',
      error: null,
      state: ''
    }
  },
  watch: {
    output() {
      this.state = ''
      this.error = ''
    }
  },
  methods: {
    async onGoClicked() {
      const output = this.output

      if (!Nano.checkAddress(output)) {
        this.state = 'error'
        this.error = 'Incorrect address'
        return
      }

      this.state = 'loading'
      const job = await Jobs.create({ output })
      this.$router.push({ path: `/jobs/${job._id}` })
    }
  }
}
</script>

<style lang="scss" scoped>

input.input {
  min-width: 48rem;
  max-width: 75vw;
}

.help {
  font-size: 1.5rem;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.slide-fade-2-enter-active {
  transition: all .3s ease;
}
.slide-fade-2-leave-active {
  transition: all .3s cubic-bezier(0.5, 0.5, 0.8, 1.0);
}
.slide-fade-2-enter, .slide-fade-2-leave-to {
  transform: translateX(1.5rem);
  opacity: 0;
}
</style >
