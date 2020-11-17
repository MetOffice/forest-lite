import {
    fromList,
    moveBackward,
    moveForward,
    toList,
    goToIndex,
} from "../src/zipper.js"


describe("Zipper", () => {
    test("init", () => {
        let zip = fromList([1, 2, 3])
        expect(zip).toEqual({
            before: [], current: 1, after: [2, 3]
        })
    })

    test("backward", () => {
        let zip = fromList([1, 2, 3])
        zip = moveBackward(zip)
        expect(zip).toEqual({
            before: [1, 2], current: 3, after: []
        })
    })

    test("forward then backward", () => {
        let zip = fromList([1, 2, 3])
        zip = moveForward(zip)
        zip = moveBackward(zip)
        expect(zip).toEqual({
            before: [], current: 1, after: [2, 3]
        })
    })

    test("backward multiple times", () => {
        let zip = fromList([1, 2, 3])
        zip = moveBackward(zip)
        zip = moveBackward(zip)
        expect(zip).toEqual({
            before: [1], current: 2, after: [3]
        })
    })

    test("forward", () => {
        let zip = fromList([1, 2, 3])
        zip = moveForward(zip)
        expect(zip).toEqual({
            before: [1], current: 2, after: [3]
        })
    })

    test("forward twice", () => {
        let zip = fromList([1, 2, 3])
        zip = moveForward(zip)
        zip = moveForward(zip)
        expect(zip).toEqual({
            before: [1, 2], current: 3, after: []
        })
    })

    test("forward past end", () => {
        let zip = fromList([1, 2, 3])
        zip = moveForward(zip)
        zip = moveForward(zip)
        zip = moveForward(zip)
        expect(zip).toEqual({
            before: [], current: 1, after: [2, 3]
        })
    })

    test("forward 5 times", () => {
        let zip = fromList([1, 2, 3])
        zip = moveForward(zip)
        zip = moveForward(zip)
        zip = moveForward(zip)
        zip = moveForward(zip)
        zip = moveForward(zip)
        expect(zip).toEqual({
            before: [1, 2], current: 3, after: []
        })
    })

    test("forward size one zipper", () => {
        let zip = fromList([1])
        zip = moveForward(zip)
        expect(zip).toEqual({
            before: [], current: 1, after: []
        })
    })

    test("toList", () => {
        const values = [1, 2, 3]
        let zip = fromList(values)
        zip = moveForward(zip)
        expect(toList(zip)).toEqual(values)
    })

    test("goToIndex at the end", () => {
        const values = ["a", "b", "c"]
        let zip = fromList(values)
        zip = goToIndex(2, zip)
        expect(zip).toEqual({
            before: ["a", "b"],
            current: "c",
            after: []
        })
    })

    test("goToIndex at the start", () => {
        const values = ["a", "b", "c"]
        let zip = fromList(values)
        zip = goToIndex(0, zip)
        expect(zip).toEqual({
            before: [],
            current: "a",
            after: ["b", "c"]
        })
    })
})
