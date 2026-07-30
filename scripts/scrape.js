const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

async function scrape() {
  console.log('Fetching main page...')
  const mainRes = await fetch('https://waecsyllabus.com/')
  const mainHtml = await mainRes.text()
  const $ = cheerio.load(mainHtml)

  const subjects = []

  // Extract all subjects from the homepage
  $('.subject-card').each((i, el) => {
    const title = $(el).find('.subject-name').text().trim()
    
    // Find the view online link
    let link = ''
    $(el).find('.download-option').each((j, option) => {
      if ($(option).text().includes('View Online')) {
        link = $(option).attr('href')
      }
    })

    if (title && link) {
      if (!link.startsWith('http')) {
        link = `https://waecsyllabus.com${link}`
      }
      subjects.push({ title, link })
    }
  })

  console.log(`Found ${subjects.length} subjects. Starting scrape...`)

  const results = []

  // Fetch each subject page
  for (let i = 0; i < subjects.length; i++) {
    const { title, link } = subjects[i]
    console.log(`[${i+1}/${subjects.length}] Fetching ${title}...`)
    
    try {
      const res = await fetch(link)
      const html = await res.text()
      const $page = cheerio.load(html)
      
      // The syllabus content is usually within the main article or content area
      // Let's try to extract the main content div
      const contentHtml = $page('.entry-content').html() || $page('article').html() || ''
      const textContent = $page('.entry-content').text().replace(/\n\s*\n/g, '\n').trim()

      results.push({
        title,
        source: link,
        contentHtml,
        textContent: textContent.substring(0, 1000) + (textContent.length > 1000 ? '...' : '') // Just a preview if it's too long, or store full text? Let's store full text
      })
      
      // small delay to avoid overwhelming the server
      await new Promise(r => setTimeout(r, 500))
    } catch (e) {
      console.error(`Failed to fetch ${title}:`, e.message)
    }
  }

  const outPath = path.join(__dirname, '..', 'data', 'syllabus.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2))
  
  console.log(`Saved ${results.length} syllabuses to ${outPath}`)
}

scrape()
