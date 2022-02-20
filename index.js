"use strict"

const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

let data

async function getNews() {
  try {
    const { data: html } = await axios.get(
      "https://www.playlostark.com/en-us/news"
    )

    const $ = cheerio.load(html)
    const container = $(".ags-NewsLandingPage-contentWrapper")
    const post = $(container).find(".ags-SlotModule")[0]
    const title = $(post)
      .find(".ags-SlotModule-contentContainer-heading")
      .text()
      .trim()
    const url = `https://www.playlostark.com${$(post)
      .find("a")
      .attr("href")
      .trim()}`

    return {
      title,
      url
    }
  } catch (err) {
      console.err(err)
  }
}

async function start() {
  const { title, url } = await getNews()

  try {
    data = fs.readFileSync("title.dat", "utf8")
  } catch (err) {
    console.err(err)
  }

  if (title !== data) {
    console.log(`Sending new url: ${url}`)
    axios.post(process.env.DISCORD_WEBHOOK, { content: url })
    
    try {
      console.log(`Writing new title data: ${title}`)
      fs.writeFileSync("title.dat", title, { flag: "w+" })
    } catch (err) {
      console.err(err)
    }
  } else {
    console.log(`Title already exists: ${title}`)
    console.log(`Link: ${url}`)
  }
}

start()