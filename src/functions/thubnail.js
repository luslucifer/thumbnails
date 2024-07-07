// import * as cheerio from "cheerio";
const cheerio = require('cheerio')

class Thumbnails {
  constructor(id, ss = null, ep = null) {
    this.root = "https://rezka.ag";
    this.type_ = ss && ep ? "tv" : "movie";
    this.ep = ep;
    this.ss = ss;
    this.id = id;
    this.referer='https://rezka.ag/films/fiction/64667-furiosa-hroniki-bezumnogo-maksa-2024.html'
    this.headers = {
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Cookie": "PHPSESSID=031slo6eo99rf90ianee3sge7v; dle_user_taken=1; dle_user_token=31f6b0669cad6a46d2b7bb19e27d435a",
        "DNT": "1",
        "Host": "rezka.ag",
        "Referer": this.referer||"https://rezka.ag/films/fiction/64667-furiosa-hroniki-bezumnogo-maksa-2024.html",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0"
    };
    this.tmdbQry = `https://api.themoviedb.org/3/${this.type_}/${this.id}?api_key=f6f2a9e9b0f5eed81b4cabe35d5a9c1b`;
  }

  async getData() {
    const res = await fetch(this.tmdbQry, {
      headers: this.headers,
    });
    const data = await res.json();
    const year =
      this.type_ == "tv"
        ? data.first_air_date.slice(0, 4)
        : data.release_date.slice(0, 4);
    const title = this.type_ == "tv" ? data.name : data.title;
    return [title, year];
  }

  async search() {
    const [title, year] = await this.getData();
    const res = await fetch(
      `${this.root}/search/?do=search&subaction=search&q=${title}`,
      {
        headers: this.headers
      }
    );
    const html = await res.text();
    // return html
    const $ = cheerio.load(html);
    const hrefs = [];
    $("a").each((index, element) => {
      const h = $(element).attr("href");
      if (h) {
        hrefs.push(h);
      }
    });

    const pattern = new RegExp(`-${year}.html`, "gm");
    const targetLink = hrefs.find((link) => pattern.test(link));

    if (this.type_ == "tv") {
      return `${targetLink}#t:111-s:${this.ss}-e:${this.ep}`;
    }
    return targetLink;
  }

  async getThumbnail(link) {
    const res = await fetch(link, {
      headers:this.headers,
    });
    const data = await res.text();
    // return data
    const pattern = /\\\/ajax\\\/get_cdn_tiles\\\/\d\\\/\d+\\\/\?t=\d+/gm;
    const tLink = data.match(pattern);
    return `${this.root}${tLink[0].replace(/\\/g, "")}`;
  }

  async main() {
    const targetLink = await this.search();
    // return targetLink
    this.referer = targetLink
    const thumbnail = await this.getThumbnail(targetLink)
    // console.log(this.headers)
    return thumbnail;
  }
}

// Example usage:
// const t = new Thumbnails(1399, 1, 1).main();
module.exports =Thumbnails