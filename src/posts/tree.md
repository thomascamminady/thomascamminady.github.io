# Tree

```js
const gods = [
    "Jagadish/Nayana",
    "Jagadish/Chaitra",
    "Veena/Nayana",
]
```

```js
Plot.plot({
    axis: null,
    height: 100,
    margin: 10,
    marginLeft: 200,
    marginRight: 120,
    marks: [
        Plot.cluster(gods, {
            textStroke: "white"
        })
    ]
})
```
