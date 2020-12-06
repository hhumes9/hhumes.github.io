
/* * * * * * * * * * * * * *
*      NameConverter       *
* * * * * * * * * * * * * */

class NameConverter {
    constructor() {
        this.countries = [
            ['Tanzania', 'United Rep. of Tanzania'],
            ['United States of America', 'USA'],
            ['Dem. Rep. Congo', 'Dem. Rep. of the Congo'],
            ['Russia', 'Russian Federation'],
            ['Falkland Is.', 'Falkland Isds (Malvinas)'],
            ['Fr. S. Antarctic Lands', 'Fr. South Antarctic Terr.'],
            ['South Africa', 'So. African Customs Union'],
            ['Lesotho', 'So. African Customs Union'],
            ['Bolivia', 'Bolivia (Plurinational State of)'],
            ['Puerto Rico', 'USA'],
            ['Botswana', 'So. African Customs Union'],
            ['Namibia', 'So. African Customs Union'],
            ['Eq. Guinea', 'Equatorial Guinea'],
            ['eSwatini', 'So. African Customs Union'],
            ['Palestine', 'State of Palestine'],
            ['Laos', 'Lao People\'s Dem. Rep.'],
            ['Vietnam', 'Viet Nam'],
            ['South Korea', 'Rep. of Korea'],
            ['Moldova', 'Rep. of Moldova'],
            ['Luxembourg', 'Belgium-Luxembourg'],
            ['Belgium', 'Belgium-Luxembourg'],
            ['Solomon Is.', 'Solomon Isds'],
            ['Taiwan', 'China'],
            ['Brunei', 'Brunei Darussalam'],
            ['N. Cyprus', 'Cyprus'],
            ['Somaliland', 'Somalia'],
            ['Bosnia and Herz.', 'Bosnia Herzegovina'],
            ['Macedonia', 'TFYR of Macedonia'],
            ['S. Sudan', 'South Sudan'],
        ]
    }

    // check if map country is in converter, then convert
    getTradeName(input){
        let that = this
        let output = '';
        let col1 = that.countries.map(v => v[0])
        let n = col1.find(x=> x === input)
        if (typeof n !== 'undefined') {
            that.countries.forEach(country => {
                if (country[0] === input) {
                    output = country[1]
                }
            })
            return output
        } else {
            return false
        }
    }

    // getMapName(input){
    //     let that = this
    //     let output = '';
    //     let col2 = that.countries.map(v => v[1])
    //     console.log('col2', col2)
    //     let n = col2.find(x=> x === input)
    //     if (typeof n !== 'undefined') {
    //         that.countries.forEach( country => {
    //             if (country[1] === input){
    //                 output = country[0]
    //             }})
    //     } else {
    //         output = input
    //     }
    //
    //     return output
    // }
}

let nameConverter = new NameConverter()



