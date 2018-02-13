const nlp = require('compromise')
const _ = require('lodash')

module.exports = function (self) {
  self.addEventListener('message', async function (msg) {
    let data = msg.data
    let lines = data.lines
    page_no = data.page

    async function refine (data, page, type, extracted, bool) {
      data = await nlp(nlp(data).trim().out('normal')).toTitleCase().out()
      if (isRemovable(data[data.length - 1]) && bool) {
        data = data.slice(0, -1)
      }
      if (isRemovable(data[0]) && bool) {
        data = data.slice(1)
      }
      let index = _.findIndex(extracted, {value: data})
      if (index === -1) {
        extracted.push({value: data, pages: [page], type: type})
      }
    }

    async function getPeople (data, page) {
      let extractedData = []
      let peoples = nlp(data).people().trim().map((m) => m.out('text'))
      for (let i = 0; i < peoples.length; i++) {
        let people = peoples[i]
        if (nlp(people).has('#TitleCase') && nlp(people).has('#FirstName') && nlp(people).has('#LastName') && !(nlp(people).has('#Possessive')) && (nlp(people).terms().length < 5)) {
          await refine(people, page, 'Person', extractedData, true)
        }
      }
      return extractedData
    }

    async function getPlaces (data, page) {
      let extractedData = []
      let places = await nlp(data).places().trim().map((m) => m.out('text'))
      for (let i = 0; i < places.length; i++) {
        let place = places[i]
        if (nlp(place).has('#TitleCase')) {
          await refine(place, page, 'Place', extractedData, true)
        }
      }
      return extractedData
    }

    async function getUrls (data, page) {
      let extractedData = []
      let urls = await nlp(data).urls().trim().map((m) => m.out('text'))
      for (let i = 0; i < urls.length; i++) {
        let url = urls[i]
        await refine(url, page, 'URL', extractedData, true)
      }
      return extractedData
    }

    async function getOrganizations (data, page) {
      let extractedData = []
      let organizations = await nlp(data).organizations().trim().map((m) => m.out('text'))
      for ( let i = 0; i < organizations.length; i++) {
        let organization = organizations[i]
        if (nlp(organization).has('#TitleCase')) {
          await refine(organization, page, 'Organization', extractedData, true)
        }
      }
      return extractedData
    }

    async function getDates (data, page) {
      let extractedData = []
      let dates = await nlp(data).dates().trim().map((m) => m.out('text'))
      for (let i = 0; i < dates.length; i++) {
        let date = dates[i]
        if (nlp(date).has('#NumericValue') && !(nlp(date).has('#Comparable')) && !(nlp(date).has('#Adjective'))) {
          await refine(date, page, 'Date', extractedData, true)
        }
      }
      return extractedData
    }

    async function getQuotes (data, page) {
      let extractedData = []
      let quotations = await nlp(data).quotations().trim().map((m) => m.out('text'))
      for (let i = 0; i < quotations.length; i++) {
        let quote = quotations[i]
        await refine(quote, page, 'Quote', extractedData, false)
      }
      return extractedData
    }

    function isRemovable (ch) {
      return ch.match(/["',;:.}{? ]/)
    }

    function mergePageData (page, lines) {
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
    }

    function sort (page) {
      let orderedPage = {}
      _(page).keys().sort().each(function (key) {
        orderedPage[key] = _.orderBy(page[key], ['value'], ['asc'])
      })
      page = orderedPage
    }

    let line = await nlp(lines).sentences().map((m) => m.out('text'))
    let pageData = []
    for (let i = 0; i < line.length; i++) {
      let data = line[i]
      let peoples = await getPeople(data, page_no)
      let places = await getPlaces(data, page_no)
      let organizations = await getOrganizations(data, page_no)
      let dates = await getDates(data, page_no)
      let quotations = await getQuotes(data, page_no)
      let urls = await getUrls(data, page_no)
      let lineData = await peoples.concat(places).concat(organizations).concat(dates).concat(quotations).concat(urls)
      await mergePageData(pageData, lineData)
    }
    sort(pageData)
    self.postMessage({result: pageData})
  })
}
