const cheerio = require('cheerio')


 class Thubnails{
    constructor(id,ss=null,ep=null){
         this.root = 'https://rezka.ag'
        this.type_  = ss&&ep ? 'tv' :'movie' 
        this.ep = ep
        this.ss = ss
        this.id = id
        this.tmdbQry = `https://api.themoviedb.org/3/${this.type_}/${this.id}?api_key=f6f2a9e9b0f5eed81b4cabe35d5a9c1b`

     }
async  getData(){
    const res = await fetch (this.tmdbQry)
    const data = await res.json()
    const year = this.type_ == 'tv' ? data.first_air_date.slice(0,4): data.release_date.slice(0,4)
    const title = this.type_ == 'tv' ? data.name :data.title
    return  [title,year] 
}
 
 async search(){
    const [title,year] = await this.getData()
    const res  = await fetch(`${this.root}/search/?do=search&subaction=search&q=${title}`)
    // console.log(res.text())
    const html = await res.text()
    const $ = cheerio.load(html)
    const hrefs = [];
        $('a').each((index, element) => {
            const h = $(element).attr('href');
            if (h) {
                hrefs.push(h);
            }
        });

        // console.log(hrefs);
        const pattern = new RegExp(`-${year}.html`, 'gm')
        const targetLink   = hrefs.find(link =>{
            return pattern.test(link)
        }) 
        // console.log(tergetLink)
        if(this.type_=='tv'){
            return `${targetLink}#t:111-s:${this.ss}-e:${this.ep}`
        }
        return targetLink
        // return hrefs;
     }
     async getThubnail(link){
        const res = await fetch(link)
        const data  = await res.text()
        const pattern = /\\\/ajax\\\/get_cdn_tiles\\\/\d\\\/\d+\\\/\?t=\d+/gm;
const  tLink = data.match(pattern); // Output: true
        return `${this.root}${tLink[0].replace(/\\/g,'')}`
     }

     async main(){
        const targetLink = await this.search()
        console.log(targetLink)
        const thumbnailLink = await this.getThubnail(targetLink)
        console.log(thumbnailLink)
        return thumbnailLink
     }
} 
module.exports = Thubnails
// const  t = new Thubnails(299536).main()