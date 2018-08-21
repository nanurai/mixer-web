<template>
  <div id="app">
    <div class="hero is-dark is-fullheight">
      <div class="hero-body">
        <div class="container">
          <transition name="slide-fade">
            <router-view />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(2.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateX(1.5rem);
  opacity: 0;
}
</style>
