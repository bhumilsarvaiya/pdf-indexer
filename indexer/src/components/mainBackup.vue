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
              <template v-for="(datas, key) in indexedData">
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
let _ = require('lodash')
let nlp = require('compromise')

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
      indexedData: {}
    }
  },
  mounted () {
    this.$Progress.start()
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
        this.$Progress.set(parseInt(status * 100))
      } else {
        this.$Progress.finish()
      }
    },
    next () {
      this.page++
    },
    previous () {
      this.page--
    },
    async compromise () {
      this.progress = true
      this.extracted = false
      this.counter = 0
      this.indexProgress = false
      this.indexed = false
      this.index = 0
      let extractedData = []
      console.time('runtime')
      console.time('pdf read time')
      let PDFJS = require('pdfjs-dist')
      let pdf = await PDFJS.getDocument(filePath)
      console.timeEnd('pdf read time')
      var maxPages = pdf.pdfInfo.numPages
      for (let j = 1; j <= maxPages; j++) {
        this.counter = parseInt((j * 100) / maxPages)
        let page = await pdf.getPage(j)
        let textContent = await page.getTextContent()
        let lines = await textContent.items.map(function (s) { return s.str }).join(' ')
        let line = await nlp(lines).sentences().map((m) => m.out('text'))
        line.forEach(async function (text) {
          function isRemovable (ch) {
            return /["',;:.}{? ]/i.test(ch)
          }

          let people = await nlp(text).people().trim().map((m) => m.out('text'))
          for (let i = 0; i < people.length; i++) {
            if (nlp(people[i]).has('#TitleCase') && nlp(people[i]).has('#FirstName') && nlp(people[i]).has('#LastName') && !(nlp(people[i]).has('#Possessive'))) {
              people[i] = nlp(nlp(people[i]).trim().out('normal')).toTitleCase().out()
              if (isRemovable(people[i][people[i].length - 1])) {
                people[i] = people[i].slice(0, -1)
              }
              if (isRemovable(people[i][0])) {
                people[i] = people[i].slice(1)
              }
              let index = _.findIndex(extractedData, {value: people[i]})
              if (index === -1) {
                extractedData.push({value: people[i], pages: [], type: 'Person'})
                index = extractedData.length - 1
              }
              if (!_.includes(extractedData[index].pages, page.pageIndex)) { extractedData[index].pages.push(page.pageIndex) }
            }
          }
          let places = await nlp(text).places().trim().map((m) => m.out('text'))
          for (let i = 0; i < places.length; i++) {
            if (nlp(places[i]).has('#TitleCase')) {
              places[i] = nlp(nlp(places[i]).trim().out('normal')).toTitleCase().out()
              if (isRemovable(places[i][places[i].length - 1])) {
                places[i] = places[i].slice(0, -1)
              }
              if (isRemovable(places[i][0])) {
                places[i] = places[i].slice(1)
              }
              let index = _.findIndex(extractedData, {value: places[i]})
              if (index === -1) {
                extractedData.push({value: places[i], pages: [], type: 'Place'})
                index = extractedData.length - 1
              }
              if (!_.includes(extractedData[index].pages, page.pageIndex)) { extractedData[index].pages.push(page.pageIndex) }
            }
          }
          let organizations = await nlp(text).organizations().trim().map((m) => m.out('text'))
          for (let i = 0; i < organizations.length; i++) {
            if (nlp(organizations[i]).has('#TitleCase')) {
              let index = _.findIndex(extractedData, {value: organizations[i]})
              if (isRemovable(organizations[i][organizations[i].length - 1])) {
                organizations[i] = organizations[i].slice(0, -1)
              }
              if (isRemovable(organizations[i][0])) {
                organizations[i] = organizations[i].slice(1)
              }
              if (index === -1) {
                extractedData.push({value: organizations[i], pages: [], type: 'Organization'})
                index = extractedData.length - 1
              }
              if (!_.includes(extractedData[index].pages, page.pageIndex)) { extractedData[index].pages.push(page.pageIndex) }
            }
          }
          let dates = await nlp(text).dates().trim().map((m) => m.out('text'))
          for (let i = 0; i < dates.length; i++) {
            if (nlp(dates[i]).has('#NumericValue') && !(nlp(dates[i]).has('#Comparable')) && !(nlp(dates[i]).has('#Adjective'))) {
              dates[i] = nlp(nlp(dates[i]).trim().out('normal')).toTitleCase().out()
              if (isRemovable(dates[i][dates[i].length - 1])) {
                dates[i] = dates[i].slice(0, -1)
              }
              if (isRemovable(dates[i][0])) {
                dates[i] = dates[i].slice(1)
              }
              let index = _.findIndex(extractedData, {value: dates[i]})
              if (index === -1) {
                extractedData.push({value: dates[i], pages: [], type: 'Date'})
                index = extractedData.length - 1
              }
              if (!_.includes(extractedData[index].pages, page.pageIndex)) { extractedData[index].pages.push(page.pageIndex) }
            }
          }
          let urls = await nlp(text).urls().trim().map((m) => m.out('text'))
          for (let i = 0; i < urls.length; i++) {
            let index = _.findIndex(extractedData, {value: urls[i]})
            if (isRemovable(urls[i][urls[i].length - 1])) {
              urls[i] = urls[i].slice(0, -1)
            }
            if (isRemovable(urls[i][0])) {
              urls[i] = urls[i].slice(1)
            }
            if (index === -1) {
              extractedData.push({value: urls[i], pages: [], type: 'url'})
              index = extractedData.length - 1
            }
            if (!_.includes(extractedData[index].pages, page.pageIndex)) { extractedData[index].pages.push(page.pageIndex) }
          }
          let quotations = await nlp(text).quotations().trim().map((m) => m.out('text'))
          for (let i = 0; i < quotations.length; i++) {
            let index = _.findIndex(extractedData, {value: quotations[i]})
            if (index === -1) {
              extractedData.push({value: quotations[i], pages: [], type: 'Quotation'})
              index = extractedData.length - 1
            }
            if (!_.includes(extractedData[index].pages, page.pageIndex)) { extractedData[index].pages.push(page.pageIndex) }
          }
        })
      }
      console.timeEnd('runtime')
      this.progress = false
      this.extracted = true
      this.indexProgress = true

      function isAlpha (ch) {
        return /^[a-zA-Z]$/i.test(ch)
      }

      function isQuote (ch) {
        return /["]/i.test(ch)
      }

      let indexedData = {}
      for (let i = 0; i < extractedData.length; i++) {
        this.index = parseInt((i * 100) / extractedData.length)
        if (isAlpha(extractedData[i].value[0])) {
          let character = extractedData[i].value[0].toUpperCase()
          indexedData[character] = indexedData[character] ? indexedData[character] : []
          indexedData[character].push(extractedData[i])
        } else if (isQuote(extractedData[i].value[0])) {
          indexedData['"Quotes"'] = indexedData['"Quotes"'] ? indexedData['"Quotes"'] : []
          indexedData['"Quotes"'].push(extractedData[i])
        } else {
          indexedData['0...9'] = indexedData['0...9'] ? indexedData['0...9'] : []
          indexedData['0...9'].push(extractedData[i])
        }
      }

      let ordered = {}
      _(indexedData).keys().sort().each(function (key) {
        ordered[key] = _.orderBy(indexedData[key], ['value'], ['asc'])
      })
      this.extracted = false
      this.indexProgress = false
      this.indexed = true
      console.log(extractedData.length)
      this.indexedData = ordered
      // this.extractedData = extractedData
      // extract(filePath, (err, pages) => {
      //   console.timeEnd('pdf read time')
      //   if (err) console.error(err)
      //   let topics = []
      //   pages.forEach((page, pageNo) => {
      //     datas.forEach((data) => {
      //       let index = _.findIndex(topics, {topic: data})
      //       if (index === -1) {
      //         topics.push({topic: data, occurence: 0, pages: []})
      //         index = topics.length - 1
      //       }
      //       topics[index].occurence++
      //       if (!_.includes(topics[index].pages, pageNo + 1)) { topics[index].pages.push(pageNo + 1) }
      //     })
      //   })
      //   console.dir(topics, {depth: null})
      //   console.timeEnd('runtime')
      // })
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
