<template>
  <div class="hello">
    <div class="container-fuild main-container">
      <div class="row row-main">
        <div class="col-md-12 nlp-div">
          <div class="row nlp-div-row">
            <div class="col-md-12 nlp">
              <br>
                <el-button type="warning" icon="el-icon-search" @click="compromise()">Start Indexing</el-button>
                <el-button type="info" v-if="download" icon="el-icon-download" @click="downloadRtf()">Download .rtf</el-button>
              <br>
              <div class="row options">
                <div class="col-md-3 main-range">
                  <div class="row">
                    <div class="col-md-2 range">
                      <span><b>Pages</b></span>
                    </div>
                    <div class="col-md-7 range2">
                      <div v-if="totalPages">
                        <el-slider v-model="range" range :min="1" :max="totalPages"></el-slider>
                      </div>
                    </div>
                    <div class="col-md-3 range3">
                      <b>[{{range[0]}} - {{range[1]}}]</b>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 checks">
                  <div class="row">
                    <div class="col-md-2 filter" align="right">
                      <span><b>Filters:</b></span>
                    </div>
                    <el-checkbox-group v-model="checkedMethods" size="medium">
                      <el-checkbox-button v-for="type in types" :label="type" :key="type">{{Types[type]}}</el-checkbox-button>
                    </el-checkbox-group>
                  </div>
                </div>
                <div class="col-md-3 checks2">
                  <span><b>Group By:</b></span>
                  <el-radio-group v-model="groupBy" size="medium" fill="#40ff6b" text-color="#000000">
                    <el-radio-button label="alphabet"></el-radio-button>
                    <el-radio-button label="page"></el-radio-button>
                    <el-radio-button label="type"></el-radio-button>
                  </el-radio-group>
                </div>
              </div>
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
              <div class="row">
                <div class="col-md-5 view">
                  <template class="viewByAlpha" v-for="(datas, key) in indexedData" v-if="datas.length > 0 && groupBy === 'alphabet'">
                    <div align="left">
                      <h2>&nbsp;&nbsp;{{key}}</h2>
                    </div>
                    <div align="left" v-for="data in datas">
                      <span>
                        &nbsp;&nbsp;&nbsp;
                        <b>{{data.value}}</b>
                        <i>({{data.type}})</i>
                        &nbsp;
                        [
                        <template v-for="page, index in data.pages">
                          <span class="goto" v-if="index == data.pages.length - 1 && index !== 0" @click="showPage(page)">&nbsp;{{page}}</span>
                          <span class="goto" v-else-if="index == data.pages.length - 1" @click="showPage(page)">{{page}}</span>
                          <span class="goto" v-else-if="index == 0" @click="showPage(page)">{{page}},</span>
                          <span class="goto" v-else @click="showPage(page)">&nbsp;{{page}},</span>
                        </template>
                        ]
                      </span>
                    </div>
                  </template>
                  <template class="viewByPage" v-for="(datas, key) in indexedData3" v-if="datas.length > 0 && groupBy === 'page'">
                    <div align="left">
                      <h2 @click="showPage(parseInt(key))" class="goto">&nbsp;&nbsp;{{key}}</h2>
                    </div>
                    <div align="left" v-for="data in datas">
                      <span>
                        &nbsp;&nbsp;&nbsp;
                        <b>{{data.value}}</b>
                        <i>({{data.type}})</i>
                      </span>
                    </div>
                  </template>
                  <template class="viewByType" v-for="(datas, key) in indexedData2" v-if="datas.length > 0 && groupBy === 'type'">
                    <div align="left">
                      <h2>&nbsp;&nbsp;{{key}}</h2>
                    </div>
                    <div align="left" v-for="data in datas">
                      <span>
                        &nbsp;&nbsp;&nbsp;
                        <b>{{data.value}}</b>
                        &nbsp;
                        [
                        <template v-for="page, index in data.pages">
                          <span class="goto" v-if="index == data.pages.length - 1 && index !== 0" @click="showPage(page)">&nbsp;{{page}}</span>
                          <span class="goto" v-else-if="index == data.pages.length - 1" @click="showPage(page)">{{page}}</span>
                          <span class="goto" v-else-if="index == 0" @click="showPage(page)">{{page}},</span>
                          <span class="goto" v-else @click="showPage(page)">&nbsp;{{page}},</span>
                        </template>
                        ]
                      </span>
                    </div>
                  </template>
                </div>
                <div class="col-md-7 pdf-view" v-model="showPageModal" align="center">
                  <pdf class="markdown" :src="pdfToView" :page="pageToShow + 1" style="display: block; width: 80%; margin-top: 15px;"></pdf>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
let pdfUrl = 'http://localhost:8081/getFile/'
// let extract = require('pdf-text-extract')
const _ = require('lodash')
const PDFJS = require('pdfjs-dist')
// let fs = require('fs')
const nlp = require('compromise')
// let natural = require('natural')
const distance = require('jaro-winkler')
const jsPDF = require('jspdf')
let doc = new jsPDF()
const html2canvas = require('html2canvas')
const htmlToRtf = require('html-to-rtf')
// const trie = require('../assets/js/trie.js')

Vue.use(BootstrapVue)

export default {
  name: 'HelloWorld',
  components: {
    Icon, pdf
  },
  data () {
    return {
      page: 1,
      totalPages: false,
      showPageModal: false,
      pageToShow: 0,
      range:[0,0],
      minPage: 0,
      maxPage: 0,
      counter: 0,
      progress: false,
      extracted: false,
      indexProgress: false,
      indexed: false,
      index: 0,
      filename: null,
      download: false,
      pdf: null,
      checkedMethods: ['people', 'places', 'organizations', 'urls', 'dates', 'quotes'],
      groupBy: 'alphabet',
      types: ['people','places','organizations','urls','dates','quotes'],
      Types: {
        people: 'People',
        places: 'Places',
        organizations: 'Organizations',
        urls: 'URLs',
        dates: 'Dates',
        quotes: 'Quotes'
      },
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
      },
      indexedData2: {
        'People': [],
        'Place': [],
        'Organization': [],
        'URL': [],
        'Date': [],
        'Quote': []
      },
      indexedData3: {},
      pdfToView: null
    }
  },
  async mounted () {
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
    this.filename = this.$route.params.filename
    console.time('pdf read time')
    this.pdfToView = pdf.createLoadingTask(pdfUrl + this.filename)
    this.pdf = await PDFJS.getDocument(pdfUrl + this.filename)
    this.totalPages = this.pdf.numPages
    this.range[1] = this.totalPages
    this.range[0] = 1
    console.timeEnd('pdf read time')
  },
  methods: {
    downloadRtf () {
      let htmlContent = $('.view').html()
      let element = document.createElement('a');
      element.setAttribute('href', 'data:text/rtf;charset=utf-8,' + encodeURIComponent(htmlToRtf.convertHtmlToRtf(htmlContent)));
      element.setAttribute('download', 'index.rtf');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },
    showPage (page) {
      this.pageToShow = page
      this.showPageModal = true
    },
    showQoutes () {
      console.log(this.quotes)
    },
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
        this.insertData(type, data);
        this.insertData2(data);
      }
      if (pageData.length > 0) {
        this.indexedData3[pageData[0].pages[0]] = pageData;
      }
    },
    insertData (type, data) {
      for (let i = 0; i < this.indexedData[type].length; i++) {
        if (parseInt(distance(this.indexedData[type][i].value, data.value) * 100) >= 89) {
          this.indexedData[type][i].pages = _.union(this.indexedData[type][i].pages, data.pages)
          return
        }
        if (this.indexedData[type][i].value.localeCompare(data.value) === 1) {
          this.indexedData[type].splice(i, 0, data)
          return
        }
      }
      this.indexedData[type].push(data)
    },
    insertData2 (data) {
      for (let i = 0; i < this.indexedData2[data.type].length; i++) {
        if (parseInt(distance(this.indexedData2[data.type][i].value, data.value) * 100) >= 89) {
          this.indexedData2[data.type][i].pages = _.union(this.indexedData2[data.type][i].pages, data.pages)
          return
        }
        if (this.indexedData2[data.type][i].value.localeCompare(data.value) === 1) {
          this.indexedData2[data.type].splice(i, 0, data)
          return
        }
      }
      this.indexedData2[data.type].push(data)
    },
    async refine (data, page, type, extracted, bool) {
      data = await nlp(nlp(data).trim().out('normal')).toTitleCase().out()
      if (this.isRemovable(data[data.length - 1]) && bool) {
        data = data.slice(0, -1)
      }
      if (this.isRemovable(data[0]) && bool) {
        data = data.slice(1)
      }
      let index = _.findIndex(extracted, {value: data})
      if (index === -1) {
        extracted.push({value: data, pages: [page], type: type})
      }
    },
    async getPeople (data, page) {
      let extractedData = []
      let peoples = nlp(data).people().trim().map((m) => m.out('text'))
      for (let i = 0; i < peoples.length; i++) {
        let people = peoples[i]
        if (nlp(people).has('#TitleCase') && nlp(people).has('#FirstName') && nlp(people).has('#LastName') && !(nlp(people).has('#Possessive')) && (nlp(people).terms().length < 5)) {
          await this.refine(people, page, 'People', extractedData, true)
        }
      }
      return extractedData
    },
    async getPlaces (data, page) {
      let extractedData = []
      let places = await nlp(data).places().trim().map((m) => m.out('text'))
      for (let i = 0; i < places.length; i++) {
        let place = places[i]
        if (nlp(place).has('#TitleCase')) {
          await this.refine(place, page, 'Place', extractedData, true)
        }
      }
      return extractedData
    },
    async getUrls (data, page) {
      let extractedData = []
      let urls = await nlp(data).urls().trim().map((m) => m.out('text'))
      for (let i = 0; i < urls.length; i++) {
        let url = urls[i]
        await this.refine(url, page, 'URL', extractedData, true)
      }
      return extractedData
    },
    async getOrganizations (data, page) {
      let extractedData = []
      let organizations = await nlp(data).organizations().trim().map((m) => m.out('text'))
      for ( let i = 0; i < organizations.length; i++) {
        let organization = organizations[i]
        if (nlp(organization).has('#TitleCase')) {
          await this.refine(organization, page, 'Organization', extractedData, true)
        }
      }
      return extractedData
    },
    async getDates (data, page) {
      let extractedData = []
      let dates = await nlp(data).dates().trim().map((m) => m.out('text'))
      for (let i = 0; i < dates.length; i++) {
        let date = dates[i]
        if (nlp(date).has('#NumericValue') && !(nlp(date).has('#Adjective'))) {
          await this.refine(date, page, 'Date', extractedData, true)
        }
      }
      return extractedData
    },
    async getQuotes (data, page) {
      let extractedData = []
      let quotations = await nlp(data).quotations().trim().map((m) => m.out('text'))
      for (let i = 0; i < quotations.length; i++) {
        let quote = quotations[i]
        await this.refine(quote, page, 'Quote', extractedData, false)
      }
      return extractedData
    },
    isRemovable (ch) {
      return ch.match(/["',;:.}{? ]/)
    },
    mergePageData (page, lines) {
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        if (!_.includes(page, { value: line.value })) {
          for (let j = 0; j < page.length; j++) {
            let data = page[j]
            if (parseInt(distance(data.value, line.value) * 100) >= 90) {
              return;
            }
          }
          page.push(line)
        }
      }
    },
    sort (page) {
      let orderedPage = {}
      _(page).keys().sort().each(function (key) {
        orderedPage[key] = _.orderBy(page[key], ['value'], ['asc'])
      })
      page = orderedPage
    },
    async getPageData (page) {
      let textContent = await page.getTextContent()
      let lines = await textContent.items.map(function (s) { return s.str }).join(' ')
      let line = await nlp(lines).sentences().map((m) => m.out('text'))
      let pageData = []
      for (let i = 0; i < line.length; i++) {
        let data = line[i]
        let peoples = _.includes(this.checkedMethods, 'people') ? await this.getPeople(data, page.pageIndex) : []
        let places = _.includes(this.checkedMethods, 'places') ? await this.getPlaces(data, page.pageIndex) : []
        let organizations = _.includes(this.checkedMethods, 'organizations') ? await this.getOrganizations(data, page.pageIndex) : []
        let dates = _.includes(this.checkedMethods, 'dates') ? await this.getDates(data, page.pageIndex) : []
        let quotations = _.includes(this.checkedMethods, 'quotes') ? await this.getQuotes(data, page.pageIndex) : []
        let urls = _.includes(this.checkedMethods, 'urls') ? await this.getUrls(data, page.pageIndex) : []
        let lineData = await peoples.concat(places).concat(organizations).concat(dates).concat(quotations).concat(urls)
        await this.mergePageData(pageData, lineData)
      }
      this.sort(pageData)
      return pageData
    },
    async fetchAndUpdate (page) {
      let pageData = await this.getPageData(page)
      // console.log(pageData)
      this.updateIndex(pageData)
    },
    isAlpha (ch) {
      return ch.match(/^[a-zA-Z]$/)
    },
    async compromise () {
      this.download = false
      this.indexedData = {
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
      this.indexedData2 = {
        'People': [],
        'Place': [],
        'Organization': [],
        'URL': [],
        'Date': [],
        'Quote': []
      }
      this.indexedData3 = {}
      this.progress = true
      this.extracted = false
      this.counter = 0
      this.indexProgress = false
      this.indexed = false
      this.index = 0
      console.time('runtime')
      let maxPages = this.range[1]
      let startFrom = this.range[0]
      for (let j = startFrom; j <= maxPages; j++) {
        let page = await this.pdf.getPage(j)
        this.fetchAndUpdate(page)
        this.counter = parseInt((j * 100) / maxPages)
      }
      console.timeEnd('runtime')
      this.progress = false
      this.extracted = true
      this.indexProgress = true
      this.extracted = false
      this.indexProgress = false
      this.download = true
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
  background-color: #c5c1c130 !important;
}
.num {
  width: 80px;
}
ul {
  list-style-type: none;
  padding: 0;
}
.options {
  padding-bottom: 15px;
  margin-top: 15px;
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
.nlp-div-row {
  height: auto;
  margin-right: 80px;
  margin-left: 80px;
  padding-right: 50px;
  padding-left: 50px;
  background-color: #fcfcfc;
  box-shadow: 0px 0px 20px 5px #b7b6b66e;
}
.nlp {
  height: inherit;
  /* border: 1px solid black; */
}
.row-main {
  /* height: auto; */
  height: 800px;
}
.filter {
  padding-top: 7px;
}
.checks {
  padding: 0px;
  padding-top: 4px;
  border-right: 1px solid grey;
  border-left: 1px solid grey;
}
.checks2 {
  padding-top: 4px;
  border-right: 1px solid grey;
}
.range {
  padding-top: 10px;
  /* padding-right: 5px; */
}
.main-range {
  border-left: 1px solid grey;
}
.range2 {
  padding-top: 4px;
  padding-right: 8px;
}
.range3 {
  padding-top: 10px;
  padding-left: 2px;
  padding-right: 5px;
}
.goto {
  cursor: pointer;
  color: darkblue;
}
.marker {
  background-color: yellow;
  font-weight: bold;
}
div.ivu-modal-footer {
  display: none !important;
}
.vertical-center-modal{
  .ivu-modal{
    top: 0;
  }
  div.ivu-modal-footer {
    display: none !important;
  }
}
.view {
  overflow-y: scroll;
  height: 100vh;
}
.pdf-view {
  box-shadow: inset 0px 0px 20px 0px #0000002b;
}
::-webkit-scrollbar {
    width: 5px;
}
/* Track */
::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey;
    border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #274f91;
    border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
    background: #162b4f;
}
</style>
