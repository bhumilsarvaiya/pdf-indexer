import Vue from 'vue'
import Dropzone from '@/components/Dropzone'

describe('Dropzone.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(Dropzone)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.hello h1').textContent)
      .toEqual('Welcome to Your Vue.js App')
  })
})
