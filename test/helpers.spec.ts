import * as chai from "chai"
import {pickRandomIndex} from "../src/utils/helpers";

chai.should()

describe('random picker', () => {

    const chancesList = [
        [3334, 3333, 3333, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 333, 666, 6667, 0, 1000, 0, 334, 1000]
    ]

    chancesList.forEach(c => it('should pick an index in a list of 10 rarities with a 10% error margin', () => {
        const selectedIndexes: number[] = []
        const iterations = 100000
        let undefinedCount = 0

        for (let i = 0; i < iterations; i++) {
            const selectedIndex = pickRandomIndex(c)
            selectedIndex !== undefined && selectedIndexes.push(selectedIndex)
            selectedIndex === undefined && undefinedCount++
        }

        undefinedCount.should.equal(0)

        c.forEach((chance, index) => {
            const filtered = selectedIndexes.filter(si => si === index)
            const count = filtered.length
            const pct = chance / 10000

            const min = Math.floor(iterations * (pct * 0.9))
            const max = Math.ceil(iterations * (pct * 1.10))

            if (chance == 0) {
                count.should.equal(0)
            } else {
                count.should.be.above(min).and.below(max)
            }
        })
    }))


    it('should pick an index in a list of 10 rarities with a 10% error margin, step not required', () => {
        const rarities = [0, 0, 333, 666, 5667, 0, 500, 0, 334, 500]
        const selectedIndexes: number[] = []
        const iterations = 100000
        let undefinedCount = 0
        const undefinedRarity = 10000 - rarities.reduce((a,v) => a+v, 0)

        for (let i = 0; i < iterations; i++) {
            const selectedIndex = pickRandomIndex(rarities)
            selectedIndex && selectedIndexes.push(selectedIndex)
            !selectedIndex && undefinedCount++
        }

        const minUndefined = Math.floor(iterations * ((undefinedRarity / 10000) * 0.9))
        const maxUndefined = Math.ceil(iterations * ((undefinedRarity/ 10000) * 1.10))

        undefinedCount.should.be.above(minUndefined).and.below(maxUndefined)

        rarities.forEach((rarity, index) => {
            const filtered = selectedIndexes.filter(si => si === index)
            const count = filtered.length
            const pct = rarity / 10000

            const min = Math.floor(iterations * (pct * 0.9))
            const max = Math.ceil(iterations * (pct * 1.10))

            if (rarity == 0) {
                count.should.equal(0)
            } else {
                count.should.be.above(min).and.below(max)
            }
        })
    })
})