<template>
  <div class="hello">
    <div class="container-fuild main-container">
      <div class="row row-main">
        <!-- <div class="col-md-7 pdf"> -->
          <!-- <pdf class="pdf" src="../../static/test.pdf" :page="page" @progress="change($event)" @num-pages="totalPages = $event"></pdf> -->
          <!-- <embed type="application/pdf" id="pdf" src="../../static/Critical_Survey_of_World Literature_V1.pdf" width="100%" height="100%" @click="embedClick()"/>
        </div> -->
        <div class="col-md-12 nlp-div">
          <div class="row nlp-div-row">
            <div class="col-md-12 nlp">
              <br>
              <input type="button" value="Start Indexing" @click="compromise()"/>
              <div v-if="progress || extracted">
                <br>
                  <b-progress :value="counter" height="2rem" variant="success" show-progress animated v-if="progress"></b-progress>
                  <span v-if="extracted">Extraction complete. Creating Index Now...</span>
                <br>
              </div>
              <div v-if="indexProgress || indexed">
                <br>
                  <b-progress :value="index" height="2rem" variant="success" show-progress animated v-if="indexProgress"></b-progress>
                  <span v-if="indexed">Indexing completed</span>
                <br>
              </div>
              <template v-for="(datas, key) in indexedData" v-if="datas.length > 0">
                <div align="left">
                  <h2>{{key}}</h2>
                </div>
                <div align="left" v-for="data in datas">
                  <span>
                    &nbsp;
                    <b>{{data.value}}</b>
                    <i>({{data.type}})</i>
                    &nbsp;{{data.pages}}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="row navigation-row">
        <div class="col-md-7" style="vertical-align: center;">
          <span @click="previous()"><icon name="caret-left" scale="1.5" v-if="page != 1"></icon></span> -->
          <!-- <span><input type="number" :value=page :max="totalPages" min=1 @change=""/></span> -->
          <!-- <span>{{ page }}</span> -->
          <!-- &nbsp;
          <span @click="next()"><icon name="caret-right" scale="1.5" v-if="page < totalPages"></icon></span>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import pdf from 'vue-pdf'
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import $ from 'jquery'
let filePath = '../../static/Critical_Survey_of_World Literature_V1.pdf'
// let extract = require('pdf-text-extract')
const _ = require('lodash')
// let fs = require('fs')
const nlp = require('compromise')
// let natural = require('natural')
const distance = require('jaro-winkler')
// const trie = require('../assets/js/trie.js')

const worker1 = new Worker('../../static/getPageData.js')
const worker2 = new Worker('../../static/getPageData.js')
const worker3 = new Worker('../../static/getPageData.js')

Vue.use(BootstrapVue)

export default {
  name: 'HelloWorld',
  components: {
    Icon, pdf
  },
  data () {
    return {
      page: 1,
      totalPages: 0,
      counter: 0,
      progress: false,
      extracted: false,
      indexProgress: false,
      indexed: false,
      index: 0,
      indexedData: {
        '0...9': [],
        'A': [],
        'B': [],
        'C': [],
        'D': [],
        'E': [],
        'F': [],
        'G': [],
        'H': [],
        'I': [],
        'J': [],
        'K': [],
        'L': [],
        'M': [],
        'N': [],
        'O': [],
        'P': [],
        'Q': [],
        'R': [],
        'S': [],
        'T': [],
        'U': [],
        'V': [],
        'W': [],
        'X': [],
        'Y': [],
        'Z': [],
        'Quotes': []
      }
    }
  },
  mounted () {
    // console.log(natural.JaroWinklerDistance('Hi, how are you?', 'Hi, hw are you,'))
    // this.$Progress.start()
    $('#pdf').mouseup(function () {
      let selection
      if (window.getSelection) {
        console.log(document.getElementById('pdf').selection)
        selection = window.getSelection()
      } else if (document.selection) {
        selection = document.selection.createRange()
      }
      alert(selection.toString())
    })
  },
  methods: {
    change (status) {
      if (parseInt(status * 100) !== 100) {
        // this.$Progress.set(parseInt(status * 100))
      } else {
        // this.$Progress.finish()
      }
    },
    next () {
      this.page++
    },
    previous () {
      this.page--
    },
    getHead (data) {
      if (data.type === 'Quote') {
        return 'Quotes'
      } else if (this.isAlpha(data.value[0])) {
        return data.value[0].toUpperCase()
      } else {
        return '0...9'
      }
    },
    async updateIndex (pageData) {
      for (let i = 0; i < pageData.length; i++) {
        let data = pageData[i]
        let type = this.getHead(data)
        this.insertData(type, data)
      }
    },
    insertData (type, data) {
      for (let i = 0; i < this.indexedData[type].length; i++) {
        if (parseInt(distance(this.indexedData[type][i].value, data.value) * 100) >= 89) {
          this.indexedData[type][i].pages = this.indexedData[type][i].pages.concat(data.pages)
          return
        }
        if (this.indexedData[type][i].value.localeCompare(data.value) === 1) {
          this.indexedData[type].splice(i, 0, data)
          return
        }
      }
      this.indexedData[type].push(data)
    },
    isAlpha (ch) {
      return ch.match(/^[a-zA-Z]$/)
    },
    async compromise () {
      // this.progress = true
      // this.extracted = false
      // this.counter = 0
      // this.indexProgress = false
      // this.indexed = false
      // this.index = 0
      let extractedData = []
      console.time('runtime')
      console.time('pdf read time')
      let PDFJS = require('pdfjs-dist')
      let pdf = await PDFJS.getDocument(filePath)
      console.timeEnd('pdf read time')
      var maxPages = pdf.pdfInfo.numPages
      for (let j = 1; j <= maxPages; j++) {
        let page = await pdf.getPage(j)
        let textContent = await page.getTextContent()
        let lines = await textContent.items.map(function (s) { return s.str }).join(' ')
        console.log(JSON.stringify({lines: lines, page: page.pageIndex, nlp: nlp, lodash: _}))
        if (j % 3 === 0) {
          worker1.postMessage(JSON.stringify({lines: lines, page: page.pageIndex, nlp: nlp, lodash: _}))
        } else if (j % 3 === 1) {
          worker2.postMessage(JSON.stringify({lines: lines, page: page.pageIndex, nlp: nlp, lodash: _}))
        } else {
          worker3.postMessage(JSON.stringify({lines: lines, page: page.pageIndex, nlp: nlp, lodash: _}))
        }
        // this.counter = parseInt((j * 100) / maxPages)
      }
      console.timeEnd('runtime')
      worker1.onmessage = function (msg) {
        let result = msg.data
        this.updateIndex(result.result)
      }
      worker2.onmessage = function (msg) {
        let result = msg.data
        this.updateIndex(result.result)
      }
      worker3.onmessage = function (msg) {
        let result = msg.data
        this.updateIndex(result.result)
      }
      // this.progress = false
      // this.extracted = true
      // this.indexProgress = true
      // this.extracted = false
      // this.indexProgress = false
      // this.indexed = true
      // console.log(extractedData.length)
    },
    embedClick () {
      // alert(window.getSelection().toString())
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.main-container {
  margin: 30px;
  margin-top: 0px;
  width: auto;
}
.navigation-row {
  margin-top: 10px;
}
.pdf {
  border: 1px solid black;
  display: inline-block;
  width: 59%;
}
.nlp-div {
  height: inherit;
}
.nlp-div-row {
  height: 100%;
  /* padding-right: 80px; */
}
.nlp {
  height: inherit;
  /* border: 1px solid black; */
}
.row-main {
  /* height: auto; */
  height: 800px;
}
</style>
