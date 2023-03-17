let arr = [
    {
        text: "Go away 2",
        order: 3
    },
    {
        text: "Go away 1",
        order: 2
    }

]
let sum = arr.filter((el) => el.text !== "Go away 1")

console.log(sum)