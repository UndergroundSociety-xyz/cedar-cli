import * as chai from "chai"
import chaiAsPromised from 'chai-as-promised'
import {DescriptionStrategiesRegistry} from "../src/utils/description-strategies-registry"
import {DescriptionContext, IDescriptionStrategy} from "../src/utils/description"

chai.should()
chai.use(chaiAsPromised)

describe('ordinal description strategy', () => {
    const descriptionStrategy = DescriptionStrategiesRegistry.get('ordinal') as IDescriptionStrategy
    const descriptionContext = new DescriptionContext(descriptionStrategy)

    const config = {
        options: {
            supply: 1000
        },
        metadata: {
            collection: {
                name: 'test collection'
            }
        }
    }

    const stNumbers = [1, 21, 101, 1001]
    const ndNumbers = [2, 22, 102, 1002]
    const rdNumbers = [3, 23, 103, 1003]
    const thNumbers = [4, 11, 12, 13, 25, 104, 1004]

    stNumbers.forEach(number => {
        it(`should return ${number} suffixed with "st"`, async function () {
            const description = await descriptionContext.execute(config, [], number, '')

            description.slice(number.toString().length).startsWith('st').should.be.true
        })
    })

    ndNumbers.forEach(number => {
        it(`should return ${number} suffixed with "nd"`, async function () {
            const description = await descriptionContext.execute(config, [], number, '')

            description.slice(number.toString().length).startsWith('nd').should.be.true
        })
    })

    rdNumbers.forEach(number => {
        it(`should return ${number} suffixed with "rd"`, async function () {
            const description = await descriptionContext.execute(config, [], number, '')

            description.slice(number.toString().length).startsWith('rd').should.be.true
        })
    })

    thNumbers.forEach(number => {
        it(`should return ${number} suffixed with "th"`, async function () {
            const description = await descriptionContext.execute(config, [], number, '')

            description.slice(number.toString().length).startsWith('th').should.be.true
        })
    })

})
